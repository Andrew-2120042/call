import { describe, expect, it } from "vitest";
import { timeZoneLabel } from "./timeZoneLabel";

describe("timeZoneLabel", () => {
  it("shows the city without underscores, with its offset", () => {
    expect(timeZoneLabel("America/New_York", new Date("2026-01-15T12:00:00Z"))).toBe("New York (GMT-5)");
  });
  it("uses today's names for renamed cities", () => {
    expect(timeZoneLabel("Asia/Calcutta", new Date("2026-01-15T12:00:00Z"))).toBe("Kolkata (GMT+5:30)");
  });
  it("falls back to the city for an unknown zone", () => {
    expect(timeZoneLabel("Mars/Olympus_Mons")).toBe("Olympus Mons");
  });
});
