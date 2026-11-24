import type { PrismaClient } from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";
import { AttendeeConfirmationStatus, WaitlistEntryStatus } from "@calcom/prisma/enums";

export const REBOOK_SOURCE = "rebook";

export type MoneySavedCounts = { refilled: number; rebooked: number; caught: number };

export class MoneySavedRepository {
  constructor(private prismaClient: PrismaClient) {}

  async countSince(userId: number, since: Date): Promise<MoneySavedCounts> {
    const [refilled, rebooked, caught] = await Promise.all([
      this.prismaClient.waitlistEntry.count({
        where: {
          status: WaitlistEntryStatus.CLAIMED,
          claimedBookingId: { not: null },
          updatedAt: { gte: since },
          eventType: { userId },
        },
      }),
      this.prismaClient.booking.count({
        where: { userId, createdAt: { gte: since }, metadata: { path: ["calbeeSource"], equals: REBOOK_SOURCE } },
      }),
      this.prismaClient.bookingAttendeeConfirmation.count({
        where: { status: AttendeeConfirmationStatus.MISSED, resolvedAt: { gte: since }, booking: { userId } },
      }),
    ]);
    return { refilled, rebooked, caught };
  }

  async findSessionValue(userId: number): Promise<number | null> {
    const user = await this.prismaClient.user.findUnique({ where: { id: userId }, select: { metadata: true } });
    const value = (user?.metadata as Record<string, unknown> | null)?.calbeeSessionValue;
    return typeof value === "number" && value > 0 ? value : null;
  }

  async saveSessionValue(userId: number, value: number | null): Promise<void> {
    const user = await this.prismaClient.user.findUnique({ where: { id: userId }, select: { metadata: true } });
    const metadata: Prisma.JsonObject = { ...((user?.metadata as Prisma.JsonObject | null) ?? {}) };
    if (value === null) delete metadata.calbeeSessionValue;
    else metadata.calbeeSessionValue = value;
    await this.prismaClient.user.update({ where: { id: userId }, data: { metadata } });
  }
}
