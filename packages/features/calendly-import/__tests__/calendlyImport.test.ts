import { describe, expect, it, vi } from "vitest";
import {
  type CalendlyAvailabilitySchedule,
  type CalendlyEventType,
  createCalendlyClient,
} from "../lib/calendlyClient";
import { describeWeeklyHours, toServiceDraft, toWeeklyHours, uniqueSlug } from "../lib/mapCalendly";
import { CalendlyImportService, type ICalendlyImportRepository } from "../services/CalendlyImportService";

const ME = {
  uri: "https://api.calendly.com/users/U1",
  name: "Jamie",
  email: "jamie@example.com",
  timezone: "America/New_York",
};

const EVENT_TYPES: CalendlyEventType[] = [
  {
    uri: "et/1",
    name: "Intro Call",
    slug: "intro-call",
    duration: 15,
    active: true,
    description_plain: " Say hi ",
  },
  { uri: "et/2", name: "Deep Dive", slug: "30min", duration: 60, active: false },
  { uri: "et/3", name: "VIP", slug: "vip", duration: 45, active: true, secret: true },
];

const SCHEDULES: CalendlyAvailabilitySchedule[] = [
  {
    uri: "sch/1",
    name: "Working hours",
    default: true,
    timezone: "America/New_York",
    rules: [
      {
        type: "wday",
        wday: "monday",
        intervals: [
          { from: "09:00", to: "12:00" },
          { from: "13:00", to: "17:30" },
        ],
      },
      { type: "wday", wday: "friday", intervals: [{ from: "10:00", to: "24:00" }] },
      { type: "wday", wday: "sunday", intervals: [] },
      { type: "date", date: "2026-12-25", intervals: [] },
    ],
  },
];

describe("mapping", () => {
  it("turns Calendly event types into services", () => {
    expect(toServiceDraft(EVENT_TYPES[0])).toEqual({
      calendlyUri: "et/1",
      title: "Intro Call",
      slug: "intro-call",
      length: 15,
      description: "Say hi",
      hidden: false,
    });
    expect(toServiceDraft(EVENT_TYPES[1]).hidden).toBe(true);
    expect(toServiceDraft(EVENT_TYPES[2]).hidden).toBe(true);
    expect(toServiceDraft({ uri: "x", name: "Odd", slug: null, duration: 0, active: true }).length).toBe(30);
    expect(toServiceDraft({ uri: "y", name: "Tiny", slug: "tiny", duration: 2, active: true }).length).toBe(
      5
    );
  });

  it("finds a free slug", () => {
    expect(uniqueSlug("30min", new Set(["30min", "30min-2"]))).toBe("30min-3");
    expect(uniqueSlug("new", new Set(["30min"]))).toBe("new");
  });

  it("converts weekly rules, ignoring date overrides and capping 24:00", () => {
    const week = toWeeklyHours(SCHEDULES[0]);
    expect(week[1]).toEqual([
      { start: 540, end: 720 },
      { start: 780, end: 1050 },
    ]);
    expect(week[5]).toEqual([{ start: 600, end: 1439 }]);
    expect(week[0]).toEqual([]);
    expect(describeWeeklyHours(week)).toBe("Mon 09:00-12:00, 13:00-17:30; Fri 10:00-23:59");
  });
});

describe("createCalendlyClient", () => {
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

  it("follows pagination and sends the token", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        json(200, { collection: [EVENT_TYPES[0]], pagination: { next_page: "https://api.calendly.com/p2" } })
      )
      .mockResolvedValueOnce(json(200, { collection: [EVENT_TYPES[1]], pagination: { next_page: null } }));
    const items = await createCalendlyClient("tok", fetchImpl).listEventTypes(ME.uri);
    expect(items.map((i) => i.uri)).toEqual(["et/1", "et/2"]);
    expect(fetchImpl.mock.calls[0][0]).toContain(
      "/event_types?user=https%3A%2F%2Fapi.calendly.com%2Fusers%2FU1"
    );
    expect(fetchImpl.mock.calls[0][1]).toEqual({ headers: { authorization: "Bearer tok" } });
    expect(fetchImpl.mock.calls[1][0]).toBe("https://api.calendly.com/p2");
  });

  it("explains a bad token", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(json(401, {}));
    await expect(createCalendlyClient("bad", fetchImpl).getMe()).rejects.toThrow(/didn't accept that token/);
  });
});

function setup(
  existing: { slugs: string[]; importedUris: string[] } = { slugs: ["30min"], importedUris: [] }
) {
  let nextId = 100;
  const state = {
    ...existing,
    schedules: new Map<string, number>(),
    defaultScheduleId: null as number | null,
  };
  const repository: ICalendlyImportRepository = {
    findExistingServices: async () => ({ slugs: [...state.slugs], importedUris: [...state.importedUris] }),
    createService: vi.fn(async (_userId, draft) => {
      state.slugs.push(draft.slug);
      state.importedUris.push(draft.calendlyUri);
      return { id: nextId++ };
    }),
    findScheduleIdByName: async (_userId, name) => state.schedules.get(name) ?? null,
    createSchedule: vi.fn(async ({ name }) => {
      const id = nextId++;
      state.schedules.set(name, id);
      return id;
    }),
    setDefaultSchedule: vi.fn(async (_userId, id, onlyIfUnset) => {
      if (!onlyIfUnset || state.defaultScheduleId === null) state.defaultScheduleId = id;
    }),
  };
  const client = {
    getMe: vi.fn().mockResolvedValue(ME),
    listEventTypes: vi.fn().mockResolvedValue(EVENT_TYPES),
    listAvailabilitySchedules: vi.fn().mockResolvedValue(SCHEDULES),
  };
  const service = new CalendlyImportService({ repository, clientFor: () => client });
  return { service, repository, state };
}

describe("CalendlyImportService", () => {
  it("previews services and schedules", async () => {
    const { service } = setup({ slugs: [], importedUris: ["et/3"] });
    const preview = await service.preview(4, "tok");
    expect(preview.account).toEqual({
      name: "Jamie",
      email: "jamie@example.com",
      timeZone: "America/New_York",
    });
    expect(preview.services.map((s) => [s.title, s.length, s.hidden, s.alreadyImported])).toEqual([
      ["Intro Call", 15, false, false],
      ["Deep Dive", 60, true, false],
      ["VIP", 45, true, true],
    ]);
    expect(preview.schedules[0]).toMatchObject({
      name: "Working hours",
      isDefault: true,
      summary: expect.stringContaining("Mon"),
    });
  });

  it("imports only what was picked, avoids slug clashes, and is safe to re-run", async () => {
    const { service, state } = setup();
    const request = { serviceUris: ["et/1", "et/2"], scheduleUri: "sch/1", makeScheduleDefault: false };
    const first = await service.run(4, "tok", request);
    expect(first.created.map((c) => c.slug)).toEqual(["intro-call", "30min-2"]);
    expect(first.scheduleId).not.toBeNull();
    expect(state.defaultScheduleId).toBe(first.scheduleId);

    const second = await service.run(4, "tok", request);
    expect(second.created).toEqual([]);
    expect(second.skipped.map((s) => s.title)).toEqual(["Intro Call", "Deep Dive"]);
    expect(second.scheduleId).toBe(first.scheduleId);
  });

  it("doesn't replace an existing default schedule unless asked", async () => {
    const { service, state } = setup();
    state.defaultScheduleId = 1;
    await service.run(4, "tok", { serviceUris: [], scheduleUri: "sch/1", makeScheduleDefault: false });
    expect(state.defaultScheduleId).toBe(1);
    const result = await service.run(4, "tok", {
      serviceUris: [],
      scheduleUri: "sch/1",
      makeScheduleDefault: true,
    });
    expect(state.defaultScheduleId).toBe(result.scheduleId);
  });

  it("rejects an unknown schedule", async () => {
    const { service } = setup();
    await expect(
      service.run(4, "tok", { serviceUris: [], scheduleUri: "sch/nope", makeScheduleDefault: false })
    ).rejects.toThrow(/wasn't found/);
  });
});
