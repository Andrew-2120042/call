import type {
  IAttendeeReminderRepository,
  ReminderBooking,
} from "../repositories/AttendeeReminderRepository";

const MINUTE_MS = 60_000;
/** Largest reminder offset accepted from settings (14 days); also bounds the cron's candidate query. */
export const MAX_REMINDER_MINUTES = 14 * 24 * 60;

export interface IAttendeeReminderNotifier {
  sendReminder(params: {
    booking: ReminderBooking;
    attendee: ReminderBooking["attendees"][number];
    manageUrl: string;
  }): Promise<void>;
}

export interface IAttendeeReminderServiceDeps {
  repository: IAttendeeReminderRepository;
  notifier: IAttendeeReminderNotifier;
  webappUrl: string;
  now?: () => Date;
  logger?: { error: (...args: unknown[]) => void };
}

/**
 * A reminder is due once its send time has passed, as long as the booking existed before that send time
 * (someone who books 2 hours ahead shouldn't get the "1 day before" reminder) and it hasn't been sent yet.
 */
export const getDueReminderOffsets = (booking: ReminderBooking, now: Date): number[] => {
  const offsets = booking.eventType?.attendeeReminderMinutes ?? [];
  const sent = new Set(booking.remindersSent.map((reminder) => reminder.minutesBefore));
  return (
    Array.from(new Set(offsets))
      .filter((minutes) => minutes > 0 && minutes <= MAX_REMINDER_MINUTES && !sent.has(minutes))
      .filter((minutes) => {
        const sendAt = booking.startTime.getTime() - minutes * MINUTE_MS;
        return sendAt <= now.getTime() && booking.createdAt.getTime() < sendAt;
      })
      // Nearest first: callers send only this one and retire the older (now stale) ones.
      .sort((a, b) => a - b)
  );
};

export class AttendeeReminderService {
  private readonly now: () => Date;

  constructor(private readonly deps: IAttendeeReminderServiceDeps) {
    this.now = deps.now ?? (() => new Date());
  }

  async sendDueReminders() {
    const now = this.now();
    const latestStart = new Date(now.getTime() + MAX_REMINDER_MINUTES * MINUTE_MS);
    const bookings = await this.deps.repository.findUpcomingWithReminders({ now, latestStart });
    let sent = 0;
    for (const booking of bookings) {
      const [nearest, ...stale] = getDueReminderOffsets(booking, now);
      if (nearest === undefined) continue;
      // A missed earlier reminder (e.g. cron downtime) must never go out after a nearer one.
      for (const minutesBefore of stale) {
        await this.deps.repository.recordSent({ bookingId: booking.id, minutesBefore });
      }
      // Record first so overlapping cron runs can never send the same reminder twice.
      const claimed = await this.deps.repository.recordSent({
        bookingId: booking.id,
        minutesBefore: nearest,
      });
      if (!claimed) continue;
      for (const attendee of booking.attendees) {
        try {
          await this.deps.notifier.sendReminder({
            booking,
            attendee,
            manageUrl: `${this.deps.webappUrl}/booking/${booking.uid}`,
          });
          sent++;
        } catch (error) {
          this.deps.logger?.error("[reminders] failed to send", { bookingId: booking.id, error });
        }
      }
    }
    return { remindersSent: sent };
  }
}
