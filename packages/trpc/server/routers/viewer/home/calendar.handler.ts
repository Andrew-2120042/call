import dayjs from "@calcom/dayjs";
import { prisma } from "@calcom/prisma";
import { BookingStatus, WaitlistEntryStatus } from "@calcom/prisma/enums";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import type { THomeCalendarInput } from "./calendar.schema";

type Options = { ctx: { user: NonNullable<TrpcSessionUser> }; input: THomeCalendarInput };

const SHOWN = [BookingStatus.ACCEPTED, BookingStatus.PENDING];

/** Everything on the host's month at a glance: bookings and requests per day, and how many people wait for each day. */
export const calendarHandler = async ({ ctx, input }: Options) => {
  const userId = ctx.user.id;
  const timeZone = ctx.user.timeZone;
  const monthStart = dayjs.tz(`${input.month}-01`, timeZone).startOf("month");
  // The grid shows whole weeks, so include the days around the month too.
  const from = monthStart.startOf("week").subtract(1, "day").toDate();
  const to = monthStart.endOf("month").endOf("week").add(1, "day").toDate();

  const [bookings, waiting] = await Promise.all([
    prisma.booking.findMany({
      where: { userId, startTime: { gte: from, lt: to }, status: { in: SHOWN } },
      orderBy: { startTime: "asc" },
      take: 1000,
      select: {
        uid: true,
        title: true,
        startTime: true,
        status: true,
        eventType: { select: { title: true } },
        attendees: { select: { name: true }, take: 1 },
      },
    }),
    prisma.waitlistEntry.findMany({
      where: {
        eventType: { userId },
        status: { in: [WaitlistEntryStatus.WAITING, WaitlistEntryStatus.OFFERED] },
        startTime: { gte: from, lt: to },
      },
      select: { startTime: true },
      take: 2000,
    }),
  ]);

  const waitlistByDay: Record<string, number> = {};
  for (const entry of waiting) {
    const day = dayjs(entry.startTime).tz(timeZone).format("YYYY-MM-DD");
    waitlistByDay[day] = (waitlistByDay[day] ?? 0) + 1;
  }

  return {
    timeZone,
    bookings: bookings.map((booking) => ({
      uid: booking.uid,
      day: dayjs(booking.startTime).tz(timeZone).format("YYYY-MM-DD"),
      time: dayjs(booking.startTime).tz(timeZone).format("h:mma"),
      attendeeName: booking.attendees[0]?.name ?? booking.title,
      isRequest: booking.status === BookingStatus.PENDING,
      service: booking.eventType?.title ?? "",
    })),
    waitlistByDay,
  };
};
