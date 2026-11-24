import { describe, expect, it } from "vitest";
import type { MoneySavedRepository, SavedSession } from "../repositories/MoneySavedRepository";
import { MoneySavedService } from "../services/MoneySavedService";

const services = [
  { id: 1, title: "Intro call" },
  { id: 2, title: "Coaching session" },
];

const fakeRepo = (saved: SavedSession[], prices: Record<string, number>, caught = 0) => {
  let stored = { ...prices };
  return {
    repo: {
      findSavedSessionsSince: async () => saved,
      countCaughtNoShowsSince: async () => caught,
      findServices: async () => services,
      findServicePrices: async () => stored,
      saveServicePrices: async (_: number, next: Record<string, number>) => {
        stored = next;
      },
    } as unknown as MoneySavedRepository,
    stored: () => stored,
  };
};

describe("MoneySavedService", () => {
  const now = new Date("2026-11-24T10:00:00Z");

  it("values each saved session at its own service's price", async () => {
    const { repo } = fakeRepo(
      [
        { bookingId: 1, eventTypeId: 1, via: "waitlist" },
        { bookingId: 2, eventTypeId: 2, via: "waitlist" },
        { bookingId: 3, eventTypeId: 2, via: "rebook" },
      ],
      { "1": 40, "2": 150 },
      2
    );
    const summary = await new MoneySavedService(repo).getSummary(7, now);
    expect(summary).toMatchObject({ refilled: 2, rebooked: 1, caught: 2, sessionsSaved: 3, amountSaved: 340, unpriced: 0 });
    expect(summary.services.find((s) => s.id === 2)?.savedThisMonth).toBe(2);
  });

  it("reports unpriced sessions instead of guessing their value", async () => {
    const { repo } = fakeRepo(
      [
        { bookingId: 1, eventTypeId: 1, via: "waitlist" },
        { bookingId: 2, eventTypeId: 2, via: "waitlist" },
      ],
      { "1": 40 }
    );
    const summary = await new MoneySavedService(repo).getSummary(7, now);
    expect(summary.amountSaved).toBe(40);
    expect(summary.unpriced).toBe(1);
  });

  it("has no amount until a saved session's service is priced", async () => {
    const { repo } = fakeRepo([{ bookingId: 1, eventTypeId: 2, via: "rebook" }], {});
    expect((await new MoneySavedService(repo).getSummary(7, now)).amountSaved).toBeNull();
  });

  it("only saves prices for the user's own services", async () => {
    const { repo, stored } = fakeRepo([], { "1": 40 });
    await new MoneySavedService(repo).setServicePrices(7, [
      { eventTypeId: 2, price: 150 },
      { eventTypeId: 99, price: 500 },
      { eventTypeId: 1, price: null },
    ]);
    expect(stored()).toEqual({ "2": 150 });
  });
});
