import { getAvailabilityFromSchedule } from "@calcom/lib/availability";
import type { PrismaClient } from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";
import type { ServiceDraft, WeeklyHours } from "../lib/mapCalendly";
import type { ICalendlyImportRepository } from "../services/CalendlyImportService";

type ImportMetadata = { importedFrom?: { source?: string; uri?: string } };

const minutesToTime = (minutes: number) =>
  new Date(Date.UTC(1970, 0, 1, Math.floor(minutes / 60), minutes % 60, 0, 0));

export class CalendlyImportRepository implements ICalendlyImportRepository {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly serviceDefaults: {
      profileId: number | null;
      locations: Prisma.EventTypeCreateInput["locations"];
    }
  ) {}

  async findExistingServices(userId: number) {
    const rows = await this.prismaClient.eventType.findMany({
      where: { userId, teamId: null },
      select: { slug: true, metadata: true },
    });
    const importedUris: string[] = [];
    for (const row of rows) {
      const meta = (row.metadata ?? {}) as ImportMetadata;
      if (meta.importedFrom?.source === "calendly" && meta.importedFrom.uri)
        importedUris.push(meta.importedFrom.uri);
    }
    return { slugs: rows.map((row) => row.slug), importedUris };
  }

  async createService(userId: number, draft: ServiceDraft) {
    const created = await this.prismaClient.eventType.create({
      data: {
        title: draft.title,
        slug: draft.slug,
        length: draft.length,
        description: draft.description,
        hidden: draft.hidden,
        owner: { connect: { id: userId } },
        users: { connect: { id: userId } },
        locations: this.serviceDefaults.locations,
        metadata: { importedFrom: { source: "calendly", uri: draft.calendlyUri } },
        ...(this.serviceDefaults.profileId
          ? { profile: { connect: { id: this.serviceDefaults.profileId } } }
          : {}),
      },
      select: { id: true },
    });
    return { id: created.id };
  }

  async findScheduleIdByName(userId: number, name: string) {
    const row = await this.prismaClient.schedule.findFirst({ where: { userId, name }, select: { id: true } });
    return row?.id ?? null;
  }

  async createSchedule(params: { userId: number; name: string; timeZone: string; week: WeeklyHours }) {
    const ranges = params.week.map((day) =>
      day.map((range) => ({ start: minutesToTime(range.start), end: minutesToTime(range.end) }))
    );
    const availability = getAvailabilityFromSchedule(ranges);
    const schedule = await this.prismaClient.schedule.create({
      data: {
        name: params.name,
        timeZone: params.timeZone,
        user: { connect: { id: params.userId } },
        availability: {
          createMany: {
            data: availability.map((a) => ({ days: a.days, startTime: a.startTime, endTime: a.endTime })),
          },
        },
      },
      select: { id: true },
    });
    return schedule.id;
  }

  async setDefaultSchedule(userId: number, scheduleId: number, onlyIfUnset: boolean) {
    await this.prismaClient.user.updateMany({
      where: onlyIfUnset ? { id: userId, defaultScheduleId: null } : { id: userId },
      data: { defaultScheduleId: scheduleId },
    });
  }
}
