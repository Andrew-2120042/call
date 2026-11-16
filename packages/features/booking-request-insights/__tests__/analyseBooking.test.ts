import { BookingRequestFit, BookingStatus } from "@calcom/prisma/enums";
import { describe, expect, it, vi } from "vitest";
import type { IBookingRequestInsightRepository } from "../repositories/BookingRequestInsightRepository";
import { BookingRequestInsightService } from "../services/BookingRequestInsightService";

const pending = {
  id: 7,
  uid: "req-7",
  userId: 4,
  status: BookingStatus.PENDING,
  title: "Intro call",
  startTime: new Date("2026-11-20T10:00:00Z"),
  responses: { name: "Sofia", email: "sofia@example.com", experience: "Beginner, stiff back" },
  eventType: { title: "Intro call", description: null, bookingFields: [{ name: "experience", label: "Experience" }] },
};

const generated = {
  insight: { summary: "Beginner with a stiff back.", fit: "good" as const, spamLikely: false, concerns: [], suggestedReply: "Hi!" },
  model: "claude-sonnet-5-5",
};

function setup(overrides: { existing?: unknown; booking?: unknown; entitled?: boolean } = {}) {
  const save = vi.fn().mockResolvedValue(true);
  const generate = vi.fn().mockResolvedValue(generated);
  const repository = {
    findInsightByBookingId: vi.fn().mockResolvedValue(overrides.existing ?? null),
    findById: vi.fn().mockResolvedValue(overrides.booking === undefined ? pending : overrides.booking),
    save,
  } as unknown as IBookingRequestInsightRepository;
  const service = new BookingRequestInsightService({
    repository,
    generate,
    isHostEntitled: async () => overrides.entitled ?? true,
  });
  return { service, save, generate };
}

describe("BookingRequestInsightService.analyseBooking", () => {
  it("writes and returns a summary for a pending request, using the custom question answers", async () => {
    const { service, save, generate } = setup();
    const result = await service.analyseBooking(7);
    expect(result).toMatchObject({ summary: "Beginner with a stiff back.", fit: BookingRequestFit.GOOD });
    expect(generate.mock.calls[0][0].answers).toEqual([{ question: "Experience", answer: "Beginner, stiff back" }]);
    expect(save).toHaveBeenCalledWith(7, expect.objectContaining({ model: "claude-sonnet-5-5" }));
  });

  it("reuses an existing summary instead of calling the model again", async () => {
    const existing = { summary: "Already done", fit: BookingRequestFit.POOR, spamLikely: true };
    const { service, generate } = setup({ existing });
    expect(await service.analyseBooking(7)).toBe(existing);
    expect(generate).not.toHaveBeenCalled();
  });

  it("returns null for requests that are no longer pending or hosts without the feature", async () => {
    expect(await setup({ booking: { ...pending, status: BookingStatus.ACCEPTED } }).service.analyseBooking(7)).toBeNull();
    expect(await setup({ entitled: false }).service.analyseBooking(7)).toBeNull();
  });
});
