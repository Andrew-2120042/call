// Owner customisation for the calendar (date & time picker) page. Stored inside the user's pageStyle JSON:
// `calendar` is the page-wide default and `calendarByService[eventTypeId]` holds per-service overrides.

export type CalendarLayout = "month_view" | "week_view" | "column_view";
export type CalendarMode = "light" | "dark";
export type SlotShape = "pill" | "rounded" | "square";
export type CalendarTimeFormat = "auto" | "12h" | "24h";
export type CalendarVisibilityKey = "avatar" | "description" | "duration" | "location" | "timezone";

export type CalendarStyle = {
  layout?: CalendarLayout;
  allowLayoutSwitch?: boolean;
  mode?: CalendarMode;
  panelColor?: string;
  accent?: string;
  accentText?: string;
  slotShape?: SlotShape;
  timeFormat?: CalendarTimeFormat;
  /** Keys listed here are hidden on the calendar page. */
  hide?: CalendarVisibilityKey[];
};

export type ResolvedCalendar = Required<Omit<CalendarStyle, "panelColor">> & { panelColor: string };

export const CALENDAR_LAYOUTS: CalendarLayout[] = ["month_view", "week_view", "column_view"];
export const CALENDAR_MODES: CalendarMode[] = ["light", "dark"];
export const SLOT_SHAPES: SlotShape[] = ["pill", "rounded", "square"];
export const CALENDAR_TIME_FORMATS: CalendarTimeFormat[] = ["auto", "12h", "24h"];
export const CALENDAR_VISIBILITY_KEYS: CalendarVisibilityKey[] = [
  "avatar",
  "description",
  "duration",
  "location",
  "timezone",
];
export const SLOT_RADII: Record<SlotShape, string> = { pill: "999px", rounded: "12px", square: "4px" };

const MODE_DEFAULTS: Record<CalendarMode, { panelColor: string; accent: string; accentText: string }> = {
  light: { panelColor: "#ffffff", accent: "#121212", accentText: "#ffffff" },
  dark: { panelColor: "#161616", accent: "#f4f4f2", accentText: "#121212" },
};

export const DEFAULT_CALENDAR: ResolvedCalendar = {
  layout: "month_view",
  allowLayoutSwitch: true,
  mode: "light",
  ...MODE_DEFAULTS.light,
  slotShape: "rounded",
  timeFormat: "auto",
  hide: [],
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const hex = (value: unknown) => (typeof value === "string" && HEX.test(value) ? value : undefined);
const oneOf = <T extends string>(list: readonly T[], value: unknown) =>
  list.includes(value as T) ? (value as T) : undefined;

/** Keeps only valid fields so a bad stored value never breaks a public page. */
export function parseCalendarStyle(input: unknown): CalendarStyle | undefined {
  if (!input || typeof input !== "object") return undefined;
  const raw = input as Record<string, unknown>;
  const style: CalendarStyle = {
    layout: oneOf(CALENDAR_LAYOUTS, raw.layout),
    allowLayoutSwitch: typeof raw.allowLayoutSwitch === "boolean" ? raw.allowLayoutSwitch : undefined,
    mode: oneOf(CALENDAR_MODES, raw.mode),
    panelColor: hex(raw.panelColor),
    accent: hex(raw.accent),
    accentText: hex(raw.accentText),
    slotShape: oneOf(SLOT_SHAPES, raw.slotShape),
    timeFormat: oneOf(CALENDAR_TIME_FORMATS, raw.timeFormat),
    hide: Array.isArray(raw.hide)
      ? raw.hide.filter((key): key is CalendarVisibilityKey => CALENDAR_VISIBILITY_KEYS.includes(key))
      : undefined,
  };
  for (const key of Object.keys(style) as (keyof CalendarStyle)[]) {
    if (style[key] === undefined) delete style[key];
  }
  return Object.keys(style).length ? style : undefined;
}

export function parseCalendarOverrides(input: unknown): Record<string, CalendarStyle> | undefined {
  if (!input || typeof input !== "object") return undefined;
  const overrides: Record<string, CalendarStyle> = {};
  for (const [id, value] of Object.entries(input as Record<string, unknown>)) {
    if (!/^\d+$/.test(id)) continue;
    const parsed = parseCalendarStyle(value);
    if (parsed) overrides[id] = parsed;
  }
  return Object.keys(overrides).length ? overrides : undefined;
}

/** Defaults, then the page-wide calendar style, then the service's own override. */
export function resolveCalendar(
  pageWide: CalendarStyle | undefined,
  override: CalendarStyle | undefined
): ResolvedCalendar {
  const merged = { ...pageWide, ...override };
  const mode = merged.mode ?? DEFAULT_CALENDAR.mode;
  return {
    ...DEFAULT_CALENDAR,
    ...merged,
    mode,
    // Colours the owner hasn't picked follow the mode, so switching to dark never leaves black-on-black.
    panelColor: merged.panelColor ?? MODE_DEFAULTS[mode].panelColor,
    accent: merged.accent ?? MODE_DEFAULTS[mode].accent,
    accentText: merged.accentText ?? MODE_DEFAULTS[mode].accentText,
    hide: merged.hide ?? DEFAULT_CALENDAR.hide,
  };
}

/** CSS variables read by `.sw-booker` in booking-theme.css. */
export function calendarCssVars(calendar: ResolvedCalendar): Record<string, string> {
  const dark = calendar.mode === "dark";
  return {
    "--sw-cal-panel": calendar.panelColor,
    "--sw-cal-text": dark ? "#f4f4f2" : "#121212",
    "--sw-cal-text-soft": dark ? "#d6d5d1" : "#2b2b29",
    "--sw-cal-subtle": dark ? "#a3a29d" : "#6b6a66",
    "--sw-cal-muted": dark ? "#262626" : "#f1f0ee",
    "--sw-cal-emphasis": dark ? "#333333" : "#e6e5e2",
    "--sw-cal-border": dark ? "#2e2e2e" : "#ebeae7",
    "--sw-cal-slot-border": dark ? "#3a3a3a" : "#dddcd8",
    "--sw-cal-accent": calendar.accent,
    "--sw-cal-accent-text": calendar.accentText,
    "--sw-slot-radius": SLOT_RADII[calendar.slotShape],
  };
}
