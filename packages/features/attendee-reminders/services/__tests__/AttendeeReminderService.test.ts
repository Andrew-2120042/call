import { describe, expect, it, vi } from "vitest";
import type {
  IAttendeeReminderRepository,
  ReminderBooking,
} from "../../repositories/AttendeeReminderRepository";
import { AttendeeReminderService, getDueReminderOffsets } from "../AttendeeReminderService";

const MIN = 60_000;
const START = new Date("2026-11-20T15:00:00.000Z");

const makeBooking = (overrides: Partial<ReminderBooking> = {}): ReminderBooking => ({
  id: 1,
  uid: "b1",
  title: "Coaching",
  startTime: START,
  createdAt: new Date(START.getTime() - 7 * 24 * 60 * MIN),
  user: { name: "Jordan", username: "jordan" },
  attendees: [{ name: "Maya", email: "maya@example.com", timeZone: "America/New_York", locale: "en" }],
  eventType: { title: "Coaching", attendeeReminderMinutes: [1440, 60] },
  remindersSent: [],
  ...overrides,
});

describe("getDueReminderOffsets", () => {
  it("returns nothing before the first reminder time", () => {
    expect(getDueReminderOffsets(makeBooking(), new Date(START.getTime() - 1441 * MIN))).toEqual([]);
  });

  it("returns the 24h reminder once its time has passed", () => {
    expect(getDueReminderOffsets(makeBooking(), new Date(START.getTime() - 1400 * MIN))).toEqual([1440]);
  });

  it("orders due reminders nearest first", () => {
    expect(getDueReminderOffsets(makeBooking(), new Date(START.getTime() - 30 * MIN))).toEqual([60, 1440]);
  });

  it("skips reminders whose send time was before the booking existed", () => {
    const booking = makeBooking({ createdAt: new Date(START.getTime() - 120 * MIN) });
    expect(getDueReminderOffsets(booking, new Date(START.getTime() - 100 * MIN))).toEqual([]);
    expect(getDueReminderOffsets(booking, new Date(START.getTime() - 50 * MIN))).toEqual([60]);
  });

  it("never repeats a reminder already sent and ignores invalid offsets", () => {
    const booking = makeBooking({
      remindersSent: [{ minutesBefore: 60 }],
      eventType: { title: "Coaching", attendeeReminderMinutes: [60, 0, -5, 60] },
    });
    expect(getDueReminderOffsets(booking, new Date(START.getTime() - 10 * MIN))).toEqual([]);
  });
});

describe("AttendeeReminderService", () => {
  const setup = (bookings: ReminderBooking[], now: Date) => {
    const recorded = new Set<string>();
    const repository: IAttendeeReminderRepository = {
      findUpcomingWithReminders: async () => bookings,
      recordSent: async ({ bookingId, minutesBefore }) => {
        const key = `${bookingId}:${minutesBefore}`;
        if (recorded.has(key)) return false;
        recorded.add(key);
        return true;
      },
    };
    const notifier = { sendReminder: vi.fn().mockResolvedValue(undefined) };
    const service = new AttendeeReminderService({
      repository,
      notifier,
      webappUrl: "https://app.test",
      now: () => now,
    });
    return { service, notifier };
  };

  it("emails every attendee once with a link to manage the booking", async () => {
    const booking = makeBooking({
      attendees: [
        { name: "Maya", email: "maya@example.com", timeZone: "UTC", locale: "en" },
        { name: "Sam", email: "sam@example.com", timeZone: "UTC", locale: "en" },
      ],
    });
    const { service, notifier } = setup([booking], new Date(START.getTime() - 1000 * MIN));
    expect(await service.sendDueReminders()).toEqual({ remindersSent: 2 });
    expect(notifier.sendReminder).toHaveBeenCalledWith(
      expect.objectContaining({ manageUrl: "https://app.test/booking/b1" })
    );
    expect(await service.sendDueReminders()).toEqual({ remindersSent: 0 });
  });

  it("never sends a stale earlier reminder after a nearer one", async () => {
    const booking = makeBooking();
    const { service, notifier } = setup([booking], new Date(START.getTime() - 30 * MIN));
    expect(await service.sendDueReminders()).toEqual({ remindersSent: 1 });
    expect(await service.sendDueReminders()).toEqual({ remindersSent: 0 });
    expect(notifier.sendReminder).toHaveBeenCalledTimes(1);
  });

  it("keeps going when one email fails", async () => {
    const { service, notifier } = setup(
      [makeBooking(), makeBooking({ id: 2, uid: "b2" })],
      new Date(START.getTime() - 1000 * MIN)
    );
    notifier.sendReminder.mockRejectedValueOnce(new Error("smtp down"));
    expect(await service.sendDueReminders()).toEqual({ remindersSent: 1 });
  });
});
