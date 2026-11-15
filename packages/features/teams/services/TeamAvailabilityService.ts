import dayjs from "@calcom/dayjs";

export type Range = { start: Date; end: Date };
export type TeamMemberRef = { id: number; name: string };

export interface ITeamAvailabilityDeps {
  listMembers(teamId: number): Promise<TeamMemberRef[]>;
  /** Free time for a user (working hours minus bookings and calendar busy times). */
  getFreeRanges(params: { userId: number; from: Date; to: Date }): Promise<Range[]>;
  now?: () => Date;
}

export type CoverageHour = { hour: number; free: number[] };
export type CoverageDay = { date: string; weekday: number; hours: CoverageHour[] };
export type CoverageGap = { date: string; startHour: number; endHour: number };

export type TeamCoverage = {
  timeZone: string;
  members: TeamMemberRef[];
  /** Members whose free time couldn't be read (for example, no working hours set); shown as busy. */
  unreadable: TeamMemberRef[];
  firstHour: number;
  lastHour: number;
  days: CoverageDay[];
  gaps: CoverageGap[];
};

const FIRST_HOUR = 7;
const LAST_HOUR = 20;
/** Gaps are only reported inside normal working hours on weekdays, where they actually cost bookings. */
const GAP_FROM = 9;
const GAP_TO = 17;
const MIN_GAP_HOURS = 1;

const covers = (ranges: Range[], start: number, end: number) =>
  ranges.some((r) => r.start.getTime() <= start && r.end.getTime() >= end);

/** Who on the team is free, hour by hour, over the coming week, and the weekday stretches nobody covers. */
export class TeamAvailabilityService {
  constructor(private readonly deps: ITeamAvailabilityDeps) {}

  async getCoverage({
    teamId,
    timeZone,
    days = 7,
  }: {
    teamId: number;
    timeZone: string;
    days?: number;
  }): Promise<TeamCoverage> {
    const now = this.deps.now?.() ?? new Date();
    const startOfToday = dayjs(now).tz(timeZone).startOf("day");
    const from = startOfToday.toDate();
    const to = startOfToday.add(days, "day").toDate();
    const members = await this.deps.listMembers(teamId);
    const freeByMember = await Promise.all(
      members.map(async (m) => {
        try {
          return { id: m.id, ranges: await this.deps.getFreeRanges({ userId: m.id, from, to }), ok: true };
        } catch {
          return { id: m.id, ranges: [] as Range[], ok: false };
        }
      })
    );
    const unreadableIds = new Set(freeByMember.filter((m) => !m.ok).map((m) => m.id));

    const coverageDays: CoverageDay[] = [];
    for (let d = 0; d < days; d++) {
      const day = startOfToday.add(d, "day");
      const hours: CoverageHour[] = [];
      for (let h = FIRST_HOUR; h < LAST_HOUR; h++) {
        const start = day.hour(h).valueOf();
        const end = day.hour(h + 1).valueOf();
        hours.push({
          hour: h,
          free: freeByMember.filter((m) => covers(m.ranges, start, end)).map((m) => m.id),
        });
      }
      coverageDays.push({ date: day.format("YYYY-MM-DD"), weekday: day.day(), hours });
    }

    return {
      timeZone,
      members,
      unreadable: members.filter((m) => unreadableIds.has(m.id)),
      firstHour: FIRST_HOUR,
      lastHour: LAST_HOUR,
      days: coverageDays,
      gaps: findGaps(coverageDays, now, timeZone),
    };
  }
}

export function findGaps(days: CoverageDay[], now: Date, timeZone: string): CoverageGap[] {
  const nowLocal = dayjs(now).tz(timeZone);
  const gaps: CoverageGap[] = [];
  for (const day of days) {
    if (day.weekday === 0 || day.weekday === 6) continue;
    let runStart: number | null = null;
    const flush = (endHour: number) => {
      if (runStart !== null && endHour - runStart >= MIN_GAP_HOURS)
        gaps.push({ date: day.date, startHour: runStart, endHour });
      runStart = null;
    };
    for (const slot of day.hours) {
      if (slot.hour < GAP_FROM || slot.hour >= GAP_TO) continue;
      // Hours already gone today can't be booked, so they aren't a gap worth fixing.
      const isPast = day.date === nowLocal.format("YYYY-MM-DD") && slot.hour < nowLocal.hour() + 1;
      if (slot.free.length === 0 && !isPast) {
        if (runStart === null) runStart = slot.hour;
      } else {
        flush(slot.hour);
      }
    }
    flush(GAP_TO);
  }
  return gaps;
}
