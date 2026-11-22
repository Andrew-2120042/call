import { AttendeeConfirmationStatus, BookingStatus } from "@calcom/prisma/enums";
import type { TeamInsightsRepository } from "../repositories/TeamInsightsRepository";

const DAY_MS = 24 * 60 * 60 * 1000;

export type TeamInsights = {
  periodDays: number;
  bookings: { accepted: number; pending: number; cancelled: number };
  perMember: { userId: number; name: string; avatarUrl: string | null; bookings: number; share: number }[];
  waitlist: { refilled: number; hoursRecovered: number; waitingNow: number };
  attendance: { confirmed: number; missed: number };
};

/** What the team got from Calbee over a period: who is busiest and how much time the waitlist saved. */
export class TeamInsightsService {
  constructor(
    private readonly repository: TeamInsightsRepository,
    private readonly now: () => Date = () => new Date()
  ) {}

  async get({ teamId, periodDays = 30 }: { teamId: number; periodDays?: number }): Promise<TeamInsights> {
    const now = this.now();
    const since = new Date(now.getTime() - periodDays * DAY_MS);
    const eventTypeIds = await this.repository.listTeamEventTypeIds(teamId);
    const [byHost, claimed, waitingNow, confirmations, members] = await Promise.all([
      this.repository.countBookingsByHostAndStatus({ eventTypeIds, since }),
      this.repository.listClaimedWaitlistSlots({ eventTypeIds, since }),
      this.repository.countWaiting(eventTypeIds, now),
      this.repository.countConfirmationsByStatus({ eventTypeIds, since }),
      this.repository.listMembers(teamId),
    ]);

    const sumStatus = (status: BookingStatus) =>
      byHost.filter((r) => r.status === status).reduce((total, r) => total + r.count, 0);
    const accepted = sumStatus(BookingStatus.ACCEPTED);

    const acceptedByHost = new Map<number, number>();
    for (const row of byHost) {
      if (row.status !== BookingStatus.ACCEPTED || row.userId === null) continue;
      acceptedByHost.set(row.userId, (acceptedByHost.get(row.userId) ?? 0) + row.count);
    }
    const perMember = members
      .map((m) => {
        const bookings = acceptedByHost.get(m.id) ?? 0;
        return {
          userId: m.id,
          name: m.name || m.email,
          avatarUrl: m.avatarUrl,
          bookings,
          share: accepted ? Math.round((bookings / accepted) * 100) : 0,
        };
      })
      .sort((a, b) => b.bookings - a.bookings || a.name.localeCompare(b.name));

    const minutesRecovered = claimed.reduce(
      (total, slot) => total + (slot.endTime.getTime() - slot.startTime.getTime()) / 60000,
      0
    );
    const confirmationCount = (status: AttendeeConfirmationStatus) =>
      confirmations.find((c) => c.status === status)?.count ?? 0;

    return {
      periodDays,
      bookings: {
        accepted,
        pending: sumStatus(BookingStatus.PENDING),
        cancelled: sumStatus(BookingStatus.CANCELLED),
      },
      perMember,
      waitlist: {
        refilled: claimed.length,
        hoursRecovered: Math.round((minutesRecovered / 60) * 10) / 10,
        waitingNow,
      },
      attendance: {
        confirmed: confirmationCount(AttendeeConfirmationStatus.CONFIRMED),
        missed: confirmationCount(AttendeeConfirmationStatus.MISSED),
      },
    };
  }
}
