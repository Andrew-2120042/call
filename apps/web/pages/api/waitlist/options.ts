import dayjs from "@calcom/dayjs";
import { getBookingFieldsWithSystemFields } from "@calcom/features/bookings/lib/getBookingFields";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import getIP from "@calcom/lib/getIP";
import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";
import { piiHasher } from "@calcom/lib/server/PiiHasher";
import { prisma } from "@calcom/prisma";
import { BookingStatus, SchedulingType } from "@calcom/prisma/enums";
import type { NextApiRequest } from "next";
import { z } from "zod";

const querySchema = z.object({
  eventTypeId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeZone: z.string().min(1).max(64),
});

const isValidTimeZone = (timeZone: string) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
};

const ASKABLE_TYPES = new Set(["text", "textarea", "select", "radio", "number", "phone", "boolean"]);

type FieldLike = {
  name: string;
  type: string;
  label?: string;
  defaultLabel?: string;
  required?: boolean;
  hidden?: boolean;
  editable?: string;
  options?: { label: string; value: string }[];
};

// Public: what the join-the-waitlist page needs. Only times are exposed, never who booked them.
async function handler(req: NextApiRequest) {
  if (req.method !== "GET") throw new HttpError({ statusCode: 405, message: "Use GET" });
  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: `waitlistOptions:${piiHasher.hash(getIP(req))}`,
  });
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success)
    throw new ErrorWithCode(ErrorCode.BadRequest, "eventTypeId, date and timeZone are required");
  const { eventTypeId, date, timeZone } = parsed.data;
  if (!isValidTimeZone(timeZone)) throw new ErrorWithCode(ErrorCode.BadRequest, "Unknown time zone");

  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    select: {
      title: true,
      length: true,
      userId: true,
      waitlistEnabled: true,
      hidden: true,
      locations: true,
      bookingFields: true,
      disableGuests: true,
      customInputs: true,
      metadata: true,
      teamId: true,
      schedulingType: true,
      owner: { select: { name: true } },
      team: { select: { name: true } },
      hosts: { select: { userId: true } },
    },
  });
  if (
    !eventType ||
    !eventType.waitlistEnabled ||
    eventType.hidden ||
    (!eventType.userId && !eventType.teamId)
  ) {
    throw new ErrorWithCode(ErrorCode.NotFound, "This service doesn't have a waitlist");
  }

  const dayStart = dayjs.tz(date, timeZone).startOf("day");
  const dayEnd = dayStart.add(1, "day");
  const now = new Date();
  const taken = await prisma.booking.findMany({
    where: {
      eventTypeId,
      status: { in: [BookingStatus.ACCEPTED, BookingStatus.AWAITING_HOST] },
      startTime: { gte: dayStart.toDate() > now ? dayStart.toDate() : now, lt: dayEnd.toDate() },
    },
    select: { startTime: true, endTime: true, userId: true },
    orderBy: { startTime: "asc" },
  });
  // A team round-robin time is only taken once every host has a booking at it.
  const hostCount = eventType.hosts.length;
  const needsEveryHost = !eventType.userId && eventType.schedulingType === SchedulingType.ROUND_ROBIN;
  const hostsBusyAt = new Map<string, Set<number | null>>();
  for (const booking of taken) {
    const key = `${booking.startTime.toISOString()}|${booking.endTime.toISOString()}`;
    hostsBusyAt.set(key, (hostsBusyAt.get(key) ?? new Set()).add(booking.userId));
  }
  const fullTimes = Array.from(hostsBusyAt.entries())
    .filter(([, hosts]) => !needsEveryHost || hosts.size >= hostCount)
    .map(([key]) => {
      const [start, end] = key.split("|");
      return { startTime: new Date(start), endTime: new Date(end) };
    });

  const fields = (
    getBookingFieldsWithSystemFields({
      bookingFields: eventType.bookingFields,
      disableGuests: eventType.disableGuests,
      customInputs: eventType.customInputs,
      metadata: eventType.metadata,
    }) as FieldLike[]
  )
    .filter(
      (field) =>
        !field.hidden &&
        (field.name === "name" ||
          field.name === "email" ||
          (field.editable === "user" && ASKABLE_TYPES.has(field.type)))
    )
    .map((field) => ({
      name: field.name,
      type: field.name === "name" ? "text" : field.type,
      label: field.label || field.defaultLabel || field.name,
      required: !!field.required,
      options: field.options ?? null,
    }));

  const locations = Array.isArray(eventType.locations) ? (eventType.locations as { type?: string }[]) : [];
  return {
    title: eventType.title,
    hostName: eventType.owner?.name ?? eventType.team?.name ?? null,
    length: eventType.length,
    defaultLocation: locations[0]?.type ?? null,
    fields,
    takenTimes: fullTimes
      .filter((b) => (b.endTime.getTime() - b.startTime.getTime()) / 60_000 === eventType.length)
      .map((b) => ({ start: b.startTime.toISOString(), end: b.endTime.toISOString() })),
  };
}

export default defaultResponder(handler, "/api/waitlist/options");
