import type { PrismaClient } from "@calcom/prisma";
import type {
  CalendarConnection,
  HealthRecord,
  ICalendarHealthRepository,
} from "../services/CalendarHealthService";

const KNOWN_NAMES: Record<string, string> = {
  google_calendar: "Google Calendar",
  office365_calendar: "Outlook Calendar",
  apple_calendar: "Apple Calendar",
  caldav_calendar: "CalDAV calendar",
  ics_calendar: "ICS calendar",
};

export const appNameOf = (credential: { type: string }) =>
  KNOWN_NAMES[credential.type] ??
  credential.type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export class CalendarHealthRepository implements ICalendarHealthRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async listDue(params: { checkedBefore: Date; limit: number }): Promise<CalendarConnection[]> {
    const rows = await this.prismaClient.credential.findMany({
      where: {
        type: { endsWith: "_calendar" },
        userId: { not: null },
        delegationCredentialId: null,
        OR: [{ calendarHealth: null }, { calendarHealth: { checkedAt: { lt: params.checkedBefore } } }],
      },
      select: {
        id: true,
        userId: true,
        type: true,
        invalid: true,
        calendarHealth: { select: { checkedAt: true } },
      },
      take: params.limit * 4,
    });
    // Never-checked first, then the longest-unchecked.
    rows.sort(
      (a, b) => (a.calendarHealth?.checkedAt.getTime() ?? 0) - (b.calendarHealth?.checkedAt.getTime() ?? 0)
    );
    return rows.slice(0, params.limit).map((row) => ({
      credentialId: row.id,
      userId: row.userId as number,
      appName: appNameOf(row),
      invalid: !!row.invalid,
    }));
  }

  findByCredentialId(credentialId: number): Promise<HealthRecord | null> {
    return this.prismaClient.calendarConnectionHealth.findUnique({
      where: { credentialId },
      select: {
        credentialId: true,
        userId: true,
        healthy: true,
        lastError: true,
        consecutiveFailures: true,
        checkedAt: true,
        brokenSince: true,
        alertSentAt: true,
      },
    });
  }

  async save(record: HealthRecord) {
    const { credentialId, ...data } = record;
    await this.prismaClient.calendarConnectionHealth.upsert({
      where: { credentialId },
      create: record,
      update: data,
    });
  }

  async listBrokenForUser(userId: number) {
    const rows = await this.prismaClient.calendarConnectionHealth.findMany({
      where: { userId, healthy: false, alertSentAt: { not: null } },
      select: {
        credentialId: true,
        lastError: true,
        credential: { select: { type: true } },
      },
    });
    return rows.map((row) => ({
      credentialId: row.credentialId,
      appName: appNameOf(row.credential),
      lastError: row.lastError,
    }));
  }
}
