import { describe, expect, it } from "vitest";
import type { MoneySavedRepository } from "../repositories/MoneySavedRepository";
import { MoneySavedService } from "../services/MoneySavedService";

const fakeRepo = (counts: { refilled: number; rebooked: number; caught: number }, value: number | null) =>
  ({
    countSince: async () => counts,
    findSessionValue: async () => value,
    saveSessionValue: async () => undefined,
  }) as unknown as MoneySavedRepository;

describe("MoneySavedService", () => {
  const now = new Date("2026-11-24T10:00:00Z");

  it("adds refilled and rebooked sessions and prices them", async () => {
    const summary = await new MoneySavedService(fakeRepo({ refilled: 3, rebooked: 1, caught: 2 }, 120)).getSummary(1, now);
    expect(summary.sessionsSaved).toBe(4);
    expect(summary.amountSaved).toBe(480);
    expect(summary.caught).toBe(2);
    expect(summary.monthStart.toISOString()).toBe("2026-11-01T00:00:00.000Z");
  });

  it("leaves the amount empty until a session value is set", async () => {
    const summary = await new MoneySavedService(fakeRepo({ refilled: 2, rebooked: 0, caught: 0 }, null)).getSummary(1, now);
    expect(summary.sessionsSaved).toBe(2);
    expect(summary.amountSaved).toBeNull();
  });
});
