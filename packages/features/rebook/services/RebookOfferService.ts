import dayjs from "@calcom/dayjs";
import { BookingStatus } from "@calcom/prisma/enums";
import type { RebookRepository } from "../repositories/RebookRepository";
import type { RebookSuggestionService } from "./RebookSuggestionService";

const SEARCH_DAYS = 14;

export type RebookOfferEmail = {
  to: { name: string; email: string; timeZone: string; locale: string | null };
  hostName: string;
  serviceTitle: string;
  startTime: Date;
  bookUrl: string;
  moreTimesUrl: string;
  followUp?: boolean;
};

export type RebookOfferResult = { sent: true; start: string } | { sent: false; reason: string };

/**
 * The "retention" email: shortly after a client cancels, offer them one good open time with the same host
 * (picked the same way the cancel page picks), plus a link to every other time.
 */
export class RebookOfferService {
  constructor(
    private readonly deps: {
      repository: Pick<
        RebookRepository,
        "findByUidIncludeEventTypeAndAttendee" | "hasUpcomingByAttendeeEmailAndUserId"
      >;
      suggestions: Pick<RebookSuggestionService, "suggest">;
      findOpenTimes: (params: {
        eventTypeId: number;
        timeZone: string;
        from: Date;
        to: Date;
      }) => Promise<string[]>;
      send: (email: RebookOfferEmail) => Promise<void>;
      /** Whether the host's plan includes the later follow-up email. */
      isFollowUpEntitled: (userId: number) => Promise<boolean>;
      appUrl: string;
    }
  ) {}

  async offer(
    bookingUid: string,
    now = new Date(),
    options: { followUp?: boolean } = {}
  ): Promise<RebookOfferResult> {
    const booking = await this.deps.repository.findByUidIncludeEventTypeAndAttendee(bookingUid);
    const attendee = booking?.attendees[0];
    if (!booking || !attendee || !booking.eventType || !booking.userId)
      return { sent: false, reason: "not found" };
    if (booking.status !== BookingStatus.CANCELLED || booking.rescheduled)
      return { sent: false, reason: "not cancelled" };

    if (options.followUp && !(await this.deps.isFollowUpEntitled(booking.userId))) {
      return { sent: false, reason: "follow-up needs Pro" };
    }

    // They may have rebooked on their own from the cancel page in the meantime.
    const alreadyRebooked = await this.deps.repository.hasUpcomingByAttendeeEmailAndUserId({
      email: attendee.email,
      userId: booking.userId,
      after: now,
    });
    if (alreadyRebooked) return { sent: false, reason: "already rebooked" };

    const timeZone = attendee.timeZone;
    const candidates = await this.deps.findOpenTimes({
      eventTypeId: booking.eventType.id,
      timeZone,
      from: now,
      to: dayjs(now).add(SEARCH_DAYS, "day").toDate(),
    });
    const result = await this.deps.suggestions.suggest({ bookingUid, candidates, timeZone, now });
    const best = result.suggestions[0];
    if (!best) return { sent: false, reason: "no open times" };

    await this.deps.send({
      to: { name: attendee.name, email: attendee.email, timeZone, locale: attendee.locale },
      hostName: booking.user?.name || booking.user?.username || "",
      serviceTitle: booking.eventType.title,
      startTime: new Date(best.start),
      // The cancel page with this time already picked: the client only has to press Confirm.
      bookUrl: `${this.deps.appUrl}/booking/${booking.uid}?rebook=${encodeURIComponent(best.start)}`,
      moreTimesUrl: `${this.deps.appUrl}/booking/${booking.uid}`,
      followUp: options.followUp,
    });
    return { sent: true, start: best.start };
  }
}
