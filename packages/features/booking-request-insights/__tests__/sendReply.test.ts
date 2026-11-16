import { describe, expect, it, vi } from "vitest";
import type { IBookingRequestInsightRepository } from "../repositories/BookingRequestInsightRepository";
import { BookingRequestInsightService, type HostReply } from "../services/BookingRequestInsightService";

const booking = {
  id: 1,
  status: "PENDING",
  startTime: new Date("2026-11-18T10:00:00Z"),
  title: "Intro call between Pro Example and Leah Morgan",
  eventType: { title: "Intro call" },
  user: { name: "Pro Example", email: "pro@example.com" },
  attendees: [{ name: "Leah Morgan", email: "leah@example.com", timeZone: "Europe/London", locale: "en" }],
};

function setup(found: typeof booking | null = booking) {
  const sent: HostReply[] = [];
  const findByUidForHostIncludeAttendees = vi.fn().mockResolvedValue(found);
  const repository = { findByUidForHostIncludeAttendees } as unknown as IBookingRequestInsightRepository;
  const service = new BookingRequestInsightService({
    repository,
    generate: null,
    sendHostReply: async (reply) => {
      sent.push(reply);
    },
  });
  return { service, sent, findByUidForHostIncludeAttendees };
}

describe("BookingRequestInsightService.sendReply", () => {
  it("emails the requester with the host's message, scoped to the host's own booking", async () => {
    const { service, sent, findByUidForHostIncludeAttendees } = setup();
    const result = await service.sendReply({ bookingUid: "abc", userId: 4, message: "  Hi Leah, see you then!  " });
    expect(findByUidForHostIncludeAttendees).toHaveBeenCalledWith({ bookingUid: "abc", userId: 4 });
    expect(result).toEqual({ sentTo: "leah@example.com" });
    expect(sent[0]).toMatchObject({
      to: { email: "leah@example.com", name: "Leah Morgan" },
      host: { name: "Pro Example", email: "pro@example.com" },
      serviceTitle: "Intro call",
      message: "Hi Leah, see you then!",
    });
  });

  it("refuses an empty message", async () => {
    const { service, sent } = setup();
    await expect(service.sendReply({ bookingUid: "abc", userId: 4, message: "   " })).rejects.toThrow("Write a message");
    expect(sent).toHaveLength(0);
  });

  it("does not reveal or message bookings that belong to someone else", async () => {
    const { service, sent } = setup(null);
    await expect(service.sendReply({ bookingUid: "abc", userId: 99, message: "Hello" })).rejects.toThrow("not found");
    expect(sent).toHaveLength(0);
  });
});
