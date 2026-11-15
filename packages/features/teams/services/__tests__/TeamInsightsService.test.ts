import { AttendeeConfirmationStatus, BookingStatus } from "@calcom/prisma/enums";
import { describe, expect, it } from "vitest";
import type { TeamInsightsRepository } from "../../repositories/TeamInsightsRepository";
import { TeamInsightsService } from "../TeamInsightsService";

const NOW = new Date("2026-11-15T12:00:00Z");

function service(overrides: Partial<Record<keyof TeamInsightsRepository, unknown>> = {}) {
  const repo = {
    listTeamEventTypeIds: async () => [1, 2],
    countBookingsByHostAndStatus: async () => [
      { userId: 10, status: BookingStatus.ACCEPTED, count: 6 },
      { userId: 11, status: BookingStatus.ACCEPTED, count: 2 },
      { userId: 11, status: BookingStatus.CANCELLED, count: 3 },
      { userId: 10, status: BookingStatus.PENDING, count: 1 },
    ],
    listClaimedWaitlistSlots: async () => [
      { startTime: new Date("2026-11-10T10:00:00Z"), endTime: new Date("2026-11-10T10:45:00Z") },
      { startTime: new Date("2026-11-11T10:00:00Z"), endTime: new Date("2026-11-11T11:00:00Z") },
    ],
    countWaiting: async () => 4,
    countConfirmationsByStatus: async () => [
      { status: AttendeeConfirmationStatus.CONFIRMED, count: 7 },
      { status: AttendeeConfirmationStatus.MISSED, count: 2 },
    ],
    listMembers: async () => [
      { id: 10, name: "Ada", email: "ada@example.com", avatarUrl: null },
      { id: 11, name: null, email: "max@example.com", avatarUrl: null },
      { id: 12, name: "Zoe", email: "zoe@example.com", avatarUrl: null },
    ],
    ...overrides,
  };
  return new TeamInsightsService(repo as unknown as TeamInsightsRepository, () => NOW);
}

describe("TeamInsightsService", () => {
  it("summarises bookings, waitlist refills and attendance", async () => {
    const insights = await service().get({ teamId: 1 });
    expect(insights.bookings).toEqual({ accepted: 8, pending: 1, cancelled: 3 });
    expect(insights.waitlist).toEqual({ refilled: 2, hoursRecovered: 1.8, waitingNow: 4 });
    expect(insights.attendance).toEqual({ confirmed: 7, missed: 2 });
  });

  it("ranks members by accepted bookings and includes members with none", async () => {
    const { perMember } = await service().get({ teamId: 1 });
    expect(perMember.map((m) => [m.name, m.bookings, m.share])).toEqual([
      ["Ada", 6, 75],
      ["max@example.com", 2, 25],
      ["Zoe", 0, 0],
    ]);
  });

  it("handles a team with no services", async () => {
    const insights = await service({
      listTeamEventTypeIds: async () => [],
      countBookingsByHostAndStatus: async () => [],
      listClaimedWaitlistSlots: async () => [],
      countWaiting: async () => 0,
      countConfirmationsByStatus: async () => [],
    }).get({ teamId: 1 });
    expect(insights.bookings.accepted).toBe(0);
    expect(insights.perMember.every((m) => m.share === 0)).toBe(true);
  });
});
