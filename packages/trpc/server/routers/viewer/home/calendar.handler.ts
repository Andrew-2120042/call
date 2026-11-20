import dayjs from "@calcom/dayjs";
import { WEBAPP_URL } from "@calcom/lib/constants";
import { prisma } from "@calcom/prisma";
import { BookingStatus, WaitlistEntryStatus } from "@calcom/prisma/enums";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import { z } from "zod";
import type { THomeCalendarInput } from "./calendar.schema";

type Options = { ctx: { user: NonNullable<TrpcSessionUser> }; input: THomeCalendarInput };

const SHOWN = [BookingStatus.ACCEPTED, BookingStatus.PENDING];

// Filled in by the form itself (name, email) or handled by the booking flow (location, hidden title).
const FORM_HANDLED_FIELDS = new Set(["name", "email", "location", "title"]);
const bookingFieldSchema = z
  .object({
    name: z.string(),
    type: z.string(),
    label: z.string().optional(),
    defaultLabel: z.string().optional(),
    required: z.boolean().optional(),
    hidden: z.boolean().optional(),
    options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  })
  .passthrough();

/** The questions a host has to answer when adding a booking for a client: the service's required, visible ones. */
function requiredQuestions(bookingFields: unknown) {
  const parsed = z.array(bookingFieldSchema).safeParse(bookingFields);
  if (!parsed.success) return [];
  return parsed.data
    .filter((field) => field.required && !field.hidden && !FORM_HANDLED_FIELDS.has(field.name))
    .map((field) => ({
      name: field.name,
      type: field.type,
      label: field.label || field.defaultLabel || field.name,
      options: field.options ?? [],
    }));
}

/** Everything on the host's month at a glance: bookings and requests per day, and how many people wait for each day. */
export const calendarHandler = async ({ ctx, input }: Options) => {
  const userId = ctx.user.id;
  const timeZone = ctx.user.timeZone;
  const monthStart = dayjs.tz(`${input.month}-01`, timeZone).startOf("month");
  // The grid shows whole weeks, so include the days around the month too.
  const from = monthStart.startOf("week").subtract(1, "day").toDate();
  const to = monthStart.endOf("month").endOf("week").add(1, "day").toDate();

  const [bookings, waiting, services] = await Promise.all([
    prisma.booking.findMany({
      where: { userId, startTime: { gte: from, lt: to }, status: { in: SHOWN } },
      orderBy: { startTime: "asc" },
      take: 1000,
      select: {
        uid: true,
        title: true,
        startTime: true,
        status: true,
        eventType: { select: { title: true } },
        attendees: { select: { name: true }, take: 1 },
      },
    }),
    prisma.waitlistEntry.findMany({
      where: {
        eventType: { userId },
        status: { in: [WaitlistEntryStatus.WAITING, WaitlistEntryStatus.OFFERED] },
        startTime: { gte: from, lt: to },
      },
      orderBy: [{ startTime: "asc" }, { createdAt: "asc" }],
      select: { uid: true, name: true, startTime: true, status: true },
      take: 2000,
    }),
    prisma.eventType.findMany({
      where: { userId, teamId: null, hidden: false },
      orderBy: [{ position: "desc" }, { id: "asc" }],
      take: 20,
      select: { id: true, title: true, slug: true, length: true, bookingFields: true },
    }),
  ]);

  const waitlistByDay: Record<string, number> = {};
  for (const entry of waiting) {
    const day = dayjs(entry.startTime).tz(timeZone).format("YYYY-MM-DD");
    waitlistByDay[day] = (waitlistByDay[day] ?? 0) + 1;
  }

  return {
    timeZone,
    bookings: bookings.map((booking) => ({
      uid: booking.uid,
      day: dayjs(booking.startTime).tz(timeZone).format("YYYY-MM-DD"),
      time: dayjs(booking.startTime).tz(timeZone).format("h:mma"),
      attendeeName: booking.attendees[0]?.name ?? booking.title,
      isRequest: booking.status === BookingStatus.PENDING,
      service: booking.eventType?.title ?? "",
    })),
    waitlistByDay,
    waitlist: waiting.map((entry) => ({
      uid: entry.uid,
      day: dayjs(entry.startTime).tz(timeZone).format("YYYY-MM-DD"),
      time: dayjs(entry.startTime).tz(timeZone).format("h:mma"),
      name: entry.name,
      offered: entry.status === WaitlistEntryStatus.OFFERED,
    })),
    // The host adds a booking by booking their own page for the client, so the page links are all that's needed.
    username: ctx.user.username ?? "",
    bookingPageUrl: `${WEBAPP_URL}/${ctx.user.username ?? ""}`,
    services: services.map(({ bookingFields, ...service }) => ({
      ...service,
      questions: requiredQuestions(bookingFields),
    })),
  };
};
