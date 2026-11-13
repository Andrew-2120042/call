import {
  createOfferToken,
  hashOfferToken,
  isWellFormedOfferToken,
} from "@calcom/features/waitlist/lib/offerToken";
import { AttendeeConfirmationStatus, BookingStatus } from "@calcom/prisma/enums";
import type {
  ConfirmationBooking,
  IAttendeeConfirmationRepository,
} from "../repositories/AttendeeConfirmationRepository";

const HOUR_MS = 60 * 60 * 1000;
/** The confirmation email goes out this long before the deadline. */
export const REQUEST_LEAD_HOURS = 24;
/** Upper bound for the per-service setting; also bounds the cron's candidate query. */
export const MAX_CONFIRMATION_HOURS = 168;

export interface IAttendeeConfirmationNotifier {
  sendRequest(params: { booking: ConfirmationBooking; confirmUrl: string; deadline: Date }): Promise<void>;
  sendMissedToHost(params: { booking: ConfirmationBooking; released: boolean }): Promise<void>;
}

export type ReleaseBooking = (booking: ConfirmationBooking) => Promise<void>;

export interface IAttendeeConfirmationServiceDeps {
  repository: IAttendeeConfirmationRepository;
  notifier: IAttendeeConfirmationNotifier;
  releaseBooking: ReleaseBooking;
  webappUrl: string;
  now?: () => Date;
  logger?: { error: (...args: unknown[]) => void };
}

export type ConfirmResult =
  | { ok: true; alreadyConfirmed: boolean }
  | { ok: false; reason: "invalid" | "deadline_passed" | "booking_cancelled" };

export const getConfirmationDeadline = (startTime: Date, hours: number) =>
  new Date(startTime.getTime() - hours * HOUR_MS);

export class AttendeeConfirmationService {
  private readonly now: () => Date;

  constructor(private readonly deps: IAttendeeConfirmationServiceDeps) {
    this.now = deps.now ?? (() => new Date());
  }

  /** Cron step 1: email attendees whose confirmation window has opened. */
  async sendDueRequests() {
    const now = this.now();
    const latestStart = new Date(now.getTime() + (MAX_CONFIRMATION_HOURS + REQUEST_LEAD_HOURS) * HOUR_MS);
    const candidates = await this.deps.repository.findBookingsAwaitingRequest({ now, latestStart });
    let sent = 0;
    for (const booking of candidates) {
      const hours = booking.eventType?.attendeeConfirmationHours;
      if (!hours || !booking.attendees[0]) continue;
      const deadline = getConfirmationDeadline(booking.startTime, hours);
      const opensAt = new Date(deadline.getTime() - REQUEST_LEAD_HOURS * HOUR_MS);
      // Bookings made after the deadline were just confirmed by the act of booking.
      if (now < opensAt || now >= deadline) continue;

      const { token, tokenHash } = createOfferToken();
      const created = await this.deps.repository.createRequest({
        bookingId: booking.id,
        tokenHash,
        deadline,
      });
      if (!created) continue;
      try {
        await this.deps.notifier.sendRequest({
          booking,
          deadline,
          confirmUrl: `${this.deps.webappUrl}/attendance/confirm/${token}`,
        });
        sent++;
      } catch (error) {
        this.deps.logger?.error("[attendee-confirmation] failed to send request", {
          bookingId: booking.id,
          error,
        });
      }
    }
    return { requestsSent: sent };
  }

  /** Cron step 2: handle attendees who let the deadline pass. */
  async processMissedDeadlines() {
    const now = this.now();
    const overdue = await this.deps.repository.findOverdueRequests(now);
    let released = 0;
    let hostsAlerted = 0;
    for (const record of overdue) {
      const stillBooked = record.booking.status === BookingStatus.ACCEPTED;
      const moved = await this.deps.repository.transition({
        id: record.id,
        from: AttendeeConfirmationStatus.REQUESTED,
        data: {
          status: stillBooked ? AttendeeConfirmationStatus.MISSED : AttendeeConfirmationStatus.CANCELLED,
          resolvedAt: now,
        },
      });
      if (!moved || !stillBooked) continue;

      const shouldRelease = !!record.booking.eventType?.releaseUnconfirmedBookings;
      let didRelease = false;
      if (shouldRelease) {
        try {
          await this.deps.releaseBooking(record.booking);
          didRelease = true;
          released++;
        } catch (error) {
          this.deps.logger?.error("[attendee-confirmation] failed to release booking", {
            bookingId: record.bookingId,
            error,
          });
        }
      }
      try {
        await this.deps.notifier.sendMissedToHost({ booking: record.booking, released: didRelease });
        hostsAlerted++;
      } catch (error) {
        this.deps.logger?.error("[attendee-confirmation] failed to alert host", {
          bookingId: record.bookingId,
          error,
        });
      }
    }
    return { missed: overdue.length, released, hostsAlerted };
  }

  async getByToken(token: string) {
    if (!isWellFormedOfferToken(token)) return null;
    return this.deps.repository.findByTokenHash(hashOfferToken(token));
  }

  async confirm(token: string): Promise<ConfirmResult> {
    const record = await this.getByToken(token);
    if (!record) return { ok: false, reason: "invalid" };
    if (record.status === AttendeeConfirmationStatus.CONFIRMED) return { ok: true, alreadyConfirmed: true };
    if (
      record.booking.status !== BookingStatus.ACCEPTED ||
      record.status === AttendeeConfirmationStatus.CANCELLED
    ) {
      return { ok: false, reason: "booking_cancelled" };
    }
    if (
      record.status !== AttendeeConfirmationStatus.REQUESTED ||
      record.deadline.getTime() <= this.now().getTime()
    ) {
      return { ok: false, reason: "deadline_passed" };
    }
    const moved = await this.deps.repository.transition({
      id: record.id,
      from: AttendeeConfirmationStatus.REQUESTED,
      data: { status: AttendeeConfirmationStatus.CONFIRMED, confirmedAt: this.now(), resolvedAt: this.now() },
    });
    if (moved) return { ok: true, alreadyConfirmed: false };
    // Lost a race: either another click confirmed it, or the deadline job marked it missed first.
    const latest = await this.getByToken(token);
    return latest?.status === AttendeeConfirmationStatus.CONFIRMED
      ? { ok: true, alreadyConfirmed: true }
      : { ok: false, reason: "deadline_passed" };
  }
}
