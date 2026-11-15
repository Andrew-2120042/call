import type { PrismaClient } from "@calcom/prisma";
import type { AttendeeConfirmationStatus, BookingStatus } from "@calcom/prisma/enums";
import { WaitlistEntryStatus } from "@calcom/prisma/enums";

export class TeamInsightsRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  /** The team's own services plus members' copies of its managed services. */
  async listTeamEventTypeIds(teamId: number): Promise<number[]> {
    const eventTypes = await this.prismaClient.eventType.findMany({
      where: { OR: [{ teamId }, { parent: { teamId } }] },
      select: { id: true },
    });
    return eventTypes.map((e) => e.id);
  }

  async countBookingsByHostAndStatus({ eventTypeIds, since }: { eventTypeIds: number[]; since: Date }) {
    if (!eventTypeIds.length) return [];
    const rows = await this.prismaClient.booking.groupBy({
      by: ["userId", "status"],
      where: { eventTypeId: { in: eventTypeIds }, createdAt: { gte: since } },
      _count: { _all: true },
    });
    return rows.map((r) => ({ userId: r.userId, status: r.status as BookingStatus, count: r._count._all }));
  }

  async listClaimedWaitlistSlots({ eventTypeIds, since }: { eventTypeIds: number[]; since: Date }) {
    if (!eventTypeIds.length) return [];
    return this.prismaClient.waitlistEntry.findMany({
      where: {
        eventTypeId: { in: eventTypeIds },
        status: WaitlistEntryStatus.CLAIMED,
        updatedAt: { gte: since },
      },
      select: { startTime: true, endTime: true },
    });
  }

  async countWaiting(eventTypeIds: number[], now: Date) {
    if (!eventTypeIds.length) return 0;
    return this.prismaClient.waitlistEntry.count({
      where: {
        eventTypeId: { in: eventTypeIds },
        status: WaitlistEntryStatus.WAITING,
        startTime: { gt: now },
      },
    });
  }

  async countConfirmationsByStatus({ eventTypeIds, since }: { eventTypeIds: number[]; since: Date }) {
    if (!eventTypeIds.length) return [];
    const rows = await this.prismaClient.bookingAttendeeConfirmation.groupBy({
      by: ["status"],
      where: { requestedAt: { gte: since }, booking: { eventTypeId: { in: eventTypeIds } } },
      _count: { _all: true },
    });
    return rows.map((r) => ({ status: r.status as AttendeeConfirmationStatus, count: r._count._all }));
  }

  async listMembers(teamId: number) {
    const memberships = await this.prismaClient.membership.findMany({
      where: { teamId, accepted: true },
      select: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
    return memberships.map((m) => m.user);
  }
}
