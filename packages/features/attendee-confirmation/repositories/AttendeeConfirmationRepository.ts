import type { PrismaClient } from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";
import { AttendeeConfirmationStatus, BookingStatus } from "@calcom/prisma/enums";

const bookingSelect = {
  id: true,
  uid: true,
  title: true,
  startTime: true,
  endTime: true,
  status: true,
  userId: true,
  user: { select: { id: true, name: true, email: true, username: true, timeZone: true, locale: true } },
  attendees: {
    select: { name: true, email: true, timeZone: true, locale: true },
    orderBy: { id: "asc" },
    take: 1,
  },
  eventType: {
    select: { id: true, title: true, attendeeConfirmationHours: true, releaseUnconfirmedBookings: true },
  },
} satisfies Prisma.BookingSelect;

export type ConfirmationBooking = Prisma.BookingGetPayload<{ select: typeof bookingSelect }>;

const confirmationSelect = {
  id: true,
  bookingId: true,
  status: true,
  deadline: true,
  confirmedAt: true,
  booking: { select: bookingSelect },
} satisfies Prisma.BookingAttendeeConfirmationSelect;

export type ConfirmationRecord = Prisma.BookingAttendeeConfirmationGetPayload<{
  select: typeof confirmationSelect;
}>;

export class AttendeeConfirmationRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  /** Accepted upcoming bookings whose service asks for confirmation and that haven't been asked yet. */
  async findBookingsAwaitingRequest(params: { now: Date; latestStart: Date }) {
    return this.prismaClient.booking.findMany({
      where: {
        status: BookingStatus.ACCEPTED,
        startTime: { gt: params.now, lte: params.latestStart },
        attendeeConfirmation: null,
        eventType: { attendeeConfirmationHours: { not: null } },
      },
      select: bookingSelect,
      orderBy: { startTime: "asc" },
      take: 500,
    });
  }

  async createRequest(data: { bookingId: number; tokenHash: string; deadline: Date }) {
    try {
      await this.prismaClient.bookingAttendeeConfirmation.create({ data });
      return true;
    } catch (error) {
      // Unique bookingId: another worker already created the request for this booking.
      if ((error as { code?: string }).code === "P2002") return false;
      throw error;
    }
  }

  async findOverdueRequests(now: Date) {
    return this.prismaClient.bookingAttendeeConfirmation.findMany({
      where: { status: AttendeeConfirmationStatus.REQUESTED, deadline: { lte: now } },
      select: confirmationSelect,
      take: 500,
    });
  }

  async findByTokenHash(tokenHash: string) {
    return this.prismaClient.bookingAttendeeConfirmation.findUnique({
      where: { tokenHash },
      select: confirmationSelect,
    });
  }

  async transition(params: {
    id: number;
    from: AttendeeConfirmationStatus;
    data: Prisma.BookingAttendeeConfirmationUpdateManyMutationInput;
  }): Promise<boolean> {
    const result = await this.prismaClient.bookingAttendeeConfirmation.updateMany({
      where: { id: params.id, status: params.from },
      data: params.data,
    });
    return result.count === 1;
  }
}

export type IAttendeeConfirmationRepository = Pick<
  AttendeeConfirmationRepository,
  "findBookingsAwaitingRequest" | "createRequest" | "findOverdueRequests" | "findByTokenHash" | "transition"
>;
