import dayjs from "@calcom/dayjs";
import { WEBAPP_URL } from "@calcom/lib/constants";
import { prisma } from "@calcom/prisma";
import { BookingStatus, WaitlistEntryStatus } from "@calcom/prisma/enums";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";

type Ctx = { ctx: { user: NonNullable<TrpcSessionUser> } };

const DAY_MS = 24 * 60 * 60 * 1000;
const CHART_WEEKS = 8;

export const getHandler = async ({ ctx }: Ctx) => {
  const userId = ctx.user.id;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
  const twoWeeksAgo = new Date(now.getTime() - 14 * DAY_MS);
  const madeBookings = [BookingStatus.ACCEPTED, BookingStatus.PENDING];

  const [user, domain, thisWeek, lastWeek, waitingApproval, waitlistCount, serviceCount, upcoming] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          username: true,
          avatarUrl: true,
          bio: true,
          defaultScheduleId: true,
        },
      }),
      prisma.customDomain.findUnique({ where: { userId }, select: { domain: true, verifiedAt: true } }),
      prisma.booking.count({
        where: { userId, createdAt: { gte: weekAgo }, status: { in: madeBookings } },
      }),
      prisma.booking.count({
        where: { userId, createdAt: { gte: twoWeeksAgo, lt: weekAgo }, status: { in: madeBookings } },
      }),
      prisma.booking.count({
        where: { userId, status: BookingStatus.PENDING, startTime: { gte: now } },
      }),
      prisma.waitlistEntry.count({
        where: {
          eventType: { userId },
          status: { in: [WaitlistEntryStatus.WAITING, WaitlistEntryStatus.OFFERED] },
          startTime: { gte: now },
        },
      }),
      prisma.eventType.count({ where: { userId, teamId: null, hidden: false } }),
      prisma.booking.findMany({
        where: { userId, startTime: { gte: now }, status: { in: madeBookings } },
        orderBy: { startTime: "asc" },
        take: 5,
        select: {
          uid: true,
          title: true,
          startTime: true,
          status: true,
          attendees: { select: { name: true }, take: 1 },
        },
      }),
    ]);

  const chartStart = dayjs(now).tz(ctx.user.timeZone).startOf("week").subtract(CHART_WEEKS - 1, "week");
  const monthAgo = new Date(now.getTime() - 30 * DAY_MS);
  const [calendarCount, everBooked, recentBookings, services, servicesBooked] = await Promise.all([
    prisma.credential.count({ where: { userId, type: { endsWith: "_calendar" } } }),
    prisma.booking.count({ where: { userId } }),
    prisma.booking.findMany({
      where: { userId, createdAt: { gte: chartStart.toDate() }, status: { in: madeBookings } },
      select: { createdAt: true, startTime: true },
      take: 5000,
    }),
    prisma.eventType.findMany({
      where: { userId, teamId: null },
      orderBy: [{ position: "desc" }, { id: "asc" }],
      take: 12,
      select: { id: true, title: true, slug: true, length: true, hidden: true, requiresConfirmation: true },
    }),
    prisma.booking.groupBy({
      by: ["eventTypeId"],
      where: { userId, createdAt: { gte: monthAgo }, status: { in: madeBookings } },
      _count: { _all: true },
    }),
  ]);

  // Bookings made per week (oldest first) and which weekdays people book, both in the host's time zone.
  const weekly = Array.from({ length: CHART_WEEKS }, (_, i) => ({
    weekStart: chartStart.add(i, "week").format("YYYY-MM-DD"),
    count: 0,
  }));
  const byWeekday = [0, 0, 0, 0, 0, 0, 0];
  for (const booking of recentBookings) {
    const created = dayjs(booking.createdAt).tz(ctx.user.timeZone);
    const index = created.diff(chartStart, "week");
    if (index >= 0 && index < CHART_WEEKS) weekly[index].count++;
    byWeekday[dayjs(booking.startTime).tz(ctx.user.timeZone).day()]++;
  }
  const bookedCount = new Map(servicesBooked.map((row) => [row.eventTypeId, row._count._all]));
  const setup = [
    { id: "photo", done: !!user?.avatarUrl, href: "/settings/my-account/profile" },
    { id: "bio", done: !!user?.bio?.trim(), href: "/settings/my-account/profile" },
    { id: "service", done: serviceCount > 0, href: "/event-types" },
    { id: "hours", done: !!user?.defaultScheduleId, href: "/availability" },
    { id: "calendar", done: calendarCount > 0, href: "/apps/categories/calendar" },
    { id: "first_booking", done: everBooked > 0, href: "/event-types" },
  ] as const;

  const pageUrl = domain?.verifiedAt ? `https://${domain.domain}` : `${WEBAPP_URL}/${user?.username ?? ""}`;

  return {
    name: user?.name ?? user?.username ?? "",
    avatarUrl: user?.avatarUrl ?? null,
    pageUrl,
    serviceCount,
    setup,
    bookingsThisWeek: thisWeek,
    bookingsLastWeek: lastWeek,
    waitingApproval,
    waitlistCount,
    weekly,
    byWeekday,
    services: services.map((service) => ({
      ...service,
      bookedLast30Days: bookedCount.get(service.id) ?? 0,
    })),
    upcoming: upcoming.map((booking) => ({
      uid: booking.uid,
      title: booking.title,
      startTime: booking.startTime,
      isRequest: booking.status === BookingStatus.PENDING,
      attendeeName: booking.attendees[0]?.name ?? null,
    })),
  };
};
