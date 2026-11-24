import type { PrismaClient } from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";
import { AttendeeConfirmationStatus, BookingStatus, WaitlistEntryStatus } from "@calcom/prisma/enums";

export const REBOOK_SOURCE = "rebook";

export type SavedSession = { bookingId: number; eventTypeId: number | null; via: "waitlist" | "rebook" };
export type ServiceOption = { id: number; title: string };

// A saved session only counts while it's still going ahead; one that was cancelled again saved nothing.
const STILL_ON = [BookingStatus.ACCEPTED, BookingStatus.PENDING];

export class MoneySavedRepository {
  constructor(private prismaClient: PrismaClient) {}

  async findSavedSessionsSince(userId: number, since: Date): Promise<SavedSession[]> {
    const claimed = await this.prismaClient.waitlistEntry.findMany({
      where: { status: WaitlistEntryStatus.CLAIMED, claimedBookingId: { not: null }, updatedAt: { gte: since }, eventType: { userId } },
      select: { claimedBookingId: true },
    });
    const claimedIds = claimed.map((c) => c.claimedBookingId).filter((id): id is number => id !== null);
    const [waitlistBookings, rebooked] = await Promise.all([
      claimedIds.length
        ? this.prismaClient.booking.findMany({
            where: { id: { in: claimedIds }, status: { in: STILL_ON } },
            select: { id: true, eventTypeId: true },
          })
        : Promise.resolve([]),
      this.prismaClient.booking.findMany({
        where: {
          userId,
          createdAt: { gte: since },
          status: { in: STILL_ON },
          metadata: { path: ["calbeeSource"], equals: REBOOK_SOURCE },
        },
        select: { id: true, eventTypeId: true },
      }),
    ]);
    return [
      ...waitlistBookings.map((b) => ({ bookingId: b.id, eventTypeId: b.eventTypeId, via: "waitlist" as const })),
      ...rebooked.map((b) => ({ bookingId: b.id, eventTypeId: b.eventTypeId, via: "rebook" as const })),
    ];
  }

  countCaughtNoShowsSince(userId: number, since: Date): Promise<number> {
    return this.prismaClient.bookingAttendeeConfirmation.count({
      where: { status: AttendeeConfirmationStatus.MISSED, resolvedAt: { gte: since }, booking: { userId } },
    });
  }

  findServices(userId: number): Promise<ServiceOption[]> {
    return this.prismaClient.eventType.findMany({
      where: { userId, teamId: null },
      select: { id: true, title: true },
      orderBy: { position: "desc" },
    });
  }

  async findServicePrices(userId: number): Promise<Record<string, number>> {
    const user = await this.prismaClient.user.findUnique({ where: { id: userId }, select: { metadata: true } });
    const prices = (user?.metadata as Prisma.JsonObject | null)?.calbeeServicePrices;
    if (!prices || typeof prices !== "object" || Array.isArray(prices)) return {};
    const out: Record<string, number> = {};
    for (const [id, value] of Object.entries(prices)) if (typeof value === "number" && value > 0) out[id] = value;
    return out;
  }

  async saveServicePrices(userId: number, prices: Record<string, number>): Promise<void> {
    const user = await this.prismaClient.user.findUnique({ where: { id: userId }, select: { metadata: true } });
    const metadata: Prisma.JsonObject = { ...((user?.metadata as Prisma.JsonObject | null) ?? {}) };
    metadata.calbeeServicePrices = prices;
    delete metadata.calbeeSessionValue;
    await this.prismaClient.user.update({ where: { id: userId }, data: { metadata } });
  }
}
