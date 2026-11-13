import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import type { ICalendlyClient } from "../lib/calendlyClient";
import {
  describeWeeklyHours,
  type ServiceDraft,
  toServiceDraft,
  toWeeklyHours,
  uniqueSlug,
  type WeeklyHours,
} from "../lib/mapCalendly";

export interface ICalendlyImportRepository {
  findExistingServices(userId: number): Promise<{ slugs: string[]; importedUris: string[] }>;
  createService(userId: number, draft: ServiceDraft & { slug: string }): Promise<{ id: number }>;
  findScheduleIdByName(userId: number, name: string): Promise<number | null>;
  createSchedule(params: {
    userId: number;
    name: string;
    timeZone: string;
    week: WeeklyHours;
  }): Promise<number>;
  setDefaultSchedule(userId: number, scheduleId: number, onlyIfUnset: boolean): Promise<void>;
}

export type CalendlyPreview = {
  account: { name: string; email: string; timeZone: string };
  services: {
    uri: string;
    title: string;
    length: number;
    hidden: boolean;
    alreadyImported: boolean;
  }[];
  schedules: { uri: string; name: string; isDefault: boolean; timeZone: string; summary: string }[];
};

export type CalendlyImportRequest = {
  serviceUris: string[];
  scheduleUri: string | null;
  makeScheduleDefault: boolean;
};

export type CalendlyImportResult = {
  created: { id: number; title: string; slug: string }[];
  skipped: { title: string; reason: "already_imported" }[];
  scheduleId: number | null;
};

export class CalendlyImportService {
  constructor(
    private readonly deps: {
      repository: ICalendlyImportRepository;
      clientFor: (token: string) => ICalendlyClient;
    }
  ) {}

  async preview(userId: number, token: string): Promise<CalendlyPreview> {
    const client = this.deps.clientFor(token);
    const me = await client.getMe();
    const [eventTypes, schedules, existing] = await Promise.all([
      client.listEventTypes(me.uri),
      client.listAvailabilitySchedules(me.uri),
      this.deps.repository.findExistingServices(userId),
    ]);
    const imported = new Set(existing.importedUris);
    return {
      account: { name: me.name, email: me.email, timeZone: me.timezone },
      services: eventTypes.map((eventType) => {
        const draft = toServiceDraft(eventType);
        return {
          uri: draft.calendlyUri,
          title: draft.title,
          length: draft.length,
          hidden: draft.hidden,
          alreadyImported: imported.has(draft.calendlyUri),
        };
      }),
      schedules: schedules.map((schedule) => ({
        uri: schedule.uri,
        name: schedule.name,
        isDefault: schedule.default,
        timeZone: schedule.timezone,
        summary: describeWeeklyHours(toWeeklyHours(schedule)),
      })),
    };
  }

  /** Safe to run again: services already imported are skipped and the schedule is reused by name. */
  async run(userId: number, token: string, request: CalendlyImportRequest): Promise<CalendlyImportResult> {
    const client = this.deps.clientFor(token);
    const me = await client.getMe();
    const wanted = new Set(request.serviceUris);
    const [eventTypes, schedules, existing] = await Promise.all([
      wanted.size ? client.listEventTypes(me.uri) : Promise.resolve([]),
      request.scheduleUri ? client.listAvailabilitySchedules(me.uri) : Promise.resolve([]),
      this.deps.repository.findExistingServices(userId),
    ]);

    const takenSlugs = new Set(existing.slugs);
    const imported = new Set(existing.importedUris);
    const result: CalendlyImportResult = { created: [], skipped: [], scheduleId: null };

    for (const eventType of eventTypes) {
      if (!wanted.has(eventType.uri)) continue;
      const draft = toServiceDraft(eventType);
      if (imported.has(draft.calendlyUri)) {
        result.skipped.push({ title: draft.title, reason: "already_imported" });
        continue;
      }
      const slug = uniqueSlug(draft.slug, takenSlugs);
      takenSlugs.add(slug);
      const { id } = await this.deps.repository.createService(userId, { ...draft, slug });
      imported.add(draft.calendlyUri);
      result.created.push({ id, title: draft.title, slug });
    }

    if (request.scheduleUri) {
      const schedule = schedules.find((s) => s.uri === request.scheduleUri);
      if (!schedule) throw new ErrorWithCode(ErrorCode.NotFound, "That Calendly schedule wasn't found");
      const name = `${schedule.name} (from Calendly)`;
      const existingId = await this.deps.repository.findScheduleIdByName(userId, name);
      const scheduleId =
        existingId ??
        (await this.deps.repository.createSchedule({
          userId,
          name,
          timeZone: schedule.timezone,
          week: toWeeklyHours(schedule),
        }));
      await this.deps.repository.setDefaultSchedule(userId, scheduleId, !request.makeScheduleDefault);
      result.scheduleId = scheduleId;
    }
    return result;
  }
}
