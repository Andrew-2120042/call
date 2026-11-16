import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import { BookingRequestFit } from "@calcom/prisma/enums";
import type {
  IBookingRequestInsightRepository,
  InsightRecord,
  PendingRequest,
} from "../repositories/BookingRequestInsightRepository";

export type RequestAnswer = { question: string; answer: string };

export type RequestForAnalysis = {
  serviceTitle: string;
  serviceDescription: string | null;
  requesterName: string;
  requesterEmail: string;
  answers: RequestAnswer[];
};

export type GeneratedInsight = {
  summary: string;
  fit: "good" | "unclear" | "poor";
  spamLikely: boolean;
  concerns: string[];
  suggestedReply: string;
};

/** Returns null when the model declined or produced no usable output; the request stays un-analysed. */
export type GenerateInsight = (
  request: RequestForAnalysis
) => Promise<{ insight: GeneratedInsight; model: string } | null>;

export interface IBookingRequestInsightServiceDeps {
  repository: IBookingRequestInsightRepository;
  generate: GenerateInsight | null;
  now?: () => Date;
  logger?: { error: (...args: unknown[]) => void };
  /** Whether the host's plan currently includes AI insights; omitted means always allowed. */
  isHostEntitled?: (userId: number) => Promise<boolean>;
  /** Delivers the host's message to the person who requested the booking. */
  sendHostReply?: (reply: HostReply) => Promise<void>;
}

export type HostReply = {
  to: { name: string; email: string; timeZone: string; locale: string | null };
  host: { name: string; email: string };
  serviceTitle: string;
  startTime: Date;
  message: string;
};

export const MAX_REPLY_LENGTH = 4000;

const MAX_PER_RUN = 20;
const LOOKBACK_DAYS = 7;
const MAX_ANSWER_LENGTH = 2000;
const SYSTEM_FIELDS_SKIPPED = new Set(["location", "guests", "rescheduleReason", "attendeePhoneNumber"]);

const FIT_MAP: Record<GeneratedInsight["fit"], BookingRequestFit> = {
  good: BookingRequestFit.GOOD,
  unclear: BookingRequestFit.UNCLEAR,
  poor: BookingRequestFit.POOR,
};

const stringify = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(stringify).filter(Boolean).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

type FieldWithLabel = { name?: string; label?: string; defaultLabel?: string };

/** Turns stored booking responses into labelled question/answer pairs for the model. */
export const buildRequestForAnalysis = (booking: PendingRequest): RequestForAnalysis => {
  const responses = (booking.responses ?? {}) as Record<string, unknown>;
  const fields = (Array.isArray(booking.eventType?.bookingFields) ? booking.eventType?.bookingFields : []) as
    | FieldWithLabel[]
    | [];
  const labelOf = (name: string) => {
    const field = fields.find((f) => f.name === name);
    return field?.label || field?.defaultLabel || name;
  };

  const answers: RequestAnswer[] = [];
  for (const [name, value] of Object.entries(responses)) {
    if (name === "name" || name === "email" || SYSTEM_FIELDS_SKIPPED.has(name)) continue;
    const answer = stringify(value).slice(0, MAX_ANSWER_LENGTH);
    if (answer) answers.push({ question: labelOf(name), answer });
  }

  const name = responses.name;
  return {
    serviceTitle: booking.eventType?.title ?? booking.title,
    serviceDescription: booking.eventType?.description ?? null,
    requesterName:
      typeof name === "string"
        ? name
        : typeof name === "object" && name
          ? stringify(Object.values(name))
          : "",
    requesterEmail: stringify(responses.email),
    answers,
  };
};

export class BookingRequestInsightService {
  private readonly now: () => Date;

  constructor(private readonly deps: IBookingRequestInsightServiceDeps) {
    this.now = deps.now ?? (() => new Date());
  }

  get isEnabled() {
    return this.deps.generate !== null;
  }

  /** Cron entry point: analyse recent pending requests that don't have an insight yet. */
  async analysePendingRequests() {
    if (!this.deps.generate) return { analysed: 0, skipped: "no_api_key" as const };
    const now = this.now();
    const pending = await this.deps.repository.findPendingWithoutInsight({
      now,
      createdAfter: new Date(now.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000),
      limit: MAX_PER_RUN,
    });

    let analysed = 0;
    for (const booking of pending) {
      if (booking.userId && this.deps.isHostEntitled && !(await this.deps.isHostEntitled(booking.userId))) continue;
      try {
        const result = await this.deps.generate(buildRequestForAnalysis(booking));
        if (!result) continue;
        const record: InsightRecord = {
          summary: result.insight.summary,
          fit: FIT_MAP[result.insight.fit],
          spamLikely: result.insight.spamLikely,
          concerns: result.insight.concerns.slice(0, 5),
          suggestedReply: result.insight.suggestedReply,
          model: result.model,
        };
        if (await this.deps.repository.save(booking.id, record)) analysed++;
      } catch (error) {
        // One failing request (rate limit, outage) must not block the rest of the batch.
        this.deps.logger?.error("[request-insights] analysis failed", { bookingId: booking.id, error });
      }
    }
    return { analysed, skipped: null };
  }

  async getForHost(params: { bookingUid: string; userId: number }) {
    return this.deps.repository.findByBookingUidForHost(params);
  }

  /** Sends the host's (possibly edited) reply to the requester of one of the host's own booking requests. */
  async sendReply(params: { bookingUid: string; userId: number; message: string }) {
    const message = params.message.trim();
    if (!message) throw ErrorWithCode.Factory.BadRequest("Write a message before sending it.");
    if (message.length > MAX_REPLY_LENGTH)
      throw ErrorWithCode.Factory.BadRequest(`Keep the message under ${MAX_REPLY_LENGTH} characters.`);
    if (!this.deps.sendHostReply) throw new ErrorWithCode(ErrorCode.InternalServerError, "Email is not configured.");

    const booking = await this.deps.repository.findByUidForHostIncludeAttendees({
      bookingUid: params.bookingUid,
      userId: params.userId,
    });
    const attendee = booking?.attendees[0];
    if (!booking || !attendee || !booking.user?.email) throw ErrorWithCode.Factory.NotFound("Booking not found.");

    await this.deps.sendHostReply({
      to: { name: attendee.name, email: attendee.email, timeZone: attendee.timeZone, locale: attendee.locale },
      host: { name: booking.user.name || booking.user.email, email: booking.user.email },
      serviceTitle: booking.eventType?.title || booking.title,
      startTime: booking.startTime,
      message,
    });
    return { sentTo: attendee.email };
  }
}
