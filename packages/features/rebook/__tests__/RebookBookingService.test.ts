import { BookingStatus } from "@calcom/prisma/enums";
import { describe, expect, it, vi } from "vitest";
import type { CancelledBooking } from "../repositories/RebookRepository";
import { RebookBookingService } from "../services/RebookBookingService";

const now = new Date("2026-11-20T00:00:00Z");
const cancelled = {
  uid: "b1",
  status: BookingStatus.CANCELLED,
  rescheduled: false,
  startTime: new Date("2026-11-19T04:00:00Z"),
  endTime: new Date("2026-11-19T04:20:00Z"),
  responses: { name: "Maya Rao", email: "maya@example.com", "What-do-you-want-help-with": "Mobility" },
  eventType: { id: 1, slug: "discovery-call", title: "Discovery Call", length: 20, teamId: null },
  userId: 7,
  user: { username: "pro", name: "Pro Host" },
  attendees: [{ name: "Maya Rao", email: "maya@example.com", timeZone: "Asia/Kolkata", locale: "en" }],
} as unknown as CancelledBooking;

const build = (overrides: { found?: Partial<CancelledBooking> | null; rebooked?: boolean } = {}) => {
  const createBooking = vi.fn().mockResolvedValue({ uid: "new1" });
  const found = overrides.found === null ? null : { ...cancelled, ...(overrides.found ?? {}) };
  const service = new RebookBookingService({
    repository: {
      findByUidIncludeEventTypeAndAttendee: vi.fn().mockResolvedValue(found),
      hasUpcomingByAttendeeEmailAndUserId: vi.fn().mockResolvedValue(overrides.rebooked ?? false),
    },
    createBooking,
  });
  return { service, createBooking };
};

const start = new Date("2026-11-21T05:00:00Z");

describe("RebookBookingService", () => {
  it("books the picked time with the details from the cancelled booking", async () => {
    const { service, createBooking } = build();
    expect(await service.book({ bookingUid: "b1", start }, now)).toEqual({ ok: true, uid: "new1" });
    expect(createBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        eventTypeId: 1,
        username: "pro",
        start,
        end: new Date("2026-11-21T05:20:00Z"),
        timeZone: "Asia/Kolkata",
        responses: expect.objectContaining({ email: "maya@example.com", "What-do-you-want-help-with": "Mobility" }),
      })
    );
  });

  it.each([
    ["a booking that isn't cancelled", { found: { status: BookingStatus.ACCEPTED } }, "not_cancelled"],
    ["a team booking", { found: { eventType: { ...cancelled.eventType, teamId: 3 } } }, "team_event"],
    ["an unknown booking", { found: null }, "not_found"],
    ["someone who already rebooked", { rebooked: true }, "already_rebooked"],
  ] as const)("refuses %s", async (_label, overrides, reason) => {
    const { service, createBooking } = build(overrides as Parameters<typeof build>[0]);
    expect(await service.book({ bookingUid: "b1", start }, now)).toEqual({ ok: false, reason });
    expect(createBooking).not.toHaveBeenCalled();
  });

  it("refuses a time in the past and a booking cancelled too long ago", async () => {
    const { service } = build();
    expect(await service.book({ bookingUid: "b1", start: new Date("2026-11-10T00:00:00Z") }, now)).toEqual({
      ok: false,
      reason: "in_the_past",
    });
    expect(await service.book({ bookingUid: "b1", start }, new Date("2027-03-01T00:00:00Z"))).toEqual({
      ok: false,
      reason: "too_late",
    });
  });
});
