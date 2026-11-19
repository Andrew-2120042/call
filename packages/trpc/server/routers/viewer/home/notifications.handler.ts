import { prisma } from "@calcom/prisma";
import { BookingStatus, WaitlistEntryStatus } from "@calcom/prisma/enums";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";

type Options = { ctx: { user: NonNullable<TrpcSessionUser> } };

const WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

export type HostNotification = {
  id: string;
  kind: "request" | "booked" | "cancelled" | "waitlist";
  target: { kind: "booking" | "waitlist"; uid: string };
  name: string;
  service: string;
  startTime: Date;
  at: Date;
};

/** What happened on the host's page lately: new requests, new bookings, cancellations and people joining a waitlist. */
export const notificationsHandler = async ({ ctx }: Options) => {
  const userId = ctx.user.id;
  const since = new Date(Date.now() - WINDOW_MS);

  const [bookings, cancelled, waitlist, pendingCount] = await Promise.all([
    prisma.booking.findMany({
      where: {
        userId,
        createdAt: { gte: since },
        status: { in: [BookingStatus.ACCEPTED, BookingStatus.PENDING] },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        uid: true,
        status: true,
        createdAt: true,
        startTime: true,
        recurringEventId: true,
        eventType: { select: { title: true } },
        attendees: { select: { name: true }, take: 1 },
      },
    }),
    prisma.booking.findMany({
      where: {
        userId,
        status: BookingStatus.CANCELLED,
        updatedAt: { gte: since },
        startTime: { gte: since },
      },
      orderBy: { updatedAt: "desc" },
      take: 15,
      select: {
        uid: true,
        updatedAt: true,
        startTime: true,
        eventType: { select: { title: true } },
        attendees: { select: { name: true }, take: 1 },
      },
    }),
    prisma.waitlistEntry.findMany({
      where: { eventType: { userId }, createdAt: { gte: since }, status: WaitlistEntryStatus.WAITING },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        uid: true,
        name: true,
        createdAt: true,
        startTime: true,
        eventType: { select: { title: true } },
      },
    }),
    prisma.booking.count({
      where: { userId, status: BookingStatus.PENDING, startTime: { gte: new Date() } },
    }),
  ]);

  // A weekly series is one event for the host, so only its first session is listed.
  const seenSeries = new Set<string>();
  const items: HostNotification[] = [];
  for (const booking of bookings) {
    if (booking.recurringEventId) {
      if (seenSeries.has(booking.recurringEventId)) continue;
      seenSeries.add(booking.recurringEventId);
    }
    items.push({
      id: `b-${booking.uid}`,
      kind: booking.status === BookingStatus.PENDING ? "request" : "booked",
      target: { kind: "booking", uid: booking.uid },
      name: booking.attendees[0]?.name ?? "",
      service: booking.eventType?.title ?? "",
      startTime: booking.startTime,
      at: booking.createdAt,
    });
  }
  for (const booking of cancelled) {
    items.push({
      id: `c-${booking.uid}`,
      kind: "cancelled",
      target: { kind: "booking", uid: booking.uid },
      name: booking.attendees[0]?.name ?? "",
      service: booking.eventType?.title ?? "",
      startTime: booking.startTime,
      at: booking.updatedAt ?? booking.startTime,
    });
  }
  for (const entry of waitlist) {
    items.push({
      id: `w-${entry.uid}`,
      kind: "waitlist",
      target: { kind: "waitlist", uid: entry.uid },
      name: entry.name,
      service: entry.eventType.title,
      startTime: entry.startTime,
      at: entry.createdAt,
    });
  }
  items.sort((a, b) => b.at.getTime() - a.at.getTime());
  return { items: items.slice(0, 30), pendingCount };
};
