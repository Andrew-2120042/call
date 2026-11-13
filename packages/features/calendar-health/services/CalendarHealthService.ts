export type CalendarConnection = {
  credentialId: number;
  userId: number;
  appName: string;
  /** Set by the calendar integrations when a token refresh is rejected. */
  invalid: boolean;
};

export type HealthRecord = {
  credentialId: number;
  userId: number;
  healthy: boolean;
  lastError: string | null;
  consecutiveFailures: number;
  checkedAt: Date;
  brokenSince: Date | null;
  alertSentAt: Date | null;
};

export type ProbeResult = { ok: true } | { ok: false; error: string };

export interface ICalendarHealthRepository {
  listDue(params: { checkedBefore: Date; limit: number }): Promise<CalendarConnection[]>;
  findByCredentialId(credentialId: number): Promise<HealthRecord | null>;
  save(record: HealthRecord): Promise<void>;
  listBrokenForUser(
    userId: number
  ): Promise<{ credentialId: number; appName: string; lastError: string | null }[]>;
}

export interface ICalendarHealthNotifier {
  sendBroken(params: { userId: number; appName: string; error: string }): Promise<void>;
}

export interface ICalendarHealthServiceDeps {
  repository: ICalendarHealthRepository;
  probe: (credentialId: number) => Promise<ProbeResult>;
  notifier: ICalendarHealthNotifier;
  now?: () => Date;
  logger?: { warn: (...args: unknown[]) => void };
}

/** Connections are re-checked at most this often. */
export const CHECK_INTERVAL_MINUTES = 55;
/** Network blips happen; only alert after this many failed checks in a row (revoked access alerts at once). */
export const FAILURES_BEFORE_ALERT = 2;
export const BATCH_SIZE = 25;

export type HealthRunSummary = { checked: number; broken: number; recovered: number; alerted: number };

export class CalendarHealthService {
  private readonly now: () => Date;

  constructor(private readonly deps: ICalendarHealthServiceDeps) {
    this.now = deps.now ?? (() => new Date());
  }

  async checkDue(): Promise<HealthRunSummary> {
    const now = this.now();
    const due = await this.deps.repository.listDue({
      checkedBefore: new Date(now.getTime() - CHECK_INTERVAL_MINUTES * 60_000),
      limit: BATCH_SIZE,
    });
    const summary: HealthRunSummary = { checked: 0, broken: 0, recovered: 0, alerted: 0 };
    // Sequential on purpose: each probe calls a calendar provider and we don't want to burst their rate limits.
    for (const connection of due) {
      const outcome = await this.checkOne(connection);
      summary.checked++;
      if (outcome === "broken" || outcome === "alerted") summary.broken++;
      if (outcome === "alerted") summary.alerted++;
      if (outcome === "recovered") summary.recovered++;
    }
    return summary;
  }

  async checkOne(connection: CalendarConnection): Promise<"ok" | "recovered" | "broken" | "alerted"> {
    const now = this.now();
    const previous = await this.deps.repository.findByCredentialId(connection.credentialId);
    let result: ProbeResult;
    if (connection.invalid) {
      result = { ok: false, error: "Access was revoked or expired" };
    } else {
      try {
        result = await this.deps.probe(connection.credentialId);
      } catch (error) {
        result = { ok: false, error: error instanceof Error ? error.message : "Check failed" };
      }
    }

    if (result.ok) {
      await this.deps.repository.save({
        credentialId: connection.credentialId,
        userId: connection.userId,
        healthy: true,
        lastError: null,
        consecutiveFailures: 0,
        checkedAt: now,
        brokenSince: null,
        alertSentAt: null,
      });
      return previous && !previous.healthy ? "recovered" : "ok";
    }

    const consecutiveFailures = (previous?.healthy === false ? previous.consecutiveFailures : 0) + 1;
    const shouldAlert =
      !previous?.alertSentAt && (connection.invalid || consecutiveFailures >= FAILURES_BEFORE_ALERT);
    let alertSentAt = previous?.healthy === false ? (previous.alertSentAt ?? null) : null;
    if (shouldAlert) {
      try {
        await this.deps.notifier.sendBroken({
          userId: connection.userId,
          appName: connection.appName,
          error: result.error,
        });
        alertSentAt = now;
      } catch (error) {
        this.deps.logger?.warn("[calendar-health] alert email failed", {
          credentialId: connection.credentialId,
          error,
        });
      }
    }
    await this.deps.repository.save({
      credentialId: connection.credentialId,
      userId: connection.userId,
      healthy: false,
      lastError: result.error.slice(0, 500),
      consecutiveFailures,
      checkedAt: now,
      brokenSince: previous?.healthy === false ? (previous.brokenSince ?? now) : now,
      alertSentAt,
    });
    return alertSentAt && shouldAlert ? "alerted" : "broken";
  }

  /** Only reports connections we've confirmed broken, so one blip doesn't nag the owner. */
  async getBrokenForUser(userId: number) {
    return this.deps.repository.listBrokenForUser(userId);
  }
}
