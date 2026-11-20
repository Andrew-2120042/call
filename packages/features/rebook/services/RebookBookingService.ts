import { BookingStatus } from "@calcom/prisma/enums";
import type { CancelledBooking, RebookRepository } from "../repositories/RebookRepository";

// A cancelled booking can be rebooked in one click for this long; after that the normal booking page is used.
const REBOOK_WINDOW_DAYS = 60;

export type RebookBookingResult = { ok: true; uid: string } | { ok: false; reason: string };

export type CreateRebooking = (params: {
  eventTypeId: number;
  eventTypeSlug: string;
  username: string | null;
  start: Date;
  end: Date;
  timeZone: string;
  language: string;
  responses: Record<string, unknown>;
}) => Promise<{ uid: string }>;

/**
 * One-click rebooking from the cancel page or the rebook email: the client already gave their details on the
 * cancelled booking, so picking a time and confirming books it with those details, through the normal booking
 * flow (availability checks, calendar event, emails).
 */
export class RebookBookingService {
  constructor(
    private readonly deps: {
      repository: Pick<
        RebookRepository,
        "findByUidIncludeEventTypeAndAttendee" | "hasUpcomingByAttendeeEmailAndUserId"
      >;
      createBooking: CreateRebooking;
    }
  ) {}

  async book(params: { bookingUid: string; start: Date }, now = new Date()): Promise<RebookBookingResult> {
    const booking = await this.deps.repository.findByUidIncludeEventTypeAndAttendee(params.bookingUid);
    const attendee = booking?.attendees[0];
    if (!booking || !attendee || !booking.eventType || !booking.userId) return { ok: false, reason: "not_found" };
    if (booking.status !== BookingStatus.CANCELLED || booking.rescheduled) {
      return { ok: false, reason: "not_cancelled" };
    }
    if (booking.eventType.teamId) return { ok: false, reason: "team_event" };
    const windowEnd = booking.endTime.getTime() + REBOOK_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    if (now.getTime() > windowEnd) return { ok: false, reason: "too_late" };
    if (params.start.getTime() <= now.getTime()) return { ok: false, reason: "in_the_past" };

    // Stops a double click (or a second tab) from booking twice.
    const alreadyRebooked = await this.deps.repository.hasUpcomingByAttendeeEmailAndUserId({
      email: attendee.email,
      userId: booking.userId,
      after: now,
    });
    if (alreadyRebooked) return { ok: false, reason: "already_rebooked" };

    const minutes = booking.eventType.length;
    const created = await this.deps.createBooking({
      eventTypeId: booking.eventType.id,
      eventTypeSlug: booking.eventType.slug,
      username: booking.user?.username ?? null,
      start: params.start,
      end: new Date(params.start.getTime() + minutes * 60 * 1000),
      timeZone: attendee.timeZone,
      language: attendee.locale || "en",
      responses: responsesOf(booking, attendee),
    });
    return { ok: true, uid: created.uid };
  }
}

function responsesOf(
  booking: CancelledBooking,
  attendee: NonNullable<CancelledBooking["attendees"][number]>
): Record<string, unknown> {
  const stored =
    booking.responses && typeof booking.responses === "object" && !Array.isArray(booking.responses)
      ? { ...booking.responses }
      : {};
  return { ...stored, name: stored.name ?? attendee.name, email: stored.email ?? attendee.email };
}
