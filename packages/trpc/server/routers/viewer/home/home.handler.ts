import { WEBAPP_URL } from "@calcom/lib/constants";
import { prisma } from "@calcom/prisma";
import { BookingStatus, WaitlistEntryStatus } from "@calcom/prisma/enums";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";

type Ctx = { ctx: { user: NonNullable<TrpcSessionUser> } };

const DAY_MS = 24 * 60 * 60 * 1000;

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
        select: { name: true, username: true, avatarUrl: true },
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

  const pageUrl = domain?.verifiedAt ? `https://${domain.domain}` : `${WEBAPP_URL}/${user?.username ?? ""}`;

  return {
    name: user?.name ?? user?.username ?? "",
    avatarUrl: user?.avatarUrl ?? null,
    pageUrl,
    serviceCount,
    bookingsThisWeek: thisWeek,
    bookingsLastWeek: lastWeek,
    waitingApproval,
    waitlistCount,
    upcoming: upcoming.map((booking) => ({
      uid: booking.uid,
      title: booking.title,
      startTime: booking.startTime,
      isRequest: booking.status === BookingStatus.PENDING,
      attendeeName: booking.attendees[0]?.name ?? null,
    })),
  };
};
