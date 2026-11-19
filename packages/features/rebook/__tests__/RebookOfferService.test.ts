import { BookingStatus } from "@calcom/prisma/enums";
import { describe, expect, it, vi } from "vitest";
import type { CancelledBooking } from "../repositories/RebookRepository";
import { RebookOfferService } from "../services/RebookOfferService";

const booking = {
  uid: "b1",
  status: BookingStatus.CANCELLED,
  rescheduled: false,
  userId: 7,
  startTime: new Date("2026-11-19T04:00:00Z"),
  eventType: { id: 1, slug: "discovery-call", title: "Discovery Call", length: 20, teamId: null },
  user: { username: "pro", name: "Pro Host" },
  attendees: [{ name: "Maya Rao", email: "maya@example.com", timeZone: "Asia/Kolkata", locale: "en" }],
} as unknown as CancelledBooking;

const now = new Date("2026-11-17T00:00:00Z");

const build = (overrides: { found?: CancelledBooking | null; rebooked?: boolean; picks?: string[] } = {}) => {
  const send = vi.fn().mockResolvedValue(undefined);
  const findOpenTimes = vi.fn().mockResolvedValue(["2026-11-20T04:00:00Z", "2026-11-21T04:00:00Z"]);
  const suggest = vi.fn().mockResolvedValue({
    suggestions: (overrides.picks ?? ["2026-11-20T04:00:00Z"]).map((start) => ({ start, reason: null })),
    bookingPath: "/pro/discovery-call",
    prefill: { name: "Maya Rao", email: "maya@example.com" },
  });
  const service = new RebookOfferService({
    repository: {
      findByUidIncludeEventTypeAndAttendee: vi
        .fn()
        .mockResolvedValue(overrides.found === undefined ? booking : overrides.found),
      hasUpcomingByAttendeeEmailAndUserId: vi.fn().mockResolvedValue(overrides.rebooked ?? false),
    },
    suggestions: { suggest },
    findOpenTimes,
    send,
    appUrl: "https://app.example.com",
  });
  return { service, send, findOpenTimes, suggest };
};

describe("RebookOfferService", () => {
  it("emails the best open time with a one-click booking link and a link to every other time", async () => {
    const { service, send, findOpenTimes } = build();
    const result = await service.offer("b1", now);

    expect(result).toEqual({ sent: true, start: "2026-11-20T04:00:00Z" });
    expect(findOpenTimes).toHaveBeenCalledWith(
      expect.objectContaining({ eventTypeId: 1, timeZone: "Asia/Kolkata", from: now })
    );
    const email = send.mock.calls[0][0];
    expect(email.to).toEqual({
      name: "Maya Rao",
      email: "maya@example.com",
      timeZone: "Asia/Kolkata",
      locale: "en",
    });
    expect(email.hostName).toBe("Pro Host");
    const bookUrl = new URL(email.bookUrl);
    expect(bookUrl.origin + bookUrl.pathname).toBe("https://app.example.com/pro/discovery-call");
    expect(bookUrl.searchParams.get("slot")).toBe("2026-11-20T04:00:00Z");
    expect(bookUrl.searchParams.get("date")).toBe("2026-11-20");
    expect(bookUrl.searchParams.get("email")).toBe("maya@example.com");
    expect(email.moreTimesUrl).toBe("https://app.example.com/booking/b1");
  });

  it("stays quiet when the client already rebooked with the same host", async () => {
    const { service, send } = build({ rebooked: true });
    expect(await service.offer("b1", now)).toEqual({ sent: false, reason: "already rebooked" });
    expect(send).not.toHaveBeenCalled();
  });

  it("stays quiet when there are no open times", async () => {
    const { service, send } = build({ picks: [] });
    expect(await service.offer("b1", now)).toEqual({ sent: false, reason: "no open times" });
    expect(send).not.toHaveBeenCalled();
  });

  it("does nothing for a booking that is no longer cancelled", async () => {
    const { service, send, findOpenTimes } = build({
      found: { ...booking, status: BookingStatus.ACCEPTED } as CancelledBooking,
    });
    expect((await service.offer("b1", now)).sent).toBe(false);
    expect(findOpenTimes).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("does nothing when the booking is gone", async () => {
    const { service, send } = build({ found: null });
    expect(await service.offer("b1", now)).toEqual({ sent: false, reason: "not found" });
    expect(send).not.toHaveBeenCalled();
  });
});
