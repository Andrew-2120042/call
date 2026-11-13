import type { PrismaClient } from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";
import { type BookingRequestFit, BookingStatus } from "@calcom/prisma/enums";

const pendingSelect = {
  id: true,
  uid: true,
  userId: true,
  title: true,
  startTime: true,
  responses: true,
  eventType: { select: { title: true, description: true, bookingFields: true } },
} satisfies Prisma.BookingSelect;

export type PendingRequest = Prisma.BookingGetPayload<{ select: typeof pendingSelect }>;

export type InsightRecord = {
  summary: string;
  fit: BookingRequestFit;
  spamLikely: boolean;
  concerns: string[];
  suggestedReply: string;
  model: string;
};

export class BookingRequestInsightRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async findPendingWithoutInsight(params: { now: Date; createdAfter: Date; limit: number }) {
    return this.prismaClient.booking.findMany({
      where: {
        status: BookingStatus.PENDING,
        startTime: { gt: params.now },
        createdAt: { gte: params.createdAfter },
        requestInsight: null,
      },
      select: pendingSelect,
      orderBy: { createdAt: "asc" },
      take: params.limit,
    });
  }

  async save(bookingId: number, insight: InsightRecord) {
    try {
      await this.prismaClient.bookingRequestInsight.create({ data: { bookingId, ...insight } });
      return true;
    } catch (error) {
      // Another run already analysed this request.
      if ((error as { code?: string }).code === "P2002") return false;
      throw error;
    }
  }

  async findByBookingUidForHost(params: { bookingUid: string; userId: number }) {
    return this.prismaClient.bookingRequestInsight.findFirst({
      where: { booking: { uid: params.bookingUid, userId: params.userId } },
      select: {
        summary: true,
        fit: true,
        spamLikely: true,
        concerns: true,
        suggestedReply: true,
        createdAt: true,
      },
    });
  }
}

export type IBookingRequestInsightRepository = Pick<
  BookingRequestInsightRepository,
  "findPendingWithoutInsight" | "save" | "findByBookingUidForHost"
>;
