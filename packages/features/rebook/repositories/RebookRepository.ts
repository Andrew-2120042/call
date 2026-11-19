import type { PrismaClient } from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";
import { BookingStatus } from "@calcom/prisma/enums";

const cancelledSelect = {
  uid: true,
  status: true,
  rescheduled: true,
  startTime: true,
  endTime: true,
  responses: true,
  cancellationReason: true,
  eventType: {
    select: { id: true, slug: true, title: true, length: true, teamId: true, bookingFields: true },
  },
  userId: true,
  user: { select: { username: true, name: true } },
  attendees: {
    select: { name: true, email: true, timeZone: true, locale: true },
    orderBy: { id: "asc" },
    take: 1,
  },
} satisfies Prisma.BookingSelect;

export type CancelledBooking = Prisma.BookingGetPayload<{ select: typeof cancelledSelect }>;

export class RebookRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async findByUidIncludeEventTypeAndAttendee(uid: string): Promise<CancelledBooking | null> {
    return this.prismaClient.booking.findUnique({ where: { uid }, select: cancelledSelect });
  }

  async hasUpcomingByAttendeeEmailAndUserId(params: { email: string; userId: number; after: Date }) {
    const found = await this.prismaClient.booking.findFirst({
      where: {
        userId: params.userId,
        startTime: { gt: params.after },
        status: { in: [BookingStatus.ACCEPTED, BookingStatus.PENDING] },
        attendees: { some: { email: { equals: params.email, mode: "insensitive" } } },
      },
      select: { id: true },
    });
    return !!found;
  }
}
