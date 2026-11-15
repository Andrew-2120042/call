import { describe, expect, it } from "vitest";
import { type Range, TeamAvailabilityService } from "../TeamAvailabilityService";

// Monday 16 Nov 2026, 06:00 UTC.
const NOW = new Date("2026-11-16T06:00:00Z");
const at = (iso: string) => new Date(iso);

function service(free: Record<number, Range[]>) {
  return new TeamAvailabilityService({
    listMembers: async () => [
      { id: 1, name: "Ada" },
      { id: 2, name: "Max" },
    ],
    getFreeRanges: async ({ userId }) => free[userId] ?? [],
    now: () => NOW,
  });
}

describe("TeamAvailabilityService", () => {
  it("counts who is free each hour", async () => {
    const coverage = await service({
      1: [{ start: at("2026-11-16T09:00:00Z"), end: at("2026-11-16T12:00:00Z") }],
      2: [{ start: at("2026-11-16T11:00:00Z"), end: at("2026-11-16T13:00:00Z") }],
    }).getCoverage({ teamId: 1, timeZone: "UTC", days: 1 });
    const free = Object.fromEntries(coverage.days[0].hours.map((h) => [h.hour, h.free]));
    expect(free[9]).toEqual([1]);
    expect(free[11]).toEqual([1, 2]);
    expect(free[12]).toEqual([2]);
    expect(free[13]).toEqual([]);
  });

  it("reports weekday working-hour stretches nobody covers", async () => {
    const coverage = await service({
      1: [{ start: at("2026-11-16T09:00:00Z"), end: at("2026-11-16T13:00:00Z") }],
    }).getCoverage({ teamId: 1, timeZone: "UTC", days: 1 });
    expect(coverage.gaps).toEqual([{ date: "2026-11-16", startHour: 13, endHour: 17 }]);
  });

  it("ignores weekends and hours that have already passed", async () => {
    const saturdayMorning = () => new Date("2026-11-21T06:00:00Z");
    const weekend = new TeamAvailabilityService({
      listMembers: async () => [{ id: 1, name: "Ada" }],
      getFreeRanges: async () => [],
      now: saturdayMorning,
    });
    expect((await weekend.getCoverage({ teamId: 1, timeZone: "UTC", days: 2 })).gaps).toEqual([]);

    const lateMonday = new TeamAvailabilityService({
      listMembers: async () => [{ id: 1, name: "Ada" }],
      getFreeRanges: async () => [],
      now: () => new Date("2026-11-16T14:30:00Z"),
    });
    expect((await lateMonday.getCoverage({ teamId: 1, timeZone: "UTC", days: 1 })).gaps).toEqual([
      { date: "2026-11-16", startHour: 15, endHour: 17 },
    ]);
  });

  it("uses the viewer's timezone for days and hours", async () => {
    const coverage = await service({
      1: [{ start: at("2026-11-16T03:30:00Z"), end: at("2026-11-16T11:30:00Z") }],
    }).getCoverage({ teamId: 1, timeZone: "Asia/Kolkata", days: 1 });
    // 03:30–11:30 UTC is 09:00–17:00 in India.
    const freeHours = coverage.days[0].hours.filter((h) => h.free.length).map((h) => h.hour);
    expect(freeHours).toEqual([9, 10, 11, 12, 13, 14, 15, 16]);
    expect(coverage.gaps).toEqual([]);
  });

  it("treats a member whose calendar fails as busy instead of failing the view", async () => {
    const s = new TeamAvailabilityService({
      listMembers: async () => [{ id: 1, name: "Ada" }],
      getFreeRanges: async () => {
        throw new Error("calendar down");
      },
      now: () => NOW,
    });
    const coverage = await s.getCoverage({ teamId: 1, timeZone: "UTC", days: 1 });
    expect(coverage.days).toHaveLength(1);
    expect(coverage.unreadable).toEqual([{ id: 1, name: "Ada" }]);
  });
});
