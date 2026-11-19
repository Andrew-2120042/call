import dayjs from "@calcom/dayjs";
import type { IAssistantInbox } from "@calcom/features/assistant/lib/types";
import { getWaitlistService } from "@calcom/features/waitlist/lib/getWaitlistService";
import { prisma } from "@calcom/prisma";
import { BookingReportReason, BookingStatus, WaitlistEntryStatus } from "@calcom/prisma/enums";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import { confirmHandler } from "../bookings/confirm.handler";
import { reportBookingHandler } from "../bookings/reportBooking.handler";

export type AssistantCtx = Parameters<typeof confirmHandler>[0]["ctx"] & {
  user: NonNullable<TrpcSessionUser>;
};

/**
 * The assistant's view of requests and the waitlist. Every lookup is limited to the signed-in owner, and the
 * changes go through the same handlers as the buttons in the app, so permissions and emails stay identical.
 */
export function createAssistantInbox(ctx: AssistantCtx): IAssistantInbox {
  const userId = ctx.user.id;
  const timeZone = ctx.user.timeZone;
  const when = (date: Date) => dayjs(date).tz(timeZone).format("ddd D MMM, h:mma");

  const findOwnBooking = (bookingUid: string, status?: BookingStatus) =>
    prisma.booking.findFirst({
      where: { uid: bookingUid, userId, ...(status ? { status } : {}) },
      select: { id: true, recurringEventId: true, attendees: { select: { name: true }, take: 1 } },
    });

  return {
    async listRequests() {
      const rows = await prisma.booking.findMany({
        where: { userId, status: BookingStatus.PENDING, startTime: { gte: new Date() } },
        orderBy: { startTime: "asc" },
        take: 50,
        select: {
          uid: true,
          startTime: true,
          eventType: { select: { title: true } },
          attendees: { select: { name: true, email: true }, take: 1 },
          requestInsight: { select: { fit: true, spamLikely: true, summary: true } },
        },
      });
      return rows.map((row) => ({
        bookingUid: row.uid,
        name: row.attendees[0]?.name ?? "",
        email: row.attendees[0]?.email ?? "",
        service: row.eventType?.title ?? "",
        start: when(row.startTime),
        fit: row.requestInsight?.fit ?? null,
        spamLikely: row.requestInsight?.spamLikely ?? false,
        summary: row.requestInsight?.summary ?? null,
      }));
    },

    async decideRequest(bookingUid, accept, reason) {
      const booking = await findOwnBooking(bookingUid, BookingStatus.PENDING);
      if (!booking) return null;
      await confirmHandler({
        ctx,
        input: {
          bookingId: booking.id,
          confirmed: accept,
          reason,
          emailsEnabled: true,
          recurringEventId: booking.recurringEventId ?? undefined,
        },
      });
      return { name: booking.attendees[0]?.name ?? "" };
    },

    async reportSpam(bookingUid) {
      const booking = await findOwnBooking(bookingUid);
      if (!booking) return null;
      await reportBookingHandler({ ctx, input: { bookingUid, reason: BookingReportReason.SPAM } });
      return { name: booking.attendees[0]?.name ?? "" };
    },

    async listWaitlist() {
      const rows = await prisma.waitlistEntry.findMany({
        where: {
          eventType: { userId },
          status: { in: [WaitlistEntryStatus.WAITING, WaitlistEntryStatus.OFFERED] },
          startTime: { gte: new Date() },
        },
        orderBy: [{ startTime: "asc" }, { createdAt: "asc" }],
        take: 100,
        select: {
          uid: true,
          name: true,
          email: true,
          status: true,
          startTime: true,
          eventTypeId: true,
          eventType: { select: { title: true } },
        },
      });
      const seen = new Map<string, number>();
      return rows.map((row) => {
        const key = `${row.eventTypeId}-${row.startTime.toISOString()}`;
        const place = (seen.get(key) ?? 0) + 1;
        seen.set(key, place);
        return {
          entryUid: row.uid,
          name: row.name,
          email: row.email,
          service: row.eventType.title,
          wants: when(row.startTime),
          status: row.status === WaitlistEntryStatus.OFFERED ? "offered the time" : "waiting",
          placeInLine: place,
        };
      });
    },

    async removeFromWaitlist(entryUid) {
      const entry = await prisma.waitlistEntry.findFirst({
        where: { uid: entryUid, eventType: { userId } },
        select: { name: true },
      });
      if (!entry) return null;
      await getWaitlistService().removeForHost({ userId, uid: entryUid });
      return { name: entry.name };
    },
  };
}
