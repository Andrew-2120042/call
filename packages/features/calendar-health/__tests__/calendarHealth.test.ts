import { describe, expect, it, vi } from "vitest";
import {
  type CalendarConnection,
  CalendarHealthService,
  type HealthRecord,
  type ICalendarHealthRepository,
  type ProbeResult,
} from "../services/CalendarHealthService";

function setup(connections: CalendarConnection[]) {
  let clock = new Date("2026-11-14T00:00:00.000Z");
  const records = new Map<number, HealthRecord>();
  const repository: ICalendarHealthRepository = {
    listDue: async ({ checkedBefore, limit }) =>
      connections
        .filter((c) => !records.has(c.credentialId) || records.get(c.credentialId)!.checkedAt < checkedBefore)
        .slice(0, limit),
    findByCredentialId: async (id) => records.get(id) ?? null,
    save: async (record) => {
      records.set(record.credentialId, record);
    },
    listBrokenForUser: async (userId) =>
      [...records.values()]
        .filter((r) => r.userId === userId && !r.healthy && r.alertSentAt)
        .map((r) => ({ credentialId: r.credentialId, appName: "Google Calendar", lastError: r.lastError })),
  };
  const results = new Map<number, ProbeResult | Error>();
  const probe = vi.fn(async (id: number) => {
    const r = results.get(id) ?? { ok: true as const };
    if (r instanceof Error) throw r;
    return r;
  });
  const notifier = { sendBroken: vi.fn().mockResolvedValue(undefined) };
  const service = new CalendarHealthService({ repository, probe, notifier, now: () => clock });
  return {
    service,
    records,
    notifier,
    probe,
    setResult: (id: number, r: ProbeResult | Error) => results.set(id, r),
    advance: (minutes: number) => {
      clock = new Date(clock.getTime() + minutes * 60_000);
    },
  };
}

const google: CalendarConnection = { credentialId: 1, userId: 4, appName: "Google Calendar", invalid: false };

describe("CalendarHealthService", () => {
  it("marks healthy connections and doesn't re-check them within the hour", async () => {
    const ctx = setup([google]);
    expect(await ctx.service.checkDue()).toEqual({ checked: 1, broken: 0, recovered: 0, alerted: 0 });
    ctx.advance(30);
    expect((await ctx.service.checkDue()).checked).toBe(0);
    ctx.advance(30);
    expect((await ctx.service.checkDue()).checked).toBe(1);
  });

  it("doesn't alert on a single blip, alerts once on the second failure, and not again", async () => {
    const ctx = setup([google]);
    ctx.setResult(1, { ok: false, error: "Could not get connected calendars" });
    await ctx.service.checkDue();
    expect(ctx.notifier.sendBroken).not.toHaveBeenCalled();
    expect(await ctx.service.getBrokenForUser(4)).toEqual([]);

    ctx.advance(60);
    expect((await ctx.service.checkDue()).alerted).toBe(1);
    expect(ctx.notifier.sendBroken).toHaveBeenCalledWith({
      userId: 4,
      appName: "Google Calendar",
      error: "Could not get connected calendars",
    });
    expect(await ctx.service.getBrokenForUser(4)).toHaveLength(1);

    ctx.advance(60);
    await ctx.service.checkDue();
    expect(ctx.notifier.sendBroken).toHaveBeenCalledTimes(1);
    expect(ctx.records.get(1)?.consecutiveFailures).toBe(3);
    expect(ctx.records.get(1)?.brokenSince).toEqual(new Date("2026-11-14T00:00:00.000Z"));
  });

  it("alerts immediately when access was revoked, without calling the provider", async () => {
    const ctx = setup([{ ...google, invalid: true }]);
    expect((await ctx.service.checkDue()).alerted).toBe(1);
    expect(ctx.probe).not.toHaveBeenCalled();
  });

  it("treats a thrown probe as a failure", async () => {
    const ctx = setup([google]);
    ctx.setResult(1, new Error("network down"));
    await ctx.service.checkDue();
    expect(ctx.records.get(1)).toMatchObject({ healthy: false, lastError: "network down" });
  });

  it("recovers, clears the alert, and alerts again on a new outage", async () => {
    const ctx = setup([google]);
    ctx.setResult(1, { ok: false, error: "expired" });
    await ctx.service.checkDue();
    ctx.advance(60);
    await ctx.service.checkDue();
    ctx.setResult(1, { ok: true });
    ctx.advance(60);
    expect((await ctx.service.checkDue()).recovered).toBe(1);
    expect(ctx.records.get(1)).toMatchObject({ healthy: true, alertSentAt: null, consecutiveFailures: 0 });
    expect(await ctx.service.getBrokenForUser(4)).toEqual([]);

    ctx.setResult(1, { ok: false, error: "expired again" });
    ctx.advance(60);
    await ctx.service.checkDue();
    ctx.advance(60);
    await ctx.service.checkDue();
    expect(ctx.notifier.sendBroken).toHaveBeenCalledTimes(2);
  });

  it("retries the alert next time if the email failed", async () => {
    const ctx = setup([{ ...google, invalid: true }]);
    ctx.notifier.sendBroken.mockRejectedValueOnce(new Error("smtp down"));
    expect((await ctx.service.checkDue()).alerted).toBe(0);
    expect(ctx.records.get(1)?.alertSentAt).toBeNull();
    ctx.advance(60);
    expect((await ctx.service.checkDue()).alerted).toBe(1);
  });
});
