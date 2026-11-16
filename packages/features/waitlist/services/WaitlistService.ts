import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import type { Prisma } from "@calcom/prisma/client";
import {
  SchedulingType,
  WaitlistEntryKind,
  WaitlistEntryStatus,
  WaitlistOfferMode,
} from "@calcom/prisma/enums";
import { createOfferToken, hashOfferToken, isWellFormedOfferToken } from "../lib/offerToken";
import type {
  IWaitlistEntryRepository,
  WaitlistEntryRecord,
  WaitlistEventType,
} from "../repositories/WaitlistEntryRepository";

export const DEFAULT_OFFER_WINDOW_MINUTES = 120;
/** Offers for a time less than a day away get a shorter window so the line moves before the slot passes. */
export const SOON_OFFER_WINDOW_MINUTES = 30;
const SOON_MS = 24 * 60 * 60_000;
const MAX_DAY_RANGE_MS = 27 * 60 * 60_000;
const EVERYONE_OFFER_LIMIT = 200;

export type WaitlistJoinInput = {
  eventTypeId: number;
  /** EXACT_TIME (default): the taken time. ANY_TIME_ON_DAY: the start and end of that day. */
  kind?: typeof WaitlistEntryKind.EXACT_TIME | typeof WaitlistEntryKind.ANY_TIME_ON_DAY;
  startTime: Date;
  endTime: Date;
  name: string;
  email: string;
  timeZone: string;
  language: string;
  responses: Record<string, unknown>;
};

export type WaitlistOfferEmailData = {
  /** startTime/endTime are the offered time. */
  entry: WaitlistEntryRecord;
  eventType: WaitlistEventType;
  claimUrl: string;
  offerExpiresAt: Date;
  /** Everyone waiting got the same offer; the first to claim gets it. */
  firstComeFirstServed: boolean;
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
  /** Move this existing booking to the new time instead of creating a second one. */
  rescheduleUid?: string | null;
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
  | {
      ok: false;
      reason: "invalid" | "expired" | "already_claimed" | "slot_unavailable" | "taken_by_someone_else";
    };

export class WaitlistService {
  private readonly now: () => Date;
  private readonly offerWindowMs: number;

  constructor(private readonly deps: IWaitlistServiceDeps) {
    this.now = deps.now ?? (() => new Date());
    this.offerWindowMs = (deps.offerWindowMinutes ?? DEFAULT_OFFER_WINDOW_MINUTES) * 60_000;
  }

  async join(input: WaitlistJoinInput) {
    const eventType = await this.deps.repository.findEventTypeById(input.eventTypeId);
    const accountId = eventType ? payingAccountId(eventType) : null;
    if (!eventType || !eventType.waitlistEnabled || !accountId || !(await this.hostEntitled(accountId))) {
      throw new ErrorWithCode(ErrorCode.BadRequest, "This service doesn't have a waitlist");
    }

    const kind = input.kind ?? WaitlistEntryKind.EXACT_TIME;
    const isWholeDay = kind === WaitlistEntryKind.ANY_TIME_ON_DAY;
    if (isWholeDay) {
      const span = input.endTime.getTime() - input.startTime.getTime();
      if (span <= 0 || span > MAX_DAY_RANGE_MS) {
        throw new ErrorWithCode(ErrorCode.BadRequest, "Pick a single day to wait for");
      }
      if (input.endTime.getTime() <= this.now().getTime()) {
        throw new ErrorWithCode(ErrorCode.BadRequest, "This day has already passed");
      }
    } else {
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
      const slotTaken = await this.isSlotTaken(eventType, input.startTime, input.endTime);
      if (!slotTaken) {
        throw new ErrorWithCode(ErrorCode.BadRequest, "This time is still open, so you can book it directly");
      }
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
          kind,
          rangeStart: isWholeDay ? input.startTime : null,
          rangeEnd: isWholeDay ? input.endTime : null,
        });

    const position = await this.positionOf(entry);
    await this.notifySafely(() => this.deps.notifier.sendJoined({ entry, eventType, position }));
    return { entry, position, alreadyJoined: false };
  }

  /** Whether this service currently takes waitlist sign-ups (switched on, and the paying plan includes it). */
  async isOpenFor(eventTypeId: number) {
    const eventType = await this.deps.repository.findEventTypeById(eventTypeId);
    const accountId = eventType ? payingAccountId(eventType) : null;
    return !!eventType && eventType.waitlistEnabled && !!accountId && (await this.hostEntitled(accountId));
  }

  /**
   * "Tell me if anything earlier opens": the client already has a booking and wants to move it forward.
   * Name, email and answers come from that booking, so only someone holding its link can sign up.
   */
  async joinEarlier(input: { bookingUid: string; language?: string }) {
    const booking = await this.deps.repository.findBookingForEarlierWaitlist(input.bookingUid);
    if (!booking || !booking.isActive || !booking.eventTypeId || !booking.attendee) {
      throw new ErrorWithCode(ErrorCode.NotFound, "Booking not found");
    }
    const now = this.now();
    if (booking.startTime.getTime() <= now.getTime()) {
      throw new ErrorWithCode(ErrorCode.BadRequest, "This booking has already started");
    }
    const eventType = await this.deps.repository.findEventTypeById(booking.eventTypeId);
    const accountId = eventType ? payingAccountId(eventType) : null;
    if (!eventType || !eventType.waitlistEnabled || !accountId || !(await this.hostEntitled(accountId))) {
      throw new ErrorWithCode(ErrorCode.BadRequest, "This service doesn't have a waitlist");
    }

    const existing = await this.deps.repository.findEarlierEntryForBooking({
      eventTypeId: eventType.id,
      bookingUid: booking.uid,
    });
    if (
      existing &&
      (existing.status === WaitlistEntryStatus.WAITING || existing.status === WaitlistEntryStatus.OFFERED)
    ) {
      return { entry: existing, alreadyJoined: true };
    }

    const email = booking.attendee.email.trim().toLowerCase();
    const responses = {
      ...((booking.responses ?? {}) as Record<string, unknown>),
      name: booking.attendee.name,
      email,
    } as Prisma.InputJsonValue;
    const entry = await this.deps.repository.create({
      eventTypeId: eventType.id,
      startTime: now,
      endTime: booking.startTime,
      name: booking.attendee.name,
      email,
      timeZone: booking.attendee.timeZone,
      language: input.language ?? booking.attendee.locale ?? "en",
      responses,
      kind: WaitlistEntryKind.EARLIER_THAN_BOOKING,
      rangeStart: now,
      rangeEnd: booking.startTime,
      rescheduleBookingUid: booking.uid,
    });
    await this.notifySafely(() => this.deps.notifier.sendJoined({ entry, eventType, position: 0 }));
    return { entry, alreadyJoined: false };
  }

  /**
   * Called whenever a booking stops holding a slot (cancelled, rejected, moved). Offers the time to whoever
   * is waiting for it: one person at a time in join order (default), or everyone at once when the host chose
   * first come, first served. Nothing happens if the time is still taken, already offered, or in the past.
   */
  async offerFreedSlot(params: {
    eventTypeId: number;
    startTime: Date;
  }): Promise<WaitlistEntryRecord | null> {
    const now = this.now();
    if (params.startTime.getTime() <= now.getTime()) return null;

    const eventType = await this.deps.repository.findEventTypeById(params.eventTypeId);
    const accountId = eventType ? payingAccountId(eventType) : null;
    if (!eventType || !eventType.waitlistEnabled || !accountId) return null;
    if (!(await this.hostEntitled(accountId))) return null;

    const activeOffer = await this.deps.repository.findActiveOfferForSlot({
      eventTypeId: params.eventTypeId,
      startTime: params.startTime,
      now,
    });
    if (activeOffer) return null;

    const slotStart = params.startTime;
    const slotEnd = new Date(slotStart.getTime() + eventType.length * 60_000);
    if (await this.isSlotTaken(eventType, slotStart, slotEnd)) return null;

    const everyone = eventType.waitlistOfferMode === WaitlistOfferMode.EVERYONE;
    const candidates = await this.deps.repository.findWaitingForSlot({
      eventTypeId: params.eventTypeId,
      startTime: slotStart,
      limit: everyone ? EVERYONE_OFFER_LIMIT : 25,
    });

    const untilSlot = slotStart.getTime() - now.getTime();
    const windowMs = !everyone && untilSlot < SOON_MS ? Math.min(this.offerWindowMs, SOON_OFFER_WINDOW_MINUTES * 60_000) : this.offerWindowMs;
    // Never let an offer outlive the slot itself.
    const offerExpiresAt = new Date(Math.min(now.getTime() + windowMs, slotStart.getTime()));

    let first: WaitlistEntryRecord | null = null;
    for (const candidate of candidates) {
      if (!(await this.fitsEntry(candidate, slotStart, slotEnd))) continue;

      const { token, tokenHash } = createOfferToken();
      // Conditional, because another worker may offer this person something at the same moment.
      const moved = await this.deps.repository.transition({
        id: candidate.id,
        from: WaitlistEntryStatus.WAITING,
        data: {
          status: WaitlistEntryStatus.OFFERED,
          offerTokenHash: tokenHash,
          offeredAt: now,
          offerExpiresAt,
          offerStartTime: slotStart,
          offerEndTime: slotEnd,
        },
      });
      if (!moved) continue;

      const offered = {
        ...candidate,
        status: WaitlistEntryStatus.OFFERED,
        offeredAt: now,
        offerExpiresAt,
        offerStartTime: slotStart,
        offerEndTime: slotEnd,
      };
      await this.notifySafely(() =>
        this.deps.notifier.sendOffer({
          entry: withOfferedTime(offered),
          eventType,
          claimUrl: `${this.deps.webappUrl}/waitlist/claim/${token}`,
          offerExpiresAt,
          firstComeFirstServed: everyone,
        })
      );
      first ??= offered;
      if (!everyone) break;
    }
    return first;
  }

  /** Whether this opening really works for the entry (flexible entries are matched loosely by the query). */
  private async fitsEntry(entry: WaitlistEntryRecord, slotStart: Date, slotEnd: Date) {
    if (entry.kind !== WaitlistEntryKind.EARLIER_THAN_BOOKING) return true;
    if (!entry.rangeEnd || slotEnd.getTime() > entry.rangeEnd.getTime()) return false;
    // Their booking was cancelled or moved some other way: nothing left to move earlier.
    if (!entry.rescheduleBookingUid || !(await this.deps.repository.isBookingActive(entry.rescheduleBookingUid))) {
      await this.deps.repository.transition({
        id: entry.id,
        from: WaitlistEntryStatus.WAITING,
        data: { status: WaitlistEntryStatus.REMOVED },
      });
      return false;
    }
    return true;
  }

  /** Cron entry point: expire stale offers, pass each slot to the next person, drop past slots. */
  async processExpirations() {
    const now = this.now();
    const expired = await this.deps.repository.findExpiredOffers(now);
    let reoffered = 0;
    const freed = new Map<string, { eventTypeId: number; startTime: Date }>();
    for (const entry of expired) {
      const moved = await this.deps.repository.transition({
        id: entry.id,
        from: WaitlistEntryStatus.OFFERED,
        data: { status: WaitlistEntryStatus.EXPIRED, offerTokenHash: null },
      });
      if (!moved) continue;
      const startTime = entry.offerStartTime ?? entry.startTime;
      freed.set(`${entry.eventTypeId}|${startTime.toISOString()}`, { eventTypeId: entry.eventTypeId, startTime });
    }
    for (const slot of Array.from(freed.values())) {
      const offered = await this.offerFreedSlot(slot);
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
      entry: withOfferedTime(entry),
      eventType,
      isExpired,
      isClaimable: entry.status === WaitlistEntryStatus.OFFERED && !isExpired,
      takenBySomeoneElse: entry.status === WaitlistEntryStatus.WAITING,
    };
  }

  async claim(token: string): Promise<ClaimResult> {
    if (!isWellFormedOfferToken(token)) return { ok: false, reason: "invalid" };
    const entry = await this.deps.repository.findByOfferTokenHash(hashOfferToken(token));
    if (!entry) return { ok: false, reason: "invalid" };
    if (entry.status === WaitlistEntryStatus.CLAIMED) return { ok: false, reason: "already_claimed" };
    // A first-come offer someone else claimed first: they keep their place for the next opening.
    if (entry.status === WaitlistEntryStatus.WAITING) return { ok: false, reason: "taken_by_someone_else" };
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

    const slot = withOfferedTime(entry);
    try {
      const booking = await this.deps.createBooking({
        eventTypeId: entry.eventTypeId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        timeZone: entry.timeZone,
        language: entry.language,
        responses: (entry.responses ?? {}) as Record<string, unknown>,
        rescheduleUid:
          entry.kind === WaitlistEntryKind.EARLIER_THAN_BOOKING ? entry.rescheduleBookingUid : undefined,
      });
      await this.deps.repository.transition({
        id: entry.id,
        from: WaitlistEntryStatus.CLAIMED,
        data: { claimedBookingId: booking.id, offerTokenHash: null },
      });
      await this.closeOtherOffers(entry.eventTypeId, slot.startTime, entry.id);
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
          offerStartTime: null,
          offerEndTime: null,
        },
      });
      return { ok: false, reason: "slot_unavailable" };
    }
  }

  /**
   * First come, first served: once one person has the time, everyone else who got the same offer goes back
   * to waiting. Their token is kept so their link can say someone else was quicker.
   */
  private async closeOtherOffers(eventTypeId: number, startTime: Date, exceptId: number) {
    const others = await this.deps.repository.findOtherOffersForSlot({ eventTypeId, startTime, exceptId });
    for (const other of others) {
      await this.deps.repository.transition({
        id: other.id,
        from: WaitlistEntryStatus.OFFERED,
        data: {
          status: WaitlistEntryStatus.WAITING,
          offeredAt: null,
          offerExpiresAt: null,
          offerStartTime: null,
          offerEndTime: null,
        },
      });
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
          await this.offerFreedSlot({
            eventTypeId: entry.eventTypeId,
            startTime: entry.offerStartTime ?? entry.startTime,
          });
        }
        return { removed: true };
      }
    }
    return { removed: false };
  }

  /**
   * A personal service's time is taken when its owner is booked. A team round-robin time is taken only when
   * every host is booked; a collective time as soon as any host is.
   */
  private async isSlotTaken(eventType: WaitlistEventType, startTime: Date, endTime: Date) {
    const hostIds = eventType.userId ? [eventType.userId] : eventType.hostUserIds;
    if (!hostIds.length) return false;
    const busy = await this.deps.repository.countBusyHosts({ userIds: hostIds, startTime, endTime });
    const needsEveryoneBusy = !eventType.userId && eventType.schedulingType === SchedulingType.ROUND_ROBIN;
    return needsEveryoneBusy ? busy >= hostIds.length : busy > 0;
  }

  private async hostEntitled(userId: number) {
    return this.deps.isHostEntitled ? this.deps.isHostEntitled(userId) : true;
  }

  private async positionOf(entry: WaitlistEntryRecord) {
    if (entry.status !== WaitlistEntryStatus.WAITING) return 0;
    if (entry.kind === WaitlistEntryKind.EARLIER_THAN_BOOKING) return 0;
    const ahead = await this.deps.repository.countWaitingBefore({
      eventTypeId: entry.eventTypeId,
      startTime: entry.startTime,
      createdAt: entry.createdAt,
      kind: entry.kind,
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

/** Whose plan pays for this service's waitlist: the owner of a personal service, or the team's owner. */
function payingAccountId(eventType: WaitlistEventType) {
  return eventType.userId ?? eventType.team?.ownerId ?? null;
}

/** The time an entry is being offered, which for flexible entries isn't their own start and end. */
function withOfferedTime<T extends WaitlistEntryRecord>(entry: T): T {
  if (!entry.offerStartTime || !entry.offerEndTime) return entry;
  return { ...entry, startTime: entry.offerStartTime, endTime: entry.offerEndTime };
}
