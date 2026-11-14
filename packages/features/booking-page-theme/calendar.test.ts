import { describe, expect, it } from "vitest";
import {
  calendarBackgroundCss,
  calendarCssVars,
  DEFAULT_CALENDAR,
  parseCalendarOverrides,
  parseCalendarStyle,
  resolveCalendar,
} from "./calendar";
import { parsePageStyle } from "./themes";

describe("parseCalendarStyle", () => {
  it("returns undefined for empty or non-object input", () => {
    expect(parseCalendarStyle(null)).toBeUndefined();
    expect(parseCalendarStyle("dark")).toBeUndefined();
    expect(parseCalendarStyle({})).toBeUndefined();
  });

  it("keeps valid fields and drops invalid ones", () => {
    expect(
      parseCalendarStyle({
        layout: "week_view",
        mode: "neon",
        accent: "#3d5a40",
        panelColor: "red",
        slotShape: "pill",
        timeFormat: "24h",
        hide: ["description", "nonsense", "timezone"],
      })
    ).toEqual({
      layout: "week_view",
      accent: "#3d5a40",
      slotShape: "pill",
      timeFormat: "24h",
      hide: ["description", "timezone"],
    });
  });
});

describe("parseCalendarOverrides", () => {
  it("keeps only numeric service ids with valid settings", () => {
    expect(
      parseCalendarOverrides({ "12": { mode: "dark" }, abc: { mode: "dark" }, "13": { mode: "bad" } })
    ).toEqual({ "12": { mode: "dark" } });
  });
});

describe("resolveCalendar", () => {
  it("falls back to defaults", () => {
    expect(resolveCalendar(undefined, undefined)).toEqual(DEFAULT_CALENDAR);
  });

  it("lets a service override win over the page-wide settings", () => {
    const resolved = resolveCalendar({ mode: "dark", timeFormat: "24h" }, { mode: "light" });
    expect(resolved.mode).toBe("light");
    expect(resolved.timeFormat).toBe("24h");
  });

  it("flips unpicked colours with the mode so dark mode never gets a black highlight", () => {
    const dark = resolveCalendar({ mode: "dark" }, undefined);
    expect(dark.panelColor).toBe("#161616");
    expect(dark.accent).toBe("#f4f4f2");
    expect(resolveCalendar({ mode: "dark", accent: "#3d5a40" }, undefined).accent).toBe("#3d5a40");
  });

  it("exposes the slot shape as a CSS radius", () => {
    expect(calendarCssVars(resolveCalendar({ slotShape: "pill" }, undefined))["--sw-slot-radius"]).toBe(
      "999px"
    );
  });
});

describe("parsePageStyle", () => {
  it("carries calendar settings through", () => {
    expect(
      parsePageStyle({
        calendar: { layout: "column_view" },
        calendarByService: { "5": { hide: ["avatar"] } },
      })
    ).toMatchObject({
      calendar: { layout: "column_view" },
      calendarByService: { "5": { hide: ["avatar"] } },
    });
  });
});

describe("calendar background and colours", () => {
  it("keeps the page wallpaper unless the owner picks a background", () => {
    expect(calendarBackgroundCss(undefined)).toBeUndefined();
    expect(calendarBackgroundCss({ kind: "page", color: "#000000" })).toBeUndefined();
    expect(calendarCssVars(resolveCalendar(undefined, undefined))["--sw-cal-page-bg"]).toBeUndefined();
  });

  it("builds solid and gradient backgrounds", () => {
    expect(calendarBackgroundCss({ kind: "solid", color: "#2f3b52" })).toBe("#2f3b52");
    expect(calendarBackgroundCss({ kind: "gradient", color: "#2f3b52", color2: "#7a3b2e" })).toBe(
      "linear-gradient(180deg, #2f3b52 0%, #7a3b2e 100%)"
    );
  });

  it("drops an invalid background and applies day and slot colours", () => {
    expect(parseCalendarStyle({ background: { kind: "video" } })).toBeUndefined();
    const vars = calendarCssVars(resolveCalendar({ dayColor: "#f5edd2", slotColor: "#3d5a40" }, undefined));
    expect(vars["--sw-cal-emphasis"]).toBe("#f5edd2");
    expect(vars["--sw-cal-slot-bg"]).toBe("#3d5a40");
  });
});
