import dayjs from "@calcom/dayjs";
import { ErrorWithCode } from "@calcom/lib/errors";
import { BookingStatus } from "@calcom/prisma/enums";
import type { CancelledBooking, RebookRepository } from "../repositories/RebookRepository";

export type RebookContext = {
  serviceTitle: string;
  lengthMinutes: number;
  timeZone: string;
  originalStart: string;
  cancellationReason: string | null;
  answers: { question: string; answer: string }[];
  /** Available start times (ISO), already filtered to the host's real availability. */
  candidates: string[];
};

/** Picks up to three start times from the candidates, each with a short reason for the client. */
export type RebookPicker = (context: RebookContext) => Promise<{ start: string; reason: string }[] | null>;

export type RebookSuggestion = { start: string; reason: string | null };

export type RebookSuggestionResult = {
  suggestions: RebookSuggestion[];
  /** Where the client can book a suggestion, with their details carried over. */
  bookingPath: string;
  prefill: Record<string, string>;
};

const MAX_CANDIDATES = 160;
const SYSTEM_FIELDS = new Set([
  "name",
  "email",
  "location",
  "guests",
  "rescheduleReason",
  "attendeePhoneNumber",
]);

type FieldWithLabel = { name?: string; label?: string; defaultLabel?: string };

const asText = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

/**
 * Offers a client who cancelled a few new times for the same service. The candidates come from the booking page's
 * own availability; this only chooses among them (with AI when available, otherwise near the original time of day).
 */
export class RebookSuggestionService {
  constructor(
    private readonly deps: {
      repository: Pick<RebookRepository, "findByUidIncludeEventTypeAndAttendee">;
      pick: RebookPicker | null;
    }
  ) {}

  async suggest(params: {
    bookingUid: string;
    candidates: string[];
    timeZone: string;
    now?: Date;
  }): Promise<RebookSuggestionResult> {
    const booking = await this.deps.repository.findByUidIncludeEventTypeAndAttendee(params.bookingUid);
    if (!booking || !this.canRebook(booking))
      throw ErrorWithCode.Factory.NotFound("This booking can't be rebooked.");
    const now = params.now ?? new Date();
    const candidates = Array.from(new Set(params.candidates))
      .filter((iso) => dayjs(iso).isValid() && dayjs(iso).isAfter(now))
      .sort()
      .slice(0, MAX_CANDIDATES);
    const prefill = this.prefillFrom(booking);
    const bookingPath = `/${booking.user?.username}/${booking.eventType?.slug}`;
    if (candidates.length === 0) return { suggestions: [], bookingPath, prefill };

    const context: RebookContext = {
      serviceTitle: booking.eventType?.title ?? "",
      lengthMinutes: booking.eventType?.length ?? 30,
      timeZone: params.timeZone,
      originalStart: booking.startTime.toISOString(),
      cancellationReason: booking.cancellationReason,
      answers: this.answersFrom(booking),
      candidates,
    };

    let picks: RebookSuggestion[] | null = null;
    if (this.deps.pick) {
      try {
        const chosen = await this.deps.pick(context);
        // Only accept times that were actually offered; the model must not invent a slot.
        const allowed = new Set(candidates);
        const valid = (chosen ?? []).filter((c) => allowed.has(c.start));
        if (valid.length) picks = valid.slice(0, 3);
      } catch {
        picks = null;
      }
    }
    return {
      suggestions: picks ?? pickNearOriginalTime(candidates, context.originalStart, params.timeZone),
      bookingPath,
      prefill,
    };
  }

  private canRebook(booking: CancelledBooking) {
    return (
      booking.status === BookingStatus.CANCELLED &&
      !booking.rescheduled &&
      !!booking.eventType &&
      !booking.eventType.teamId &&
      !!booking.user?.username
    );
  }

  private answersFrom(booking: CancelledBooking) {
    const responses = (booking.responses ?? {}) as Record<string, unknown>;
    const fields = (
      Array.isArray(booking.eventType?.bookingFields) ? booking.eventType?.bookingFields : []
    ) as FieldWithLabel[];
    return Object.entries(responses)
      .filter(([name]) => !SYSTEM_FIELDS.has(name))
      .map(([name, value]) => {
        const field = fields.find((f) => f.name === name);
        return {
          question: field?.label || field?.defaultLabel || name,
          answer: asText(value).slice(0, 1000),
        };
      })
      .filter((a) => a.answer);
  }

  /** Name, email and their earlier answers, so the booking form opens already filled in. */
  private prefillFrom(booking: CancelledBooking) {
    const responses = (booking.responses ?? {}) as Record<string, unknown>;
    const prefill: Record<string, string> = {};
    for (const [name, value] of Object.entries(responses)) {
      if (["location", "guests", "rescheduleReason"].includes(name)) continue;
      const text = asText(value);
      if (text) prefill[name] = text.slice(0, 1000);
    }
    const attendee = booking.attendees[0];
    if (attendee) {
      prefill.name ||= attendee.name;
      prefill.email ||= attendee.email;
    }
    return prefill;
  }
}

/** Fallback: up to three times on different days, closest to the original time of day. */
export function pickNearOriginalTime(
  candidates: string[],
  originalStart: string,
  timeZone: string
): RebookSuggestion[] {
  const original = dayjs(originalStart).tz(timeZone);
  const originalMinutes = original.hour() * 60 + original.minute();
  const bestPerDay = new Map<string, { start: string; distance: number }>();
  for (const iso of candidates) {
    const local = dayjs(iso).tz(timeZone);
    const day = local.format("YYYY-MM-DD");
    const distance = Math.abs(local.hour() * 60 + local.minute() - originalMinutes);
    const current = bestPerDay.get(day);
    if (!current || distance < current.distance) bestPerDay.set(day, { start: iso, distance });
  }
  return Array.from(bestPerDay.values())
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 3)
    .map(({ start }) => ({ start, reason: null }));
}
