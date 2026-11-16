import { BookingStatus } from "@calcom/prisma/enums";
import { describe, expect, it, vi } from "vitest";
import type { CancelledBooking } from "../repositories/RebookRepository";
import { pickNearOriginalTime, RebookSuggestionService } from "../services/RebookSuggestionService";

const booking = {
  uid: "b1",
  status: BookingStatus.CANCELLED,
  rescheduled: false,
  startTime: new Date("2026-11-19T04:00:00Z"), // 9:30am in Kolkata
  endTime: new Date("2026-11-19T04:20:00Z"),
  responses: { name: "Maya", email: "maya@example.com", notes: "Mornings please", goal: "Beginner yoga" },
  cancellationReason: "Something came up",
  eventType: {
    id: 1,
    slug: "discovery-call",
    title: "Discovery Call",
    length: 20,
    teamId: null,
    bookingFields: [{ name: "goal", label: "Goal" }],
  },
  user: { username: "pro", name: "Pro" },
  attendees: [{ name: "Maya", email: "maya@example.com", timeZone: "Asia/Kolkata" }],
} as unknown as CancelledBooking;

const now = new Date("2026-11-17T00:00:00Z");
const candidates = [
  "2026-11-20T04:00:00Z",
  "2026-11-20T10:00:00Z",
  "2026-11-21T04:20:00Z",
  "2026-11-23T04:00:00Z",
  "2026-11-24T11:00:00Z",
];
const repo = (found: CancelledBooking | null) => ({
  findByUidIncludeEventTypeAndAttendee: vi.fn().mockResolvedValue(found),
});

describe("RebookSuggestionService", () => {
  it("keeps only AI picks that were actually offered, and prefills the client's details", async () => {
    const pick = vi.fn().mockResolvedValue([
      { start: "2026-11-21T04:20:00Z", reason: "A morning, like you asked" },
      { start: "2030-01-01T00:00:00Z", reason: "invented" },
    ]);
    const service = new RebookSuggestionService({ repository: repo(booking), pick });
    const result = await service.suggest({ bookingUid: "b1", candidates, timeZone: "Asia/Kolkata", now });
    expect(result.suggestions).toEqual([
      { start: "2026-11-21T04:20:00Z", reason: "A morning, like you asked" },
    ]);
    expect(result.bookingPath).toBe("/pro/discovery-call");
    expect(result.prefill).toMatchObject({
      name: "Maya",
      email: "maya@example.com",
      notes: "Mornings please",
      goal: "Beginner yoga",
    });
    expect(pick.mock.calls[0][0].answers).toContainEqual({ question: "Goal", answer: "Beginner yoga" });
  });

  it("falls back to times near the original time of day when the AI is unavailable", async () => {
    const service = new RebookSuggestionService({ repository: repo(booking), pick: null });
    const result = await service.suggest({ bookingUid: "b1", candidates, timeZone: "Asia/Kolkata", now });
    expect(result.suggestions.map((s) => s.start)).toEqual([
      "2026-11-20T04:00:00Z",
      "2026-11-21T04:20:00Z",
      "2026-11-23T04:00:00Z",
    ]);
  });

  it("refuses bookings that weren't cancelled or were moved by rescheduling", async () => {
    for (const found of [
      { ...booking, status: BookingStatus.ACCEPTED },
      { ...booking, rescheduled: true },
      null,
    ]) {
      const service = new RebookSuggestionService({
        repository: repo(found as CancelledBooking | null),
        pick: null,
      });
      await expect(service.suggest({ bookingUid: "b1", candidates, timeZone: "UTC", now })).rejects.toThrow(
        "can't be rebooked"
      );
    }
  });

  it("picks one time per day, closest to the original time", () => {
    const picks = pickNearOriginalTime(candidates, "2026-11-19T04:00:00Z", "Asia/Kolkata");
    expect(new Set(picks.map((p) => p.start.slice(0, 10))).size).toBe(picks.length);
  });
});
