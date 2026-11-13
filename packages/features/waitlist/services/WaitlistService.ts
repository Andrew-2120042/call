import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import type { Prisma } from "@calcom/prisma/client";
import { WaitlistEntryStatus } from "@calcom/prisma/enums";
import { createOfferToken, hashOfferToken, isWellFormedOfferToken } from "../lib/offerToken";
import type {
  IWaitlistEntryRepository,
  WaitlistEntryRecord,
  WaitlistEventType,
} from "../repositories/WaitlistEntryRepository";

export const DEFAULT_OFFER_WINDOW_MINUTES = 120;

export type WaitlistJoinInput = {
  eventTypeId: number;
  startTime: Date;
  endTime: Date;
  name: string;
  email: string;
  timeZone: string;
  language: string;
  responses: Record<string, unknown>;
};

export type WaitlistOfferEmailData = {
  entry: WaitlistEntryRecord;
  eventType: WaitlistEventType;
  claimUrl: string;
  offerExpiresAt: Date;
};

export interface IWaitlistNotifier {
  sendJoined(params: {
    entry: WaitlistEntryRecord;
    eventType: WaitlistEventType;
    position: number;
  }): Promise<void>;
  sendOffer(params: WaitlistOfferEmailData): Promise<void>;
}

export type CreateBookingForClaim = (params: {
  eventTypeId: number;
  startTime: Date;
  endTime: Date;
  timeZone: string;
  language: string;
  responses: Record<string, unknown>;
}) => Promise<{ id: number; uid: string; status: string }>;

export interface IWaitlistServiceDeps {
  repository: IWaitlistEntryRepository;
  notifier: IWaitlistNotifier;
  createBooking: CreateBookingForClaim;
  webappUrl: string;
  now?: () => Date;
  offerWindowMinutes?: number;
  /** Whether the host's plan currently includes the waitlist; omitted means always allowed. */
  isHostEntitled?: (userId: number) => Promise<boolean>;
  logger?: { error: (...args: unknown[]) => void; info: (...args: unknown[]) => void };
}

export type ClaimResult =
  | { ok: true; bookingUid: string; bookingStatus: string }
  | { ok: false; reason: "invalid" | "expired" | "already_claimed" | "slot_unavailable" };

export class WaitlistService {
  private readonly now: () => Date;
  private readonly offerWindowMs: number;

  constructor(private readonly deps: IWaitlistServiceDeps) {
    this.now = deps.now ?? (() => new Date());
    this.offerWindowMs = (deps.offerWindowMinutes ?? DEFAULT_OFFER_WINDOW_MINUTES) * 60_000;
  }

  async join(input: WaitlistJoinInput) {
    const eventType = await this.deps.repository.findEventTypeById(input.eventTypeId);
    if (!eventType || !eventType.waitlistEnabled || !eventType.userId || !(await this.hostEntitled(eventType.userId))) {
      throw new ErrorWithCode(ErrorCode.BadRequest, "This service doesn't have a waitlist");
    }

    const durationMinutes = (input.endTime.getTime() - input.startTime.getTime()) / 60_000;
    if (durationMinutes !== eventType.length) {
      throw new ErrorWithCode(
        ErrorCode.BadRequest,
        `The time must be ${eventType.length} minutes long to match the service`
      );
    }
    if (input.startTime.getTime() <= this.now().getTime()) {
      throw new ErrorWithCode(ErrorCode.BadRequest, "This time has already passed");
    }

    const slotTaken = await this.deps.repository.hasBlockingBookingForHost({
      userId: eventType.userId,
      startTime: input.startTime,
      endTime: input.endTime,
    });
    if (!slotTaken) {
      throw new ErrorWithCode(ErrorCode.BadRequest, "This time is still open, so you can book it directly");
    }

    const email = input.email.trim().toLowerCase();
    const responses = { ...input.responses, name: input.name, email } as Prisma.InputJsonValue;
    const existing = await this.deps.repository.findByEventTypeStartAndEmail({
      eventTypeId: input.eventTypeId,
      startTime: input.startTime,
      email,
    });

    const isStillQueued =
      existing?.status === WaitlistEntryStatus.WAITING || existing?.status === WaitlistEntryStatus.OFFERED;
    if (existing && isStillQueued) {
      return { entry: existing, position: await this.positionOf(existing), alreadyJoined: true };
    }

    const entry = existing
      ? await this.deps.repository.rejoin(existing.id, {
          name: input.name,
          timeZone: input.timeZone,
          language: input.language,
          responses,
        })
      : await this.deps.repository.create({
          eventTypeId: input.eventTypeId,
          startTime: input.startTime,
          endTime: input.endTime,
          name: input.name,
          email,
          timeZone: input.timeZone,
          language: input.language,
          responses,
        });

    const position = await this.positionOf(entry);
    await this.notifySafely(() => this.deps.notifier.sendJoined({ entry, eventType, position }));
    return { entry, position, alreadyJoined: false };
  }

  /**
   * Called whenever a booking stops holding a slot (cancelled, rejected, moved). Offers the slot to the
   * earliest waiting person, unless the slot is still taken, already offered, or in the past.
   */
  async offerFreedSlot(params: {
    eventTypeId: number;
    startTime: Date;
  }): Promise<WaitlistEntryRecord | null> {
    const now = this.now();
    if (params.startTime.getTime() <= now.getTime()) return null;

    const eventType = await this.deps.repository.findEventTypeById(params.eventTypeId);
    if (!eventType || !eventType.waitlistEnabled || !eventType.userId) return null;
    if (!(await this.hostEntitled(eventType.userId))) return null;

    const activeOffer = await this.deps.repository.findActiveOfferForSlot({
      eventTypeId: params.eventTypeId,
      startTime: params.startTime,
      now,
    });
    if (activeOffer) return null;

    // Loop because another worker may grab the head of the queue between our read and our write.
    for (let attempt = 0; attempt < 5; attempt++) {
      const next = await this.deps.repository.findNextWaiting(params);
      if (!next) return null;

      const stillTaken = await this.deps.repository.hasBlockingBookingForHost({
        userId: eventType.userId,
        startTime: next.startTime,
        endTime: next.endTime,
      });
      if (stillTaken) return null;

      const { token, tokenHash } = createOfferToken();
      // Never let an offer outlive the slot itself.
      const offerExpiresAt = new Date(Math.min(now.getTime() + this.offerWindowMs, next.startTime.getTime()));
      const moved = await this.deps.repository.transition({
        id: next.id,
        from: WaitlistEntryStatus.WAITING,
        data: {
          status: WaitlistEntryStatus.OFFERED,
          offerTokenHash: tokenHash,
          offeredAt: now,
          offerExpiresAt,
        },
      });
      if (!moved) continue;

      const offered = { ...next, status: WaitlistEntryStatus.OFFERED, offeredAt: now, offerExpiresAt };
      await this.notifySafely(() =>
        this.deps.notifier.sendOffer({
          entry: offered,
          eventType,
          claimUrl: `${this.deps.webappUrl}/waitlist/claim/${token}`,
          offerExpiresAt,
        })
      );
      return offered;
    }
    return null;
  }

  /** Cron entry point: expire stale offers, pass each slot to the next person, drop past slots. */
  async processExpirations() {
    const now = this.now();
    const expired = await this.deps.repository.findExpiredOffers(now);
    let reoffered = 0;
    for (const entry of expired) {
      const moved = await this.deps.repository.transition({
        id: entry.id,
        from: WaitlistEntryStatus.OFFERED,
        data: { status: WaitlistEntryStatus.EXPIRED, offerTokenHash: null },
      });
      if (!moved) continue;
      const offered = await this.offerFreedSlot({
        eventTypeId: entry.eventTypeId,
        startTime: entry.startTime,
      });
      if (offered) reoffered++;
    }
    const pastSlotsExpired = await this.deps.repository.expireWaitingForPastSlots(now);
    return { offersExpired: expired.length, reoffered, pastSlotsExpired };
  }

  async getOffer(token: string) {
    if (!isWellFormedOfferToken(token)) return null;
    const entry = await this.deps.repository.findByOfferTokenHash(hashOfferToken(token));
    if (!entry) return null;
    const eventType = await this.deps.repository.findEventTypeById(entry.eventTypeId);
    if (!eventType) return null;
    const isExpired = !entry.offerExpiresAt || entry.offerExpiresAt.getTime() <= this.now().getTime();
    return {
      entry,
      eventType,
      isExpired,
      isClaimable: entry.status === WaitlistEntryStatus.OFFERED && !isExpired,
    };
  }

  async claim(token: string): Promise<ClaimResult> {
    if (!isWellFormedOfferToken(token)) return { ok: false, reason: "invalid" };
    const entry = await this.deps.repository.findByOfferTokenHash(hashOfferToken(token));
    if (!entry) return { ok: false, reason: "invalid" };
    if (entry.status === WaitlistEntryStatus.CLAIMED) return { ok: false, reason: "already_claimed" };
    if (entry.status !== WaitlistEntryStatus.OFFERED) return { ok: false, reason: "expired" };
    if (!entry.offerExpiresAt || entry.offerExpiresAt.getTime() <= this.now().getTime()) {
      return { ok: false, reason: "expired" };
    }

    // Lock the offer first so a double click or a second tab can't create two bookings.
    const locked = await this.deps.repository.transition({
      id: entry.id,
      from: WaitlistEntryStatus.OFFERED,
      data: { status: WaitlistEntryStatus.CLAIMED },
    });
    if (!locked) return { ok: false, reason: "already_claimed" };

    try {
      const booking = await this.deps.createBooking({
        eventTypeId: entry.eventTypeId,
        startTime: entry.startTime,
        endTime: entry.endTime,
        timeZone: entry.timeZone,
        language: entry.language,
        responses: (entry.responses ?? {}) as Record<string, unknown>,
      });
      await this.deps.repository.transition({
        id: entry.id,
        from: WaitlistEntryStatus.CLAIMED,
        data: { claimedBookingId: booking.id, offerTokenHash: null },
      });
      return { ok: true, bookingUid: booking.uid, bookingStatus: booking.status };
    } catch (error) {
      this.deps.logger?.error("[waitlist] claim failed, returning entry to the queue", {
        entryId: entry.id,
        error,
      });
      // The slot was taken again in the meantime: keep the person's place for the next opening.
      await this.deps.repository.transition({
        id: entry.id,
        from: WaitlistEntryStatus.CLAIMED,
        data: {
          status: WaitlistEntryStatus.WAITING,
          offerTokenHash: null,
          offeredAt: null,
          offerExpiresAt: null,
        },
      });
      return { ok: false, reason: "slot_unavailable" };
    }
  }

  async listForHost(userId: number) {
    return this.deps.repository.findForHost({
      userId,
      statuses: [WaitlistEntryStatus.WAITING, WaitlistEntryStatus.OFFERED],
      from: this.now(),
    });
  }

  async removeForHost(params: { userId: number; uid: string }) {
    const entry = await this.deps.repository.findByUidForHost(params);
    if (!entry) throw new ErrorWithCode(ErrorCode.NotFound, "Waitlist entry not found");
    for (const from of [WaitlistEntryStatus.WAITING, WaitlistEntryStatus.OFFERED]) {
      const moved = await this.deps.repository.transition({
        id: entry.id,
        from,
        data: { status: WaitlistEntryStatus.REMOVED, offerTokenHash: null },
      });
      if (moved) {
        // Removing someone holding an offer must not leave the slot unoffered.
        if (from === WaitlistEntryStatus.OFFERED) {
          await this.offerFreedSlot({ eventTypeId: entry.eventTypeId, startTime: entry.startTime });
        }
        return { removed: true };
      }
    }
    return { removed: false };
  }

  private async hostEntitled(userId: number) {
    return this.deps.isHostEntitled ? this.deps.isHostEntitled(userId) : true;
  }

  private async positionOf(entry: WaitlistEntryRecord) {
    if (entry.status !== WaitlistEntryStatus.WAITING) return 0;
    const ahead = await this.deps.repository.countWaitingBefore({
      eventTypeId: entry.eventTypeId,
      startTime: entry.startTime,
      createdAt: entry.createdAt,
    });
    return ahead + 1;
  }

  // Email failures must never undo a state change the person already relies on.
  private async notifySafely(send: () => Promise<void>) {
    try {
      await send();
    } catch (error) {
      this.deps.logger?.error("[waitlist] failed to send email", error);
    }
  }
}
