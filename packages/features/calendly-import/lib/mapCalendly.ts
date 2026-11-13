import slugify from "@calcom/lib/slugify";
import type { CalendlyAvailabilitySchedule, CalendlyEventType, CalendlyRule } from "./calendlyClient";

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const MIN_LENGTH = 5;
const MAX_LENGTH = 720;

export type ServiceDraft = {
  calendlyUri: string;
  title: string;
  slug: string;
  length: number;
  description: string | null;
  hidden: boolean;
};

export function toServiceDraft(eventType: CalendlyEventType): ServiceDraft {
  const length = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.round(eventType.duration || 30)));
  const slug = slugify(eventType.slug || eventType.name) || `meeting-${length}`;
  return {
    calendlyUri: eventType.uri,
    title: eventType.name.trim().slice(0, 255) || `${length} min meeting`,
    slug,
    length,
    description: eventType.description_plain?.trim() || null,
    hidden: !eventType.active || !!eventType.secret,
  };
}

/** Appends -2, -3… so imported services never collide with existing URLs. */
export function uniqueSlug(slug: string, taken: Set<string>): string {
  if (!taken.has(slug)) return slug;
  for (let n = 2; ; n++) {
    const candidate = `${slug}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return Math.min(24 * 60, (h || 0) * 60 + (m || 0));
};

/** Calendly-style weekly hours: Sunday-first array of [startMinute, endMinute] ranges. */
export type WeeklyHours = { start: number; end: number }[][];

export function toWeeklyHours(schedule: Pick<CalendlyAvailabilitySchedule, "rules">): WeeklyHours {
  const week: WeeklyHours = WEEKDAYS.map(() => []);
  for (const rule of schedule.rules as CalendlyRule[]) {
    if (rule.type !== "wday") continue;
    const day = WEEKDAYS.indexOf(rule.wday.toLowerCase());
    if (day === -1) continue;
    for (const interval of rule.intervals) {
      const start = toMinutes(interval.from);
      // Calendly ends a full day at "24:00"; Cal stores times within a day, so cap at 23:59.
      const end = Math.min(toMinutes(interval.to), 24 * 60 - 1);
      if (end > start) week[day].push({ start, end });
    }
  }
  return week;
}

export function describeWeeklyHours(week: WeeklyHours): string {
  const fmt = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const parts = week
    .map((ranges, day) =>
      ranges.length ? `${names[day]} ${ranges.map((r) => `${fmt(r.start)}-${fmt(r.end)}`).join(", ")}` : null
    )
    .filter(Boolean);
  return parts.length ? parts.join("; ") : "No weekly hours";
}
