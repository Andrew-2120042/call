import type { PrismaClient } from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";
import { BookingStatus } from "@calcom/prisma/enums";

const bookingSelect = {
  id: true,
  uid: true,
  title: true,
  startTime: true,
  createdAt: true,
  user: { select: { name: true, username: true } },
  attendees: { select: { name: true, email: true, timeZone: true, locale: true } },
  eventType: { select: { title: true, attendeeReminderMinutes: true } },
  remindersSent: { select: { minutesBefore: true } },
} satisfies Prisma.BookingSelect;

export type ReminderBooking = Prisma.BookingGetPayload<{ select: typeof bookingSelect }>;

export class AttendeeReminderRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async findUpcomingWithReminders(params: { now: Date; latestStart: Date }) {
    return this.prismaClient.booking.findMany({
      where: {
        status: BookingStatus.ACCEPTED,
        startTime: { gt: params.now, lte: params.latestStart },
        eventType: { attendeeReminderMinutes: { isEmpty: false } },
      },
      select: bookingSelect,
      orderBy: { startTime: "asc" },
      take: 1000,
    });
  }

  /** Returns false when this reminder was already recorded, which makes sending idempotent. */
  async recordSent(params: { bookingId: number; minutesBefore: number }) {
    try {
      await this.prismaClient.bookingReminderSent.create({ data: params });
      return true;
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") return false;
      throw error;
    }
  }
}

export type IAttendeeReminderRepository = Pick<
  AttendeeReminderRepository,
  "findUpcomingWithReminders" | "recordSent"
>;
