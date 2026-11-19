import { timeZoneLabel } from "@calcom/lib/timeZoneLabel";
import { prisma } from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import { TRPCError } from "@trpc/server";
import type { TPeekInputSchema } from "./peek.schema";

type Options = { ctx: { user: NonNullable<TrpcSessionUser> }; input: TPeekInputSchema };

// The booker's name, email and the system's own fields are shown elsewhere in the panel, not as "answers".
const HIDDEN_FIELDS = new Set([
  "name",
  "email",
  "location",
  "guests",
  "rescheduleReason",
  "attendeePhoneNumber",
]);

type Field = { name?: string; label?: string; defaultLabel?: string };

const asText = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(", ");
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("value" in record) return asText(record.value);
    return Object.values(record).map(asText).filter(Boolean).join(", ");
  }
  return "";
};

function answersFrom(responses: unknown, bookingFields: unknown) {
  const fields = (Array.isArray(bookingFields) ? bookingFields : []) as Field[];
  return Object.entries((responses ?? {}) as Record<string, unknown>)
    .filter(([name]) => !HIDDEN_FIELDS.has(name))
    .map(([name, value]) => {
      const field = fields.find((f) => f.name === name);
      // Built-in fields only carry a translation key (e.g. "additional_notes"); the client translates it.
      if (field?.label) return { label: field.label, labelKey: null, value: asText(value) };
      const labelKey = field?.defaultLabel || (name === "notes" ? "additional_notes" : null);
      return { label: labelKey ? null : name.replace(/[_-]+/g, " "), labelKey, value: asText(value) };
    })
    .filter((answer) => answer.value);
}

/** Everything the host needs to judge one booking or waitlist entry, without leaving the page they're on. */
export const peekHandler = async ({ ctx, input }: Options) => {
  const userId = ctx.user.id;

  if (input.kind === "booking") {
    const booking = await prisma.booking.findFirst({
      where: { uid: input.uid, userId },
      select: {
        id: true,
        uid: true,
        status: true,
        startTime: true,
        endTime: true,
        location: true,
        responses: true,
        cancellationReason: true,
        recurringEventId: true,
        eventType: { select: { title: true, bookingFields: true } },
        attendees: { select: { name: true, email: true, timeZone: true, phoneNumber: true }, take: 1 },
        requestInsight: { select: { summary: true, fit: true, spamLikely: true, concerns: true } },
      },
    });
    if (!booking)
      throw new TRPCError({ code: "NOT_FOUND", message: "This booking isn't yours or no longer exists." });
    const attendee = booking.attendees[0];
    return {
      kind: "booking" as const,
      id: booking.id,
      uid: booking.uid,
      recurringEventId: booking.recurringEventId,
      status: booking.status,
      isRequest: booking.status === BookingStatus.PENDING,
      startTime: booking.startTime,
      endTime: booking.endTime,
      service: booking.eventType?.title ?? "",
      location: booking.location?.startsWith("integrations:") ? null : booking.location,
      person: {
        name: attendee?.name ?? "",
        email: attendee?.email ?? "",
        phone: attendee?.phoneNumber ?? null,
        timeZone: attendee?.timeZone ? timeZoneLabel(attendee.timeZone, booking.startTime) : null,
      },
      answers: answersFrom(booking.responses, booking.eventType?.bookingFields),
      insight: booking.requestInsight,
      cancellationReason: booking.cancellationReason,
      waitlist: null,
    };
  }

  const entry = await prisma.waitlistEntry.findFirst({
    where: { uid: input.uid, eventType: { userId } },
    select: {
      uid: true,
      status: true,
      kind: true,
      startTime: true,
      endTime: true,
      rangeStart: true,
      rangeEnd: true,
      name: true,
      email: true,
      timeZone: true,
      responses: true,
      createdAt: true,
      offerStartTime: true,
      offerExpiresAt: true,
      eventTypeId: true,
      eventType: { select: { title: true, bookingFields: true } },
    },
  });
  if (!entry)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "This waitlist entry isn't yours or no longer exists.",
    });
  const ahead = await prisma.waitlistEntry.count({
    where: {
      eventTypeId: entry.eventTypeId,
      startTime: entry.startTime,
      status: { in: ["WAITING", "OFFERED"] },
      createdAt: { lt: entry.createdAt },
    },
  });
  return {
    kind: "waitlist" as const,
    id: null,
    recurringEventId: null,
    uid: entry.uid,
    status: entry.status,
    isRequest: false,
    startTime: entry.startTime,
    endTime: entry.endTime,
    service: entry.eventType.title,
    location: null,
    person: {
      name: entry.name,
      email: entry.email,
      phone: null,
      timeZone: timeZoneLabel(entry.timeZone, entry.startTime),
    },
    answers: answersFrom(entry.responses, entry.eventType.bookingFields),
    insight: null,
    cancellationReason: null,
    waitlist: {
      kind: entry.kind,
      rangeStart: entry.rangeStart,
      rangeEnd: entry.rangeEnd,
      position: ahead + 1,
      joinedAt: entry.createdAt,
      offerStartTime: entry.offerStartTime,
      offerExpiresAt: entry.offerExpiresAt,
    },
  };
};
