import dayjs from "@calcom/dayjs";
import type { AssistantBookingStatus, IAssistantInbox } from "@calcom/features/assistant/lib/types";
import type { CreateRegularBookingData } from "@calcom/features/bookings/lib/dto/types";
import handleCancelBooking from "@calcom/features/bookings/lib/handleCancelBooking";
import { getWaitlistService } from "@calcom/features/waitlist/lib/getWaitlistService";
import { prisma } from "@calcom/prisma";
import { WEBAPP_URL } from "@calcom/lib/constants";
import type { Prisma } from "@calcom/prisma/client";
import { BookingReportReason, BookingStatus, CreationSource, WaitlistEntryStatus } from "@calcom/prisma/enums";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import { confirmHandler } from "../bookings/confirm.handler";
import { reportBookingHandler } from "../bookings/reportBooking.handler";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// The furthest ahead the assistant may move a meeting; anything later is almost certainly a misread date.
const MAX_RESCHEDULE_DAYS_AHEAD = 180;

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

  // Owner-local "YYYY-MM-DD" bounds; `to` is inclusive of that whole day.
  const range = (from?: string, to?: string): Prisma.BookingWhereInput => ({
    ...(from ? { startTime: { gte: dayjs.tz(from, timeZone).startOf("day").toDate() } } : {}),
    ...(to ? { endTime: { lte: dayjs.tz(to, timeZone).endOf("day").toDate() } } : {}),
  });
  const byStatus = (status: AssistantBookingStatus): Prisma.BookingWhereInput => {
    const now = new Date();
    switch (status) {
      case "upcoming":
        return { endTime: { gte: now }, status: { in: [BookingStatus.ACCEPTED, BookingStatus.PENDING] } };
      case "past":
        return { endTime: { lt: now }, status: { in: [BookingStatus.ACCEPTED, BookingStatus.PENDING] } };
      case "unconfirmed":
        return { status: BookingStatus.PENDING, endTime: { gte: now } };
      case "cancelled":
        return { status: { in: [BookingStatus.CANCELLED, BookingStatus.REJECTED] } };
      default:
        return {};
    }
  };
  const asRecord = (value: Prisma.JsonValue | null): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};

  return {
    async listBookings({ status, from, to, limit }) {
      const where: Prisma.BookingWhereInput = { userId, ...byStatus(status) };
      const bounds = range(from, to);
      const rows = await prisma.booking.findMany({
        where: { AND: [where, bounds] },
        orderBy: { startTime: status === "past" || status === "cancelled" ? "desc" : "asc" },
        take: Math.min(Math.max(limit, 1), 100),
        select: {
          uid: true,
          title: true,
          startTime: true,
          endTime: true,
          status: true,
          eventType: { select: { title: true } },
          attendees: { select: { name: true, email: true }, take: 1 },
        },
      });
      return rows.map((row) => ({
        bookingUid: row.uid,
        title: row.title,
        service: row.eventType?.title ?? "",
        client: row.attendees[0]?.name ?? "",
        clientEmail: row.attendees[0]?.email ?? "",
        start: when(row.startTime),
        startIso: dayjs(row.startTime).tz(timeZone).format("YYYY-MM-DDTHH:mm"),
        minutes: dayjs(row.endTime).diff(row.startTime, "minute"),
        status: row.status.toLowerCase(),
      }));
    },

    async countBookings({ from, to }) {
      const bounds = range(from, to);
      const count = (status: AssistantBookingStatus) =>
        prisma.booking.count({ where: { AND: [{ userId, ...byStatus(status) }, bounds] } });
      const [total, upcoming, past, unconfirmed, cancelled] = await Promise.all([
        count("all"),
        count("upcoming"),
        count("past"),
        count("unconfirmed"),
        count("cancelled"),
      ]);
      return { total, upcoming, past, unconfirmed, cancelled, from: from ?? null, to: to ?? null };
    },

    async getAvailability() {
      const schedules = await prisma.schedule.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          timeZone: true,
          availability: { select: { days: true, startTime: true, endTime: true, date: true } },
        },
      });
      const defaultId = ctx.user.defaultScheduleId;
      const clock = (time: Date) => dayjs.utc(time).format("h:mma");
      return {
        timeZone,
        schedules: schedules.map((schedule) => ({
          name: schedule.name,
          isDefault: schedule.id === defaultId,
          weekly: schedule.availability
            .filter((slot) => !slot.date)
            .map(
              (slot) =>
                `${slot.days.map((day) => DAY_NAMES[day]).join(", ")}: ${clock(slot.startTime)}-${clock(slot.endTime)}`
            ),
          dateOverrides: schedule.availability
            .filter((slot) => slot.date)
            .map((slot) => `${dayjs.utc(slot.date).format("ddd D MMM")}: ${clock(slot.startTime)}-${clock(slot.endTime)}`),
        })),
      };
    },

    async rescheduleBooking(bookingUid, newStartLocal) {
      const booking = await prisma.booking.findFirst({
        where: {
          uid: bookingUid,
          userId,
          status: { in: [BookingStatus.ACCEPTED, BookingStatus.PENDING] },
          startTime: { gt: new Date() },
        },
        select: {
          uid: true,
          startTime: true,
          endTime: true,
          responses: true,
          recurringEventId: true,
          eventTypeId: true,
          eventType: { select: { slug: true } },
          attendees: { select: { name: true, email: true, timeZone: true }, take: 1 },
        },
      });
      if (!booking?.eventTypeId || !booking.eventType) {
        return { ok: false, error: "No upcoming booking with that id on this account." };
      }
      if (booking.recurringEventId) {
        return { ok: false, error: "This booking is part of a weekly series; move it from the Bookings page." };
      }
      const start = dayjs.tz(newStartLocal, timeZone);
      if (!start.isValid()) return { ok: false, error: "That new time isn't a valid date and time." };
      if (start.isBefore(dayjs().add(15, "minute"))) return { ok: false, error: "The new time has to be in the future." };
      if (start.isAfter(dayjs().add(MAX_RESCHEDULE_DAYS_AHEAD, "day"))) {
        return { ok: false, error: `The new time is more than ${MAX_RESCHEDULE_DAYS_AHEAD} days away.` };
      }
      const attendee = booking.attendees[0];
      const minutes = dayjs(booking.endTime).diff(booking.startTime, "minute");
      const responses = asRecord(booking.responses);
      // The same path as the host's "Reschedule" button: new time checked against availability, calendars
      // and both people's emails updated, old booking marked as rescheduled.
      const bookingData: CreateRegularBookingData & { responses: Record<string, unknown> } = {
        eventTypeId: booking.eventTypeId,
        eventTypeSlug: booking.eventType.slug,
        start: start.toISOString(),
        end: start.add(minutes, "minute").toISOString(),
        timeZone: attendee?.timeZone || timeZone,
        language: "en",
        user: ctx.user.username ?? undefined,
        metadata: {},
        responses: { ...responses, name: responses.name ?? attendee?.name, email: responses.email ?? attendee?.email },
        rescheduleUid: booking.uid,
        rescheduledBy: ctx.user.email,
        creationSource: CreationSource.WEBAPP,
      };
      try {
        // Loaded lazily, like the waitlist does: the booking service imports code that reaches back here.
        const { getRegularBookingService } = await import(
          "@calcom/features/bookings/di/RegularBookingService.container"
        );
        await getRegularBookingService().createBooking({
          bookingData,
          bookingMeta: { userId, hostname: new URL(WEBAPP_URL).host },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { ok: false, error: `Couldn't move it: ${message}` };
      }
      return { ok: true, name: attendee?.name ?? "", when: when(start.toDate()) };
    },

    async cancelBooking(bookingUid, reason) {
      const booking = await prisma.booking.findFirst({
        where: {
          uid: bookingUid,
          userId,
          status: { in: [BookingStatus.ACCEPTED, BookingStatus.PENDING] },
          startTime: { gt: new Date() },
        },
        select: { uid: true, attendees: { select: { name: true }, take: 1 } },
      });
      if (!booking) return { ok: false, error: "No upcoming booking with that id on this account." };
      try {
        await handleCancelBooking({
          bookingData: { uid: booking.uid, cancelledBy: ctx.user.email, cancellationReason: reason },
          userId,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { ok: false, error: `Couldn't cancel it: ${message}` };
      }
      return { ok: true, name: booking.attendees[0]?.name ?? "" };
    },

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
