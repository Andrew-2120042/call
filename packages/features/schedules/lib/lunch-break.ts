import type { TimeRange } from "@calcom/types/schedule";

// Schedule ranges are stored as UTC times on a fixed day; only the hour and minute matter.
const minutesOf = (d: Date | string) => {
  const date = new Date(d);
  return date.getUTCHours() * 60 + date.getUTCMinutes();
};
const atMinutes = (reference: Date | string, minutes: number) => {
  const date = new Date(reference);
  date.setUTCHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date;
};

/**
 * Cuts a break out of one day's ranges: a range that spans the break is split in two, one that overlaps it is
 * trimmed, and one entirely inside it is removed. Ranges outside the break are untouched.
 */
export function addBreakToDay(ranges: TimeRange[], breakStart: number, breakEnd: number): TimeRange[] {
  if (breakEnd <= breakStart) return ranges;
  const result: TimeRange[] = [];
  for (const range of ranges) {
    const start = minutesOf(range.start);
    const end = minutesOf(range.end);
    if (end <= breakStart || start >= breakEnd) {
      result.push(range);
      continue;
    }
    if (start < breakStart) result.push({ start: range.start, end: atMinutes(range.start, breakStart) });
    if (end > breakEnd) result.push({ start: atMinutes(range.start, breakEnd), end: range.end });
  }
  return result;
}

/** Applies the same break to every day of the week that has working hours. Days off stay off. */
export function addBreakToWeek(week: TimeRange[][], breakStart: number, breakEnd: number): TimeRange[][] {
  return week.map((day) => (day.length ? addBreakToDay(day, breakStart, breakEnd) : day));
}
