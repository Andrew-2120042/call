import { hashOfferToken } from "@calcom/features/waitlist/lib/offerToken";
import { AttendeeConfirmationStatus, BookingStatus } from "@calcom/prisma/enums";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ConfirmationBooking,
  ConfirmationRecord,
  IAttendeeConfirmationRepository,
} from "../../repositories/AttendeeConfirmationRepository";
import { AttendeeConfirmationService } from "../AttendeeConfirmationService";

const HOUR = 60 * 60 * 1000;
const START = new Date("2026-11-20T15:00:00.000Z");

const makeBooking = (overrides: Partial<ConfirmationBooking> = {}): ConfirmationBooking => ({
  id: 1,
  uid: "b1",
  title: "Coaching",
  startTime: START,
  endTime: new Date(START.getTime() + HOUR),
  status: BookingStatus.ACCEPTED,
  userId: 4,
  user: {
    id: 4,
    name: "Jordan",
    email: "jordan@example.com",
    username: "jordan",
    timeZone: "UTC",
    locale: "en",
  },
  attendees: [{ name: "Maya", email: "maya@example.com", timeZone: "America/New_York", locale: "en" }],
  eventType: { id: 3, title: "Coaching", attendeeConfirmationHours: 24, releaseUnconfirmedBookings: false },
  ...overrides,
});

function createFake(bookings: ConfirmationBooking[]) {
  const records: (ConfirmationRecord & { tokenHash: string })[] = [];
  let id = 1;
  const repo: IAttendeeConfirmationRepository = {
    findBookingsAwaitingRequest: async ({ now, latestStart }) =>
      bookings.filter(
        (b) =>
          b.status === BookingStatus.ACCEPTED &&
          b.startTime > now &&
          b.startTime <= latestStart &&
          b.eventType?.attendeeConfirmationHours != null &&
          !records.some((r) => r.bookingId === b.id)
      ),
    createRequest: async ({ bookingId, tokenHash, deadline }) => {
      if (records.some((r) => r.bookingId === bookingId)) return false;
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) throw new Error("missing booking");
      records.push({
        id: id++,
        bookingId,
        tokenHash,
        deadline,
        status: AttendeeConfirmationStatus.REQUESTED,
        confirmedAt: null,
        booking,
      });
      return true;
    },
    findOverdueRequests: async (now) =>
      records.filter((r) => r.status === AttendeeConfirmationStatus.REQUESTED && r.deadline <= now),
    findByTokenHash: async (hash) => records.find((r) => r.tokenHash === hash) ?? null,
    transition: async ({ id: recordId, from, data }) => {
      const record = records.find((r) => r.id === recordId);
      if (!record || record.status !== from) return false;
      Object.assign(record, data);
      return true;
    },
  };
  return { repo, records };
}

describe("AttendeeConfirmationService", () => {
  let bookings: ConfirmationBooking[];
  let fake: ReturnType<typeof createFake>;
  let notifier: { sendRequest: ReturnType<typeof vi.fn>; sendMissedToHost: ReturnType<typeof vi.fn> };
  let releaseBooking: ReturnType<typeof vi.fn>;
  let now: Date;
  let service: AttendeeConfirmationService;

  const tokenFromLastRequest = () =>
    (notifier.sendRequest.mock.calls.at(-1)?.[0].confirmUrl as string).split("/attendance/confirm/")[1];

  const build = () =>
    new AttendeeConfirmationService({
      repository: fake.repo,
      notifier,
      releaseBooking,
      webappUrl: "https://app.test",
      now: () => now,
    });

  beforeEach(() => {
    bookings = [makeBooking()];
    fake = createFake(bookings);
    notifier = {
      sendRequest: vi.fn().mockResolvedValue(undefined),
      sendMissedToHost: vi.fn().mockResolvedValue(undefined),
    };
    releaseBooking = vi.fn().mockImplementation(async (booking: ConfirmationBooking) => {
      booking.status = BookingStatus.CANCELLED;
    });
    // Deadline is START - 24h; the request window opens 24h before that.
    now = new Date(START.getTime() - 47 * HOUR);
    service = build();
  });

  it("does not ask before the request window opens", async () => {
    now = new Date(START.getTime() - 49 * HOUR);
    service = build();
    expect(await service.sendDueRequests()).toEqual({ requestsSent: 0 });
  });

  it("asks once inside the window with a hashed single-use link", async () => {
    expect(await service.sendDueRequests()).toEqual({ requestsSent: 1 });
    expect(await service.sendDueRequests()).toEqual({ requestsSent: 0 });
    expect(fake.records[0].tokenHash).toBe(hashOfferToken(tokenFromLastRequest()));
    expect(fake.records[0].deadline).toEqual(new Date(START.getTime() - 24 * HOUR));
  });

  it("skips bookings made after the deadline", async () => {
    now = new Date(START.getTime() - 2 * HOUR);
    service = build();
    expect(await service.sendDueRequests()).toEqual({ requestsSent: 0 });
  });

  it("confirms with the link and is idempotent", async () => {
    await service.sendDueRequests();
    const token = tokenFromLastRequest();
    expect(await service.confirm(token)).toEqual({ ok: true, alreadyConfirmed: false });
    expect(await service.confirm(token)).toEqual({ ok: true, alreadyConfirmed: true });
    expect(fake.records[0].status).toBe(AttendeeConfirmationStatus.CONFIRMED);
  });

  it("rejects malformed links and confirmations after the deadline", async () => {
    await service.sendDueRequests();
    const token = tokenFromLastRequest();
    expect(await service.confirm("bad")).toEqual({ ok: false, reason: "invalid" });
    now = new Date(START.getTime() - 23 * HOUR);
    service = build();
    expect(await service.confirm(token)).toEqual({ ok: false, reason: "deadline_passed" });
  });

  it("only alerts the host when release is off", async () => {
    await service.sendDueRequests();
    now = new Date(START.getTime() - 23 * HOUR);
    service = build();
    expect(await service.processMissedDeadlines()).toEqual({ missed: 1, released: 0, hostsAlerted: 1 });
    expect(releaseBooking).not.toHaveBeenCalled();
    expect(notifier.sendMissedToHost).toHaveBeenCalledWith(expect.objectContaining({ released: false }));
    expect(fake.records[0].status).toBe(AttendeeConfirmationStatus.MISSED);
  });

  it("releases the booking and tells the host when release is on", async () => {
    bookings[0].eventType = {
      id: 3,
      title: "Coaching",
      attendeeConfirmationHours: 24,
      releaseUnconfirmedBookings: true,
    };
    await service.sendDueRequests();
    now = new Date(START.getTime() - 23 * HOUR);
    service = build();
    expect(await service.processMissedDeadlines()).toEqual({ missed: 1, released: 1, hostsAlerted: 1 });
    expect(releaseBooking).toHaveBeenCalledTimes(1);
    expect(notifier.sendMissedToHost).toHaveBeenCalledWith(expect.objectContaining({ released: true }));
  });

  it("does nothing for a booking cancelled before the deadline", async () => {
    await service.sendDueRequests();
    bookings[0].status = BookingStatus.CANCELLED;
    now = new Date(START.getTime() - 23 * HOUR);
    service = build();
    expect(await service.processMissedDeadlines()).toMatchObject({ released: 0, hostsAlerted: 0 });
    expect(fake.records[0].status).toBe(AttendeeConfirmationStatus.CANCELLED);
  });

  it("tells the attendee it's too late when the deadline job wins the race", async () => {
    await service.sendDueRequests();
    const token = tokenFromLastRequest();
    const original = fake.repo.transition;
    fake.repo.transition = async (params) => {
      fake.records[0].status = AttendeeConfirmationStatus.MISSED;
      return original(params);
    };
    expect(await service.confirm(token)).toEqual({ ok: false, reason: "deadline_passed" });
  });

  it("keeps processing when the host email fails", async () => {
    notifier.sendMissedToHost.mockRejectedValueOnce(new Error("smtp down"));
    await service.sendDueRequests();
    now = new Date(START.getTime() - 23 * HOUR);
    service = build();
    expect(await service.processMissedDeadlines()).toEqual({ missed: 1, released: 0, hostsAlerted: 0 });
  });
});
