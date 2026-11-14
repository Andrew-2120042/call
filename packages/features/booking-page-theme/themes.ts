// Booking page looks the owner can pick (free). Kept framework-free so pages, emails and the
// settings preview share one source of truth.

import type { CalendarStyle } from "./calendar";
import { parseCalendarOverrides, parseCalendarStyle } from "./calendar";

export type PageThemeId = "fog" | "coral" | "sky" | "butter" | "pine" | "ink";
export type ButtonShape = "pill" | "rounded" | "square";

export type PageTheme = {
  id: PageThemeId;
  label: string;
  /** Page background */
  bg: string;
  /** Main text on the background */
  fg: string;
  /** Secondary text on the background */
  soft: string;
};

export const DEFAULT_PAGE_THEME: PageThemeId = "fog";
export const DEFAULT_BUTTON_SHAPE: ButtonShape = "rounded";

export const PAGE_THEMES: Record<PageThemeId, PageTheme> = {
  fog: { id: "fog", label: "Paper", bg: "#f4f3f0", fg: "#121212", soft: "#6b6a66" },
  coral: { id: "coral", label: "Blush", bg: "#f6e7e1", fg: "#2a1711", soft: "#7d6259" },
  sky: { id: "sky", label: "Sky", bg: "#e4edf5", fg: "#10202e", soft: "#566878" },
  butter: { id: "butter", label: "Butter", bg: "#f5edd2", fg: "#2a2410", soft: "#756b47" },
  pine: { id: "pine", label: "Sage", bg: "#e3ebe2", fg: "#16241a", soft: "#5c6b5f" },
  ink: { id: "ink", label: "Ink", bg: "#121212", fg: "#ffffff", soft: "#a3a3a3" },
};

export const BUTTON_RADII: Record<ButtonShape, string> = { pill: "999px", rounded: "16px", square: "6px" };

export const PAGE_THEME_IDS = Object.keys(PAGE_THEMES) as PageThemeId[];
export const BUTTON_SHAPES = Object.keys(BUTTON_RADII) as ButtonShape[];

export function resolvePageTheme(id: string | null | undefined): PageTheme {
  return PAGE_THEMES[(id ?? DEFAULT_PAGE_THEME) as PageThemeId] ?? PAGE_THEMES[DEFAULT_PAGE_THEME];
}

export function resolveButtonShape(shape: string | null | undefined): ButtonShape {
  return BUTTON_SHAPES.includes(shape as ButtonShape) ? (shape as ButtonShape) : DEFAULT_BUTTON_SHAPE;
}

/** CSS custom properties consumed by the booking page styles (sw-* classes). */
export function pageThemeStyle(themeId: string | null | undefined, shape: string | null | undefined) {
  const theme = resolvePageTheme(themeId);
  return {
    "--sw-bg": theme.bg,
    "--sw-fg": theme.fg,
    "--sw-soft": theme.soft,
    "--sw-radius": BUTTON_RADII[resolveButtonShape(shape)],
  } as Record<string, string>;
}

// ---------------------------------------------------------------------------------------------------
// Owner customisation on top of a theme (all optional; anything unset follows the theme).

export type PageFont = "albert" | "inter" | "serif" | "mono";
export type ButtonFill = "solid" | "outline" | "soft";

export type PageStyle = {
  wallpaper?: { kind: "solid" | "gradient"; color?: string; color2?: string };
  button?: { fill?: ButtonFill; color?: string; text?: string };
  font?: PageFont;
  textColor?: string;
  titleColor?: string;
  calendar?: CalendarStyle;
  calendarByService?: Record<string, CalendarStyle>;
};

export const PAGE_FONTS: Record<PageFont, { label: string; stack: string }> = {
  albert: { label: "Albert Sans", stack: "var(--font-sans), system-ui, sans-serif" },
  inter: { label: "System", stack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" },
  serif: { label: "Serif", stack: "Georgia, 'Iowan Old Style', 'Times New Roman', serif" },
  mono: { label: "Mono", stack: "ui-monospace, 'SF Mono', Menlo, monospace" },
};
export const PAGE_FONT_IDS = Object.keys(PAGE_FONTS) as PageFont[];
export const BUTTON_FILLS: ButtonFill[] = ["solid", "outline", "soft"];

const HEX = /^#[0-9a-fA-F]{6}$/;
const hex = (value: unknown) => (typeof value === "string" && HEX.test(value) ? value : undefined);

/** Accepts whatever is stored and returns only valid fields, so a bad value never breaks a public page. */
export function parsePageStyle(input: unknown): PageStyle {
  if (!input || typeof input !== "object") return {};
  const raw = input as Record<string, unknown>;
  const style: PageStyle = {};
  const wallpaper = raw.wallpaper as Record<string, unknown> | undefined;
  if (wallpaper && (wallpaper.kind === "solid" || wallpaper.kind === "gradient")) {
    style.wallpaper = { kind: wallpaper.kind, color: hex(wallpaper.color), color2: hex(wallpaper.color2) };
  }
  const button = raw.button as Record<string, unknown> | undefined;
  if (button) {
    style.button = {
      fill: BUTTON_FILLS.includes(button.fill as ButtonFill) ? (button.fill as ButtonFill) : undefined,
      color: hex(button.color),
      text: hex(button.text),
    };
  }
  if (PAGE_FONT_IDS.includes(raw.font as PageFont)) style.font = raw.font as PageFont;
  style.textColor = hex(raw.textColor);
  style.titleColor = hex(raw.titleColor);
  const calendar = parseCalendarStyle(raw.calendar);
  if (calendar) style.calendar = calendar;
  const calendarByService = parseCalendarOverrides(raw.calendarByService);
  if (calendarByService) style.calendarByService = calendarByService;
  return style;
}

/** Final colours/fonts for a page: theme first, then the owner's overrides. */
export function resolvePageLook(
  themeId: string | null | undefined,
  shape: string | null | undefined,
  styleInput?: unknown
) {
  const theme = resolvePageTheme(themeId);
  const style = parsePageStyle(styleInput);
  const base = style.wallpaper?.color ?? theme.bg;
  const background =
    style.wallpaper?.kind === "gradient"
      ? `linear-gradient(180deg, ${base} 0%, ${style.wallpaper.color2 ?? theme.bg} 100%)`
      : base;
  const fg = style.textColor ?? theme.fg;
  const fill = style.button?.fill ?? "solid";
  const buttonColor = style.button?.color ?? "#ffffff";
  const buttonText = style.button?.text ?? "#121212";
  return {
    theme,
    style,
    background,
    screenBg: base,
    fg,
    soft: style.textColor ? `${style.textColor}b3` : theme.soft,
    title: style.titleColor ?? fg,
    font: PAGE_FONTS[style.font ?? "albert"].stack,
    radius: BUTTON_RADII[resolveButtonShape(shape)],
    buttonBg: fill === "solid" ? buttonColor : fill === "soft" ? `${buttonColor}cc` : "transparent",
    buttonFg: fill === "outline" ? (style.button?.color ? buttonColor : fg) : buttonText,
    buttonBorder: fill === "outline" ? (style.button?.color ?? fg) : "transparent",
  };
}

/** CSS variables for a page including the owner's overrides. */
export function pageLookStyle(
  themeId: string | null | undefined,
  shape: string | null | undefined,
  styleInput?: unknown
) {
  const look = resolvePageLook(themeId, shape, styleInput);
  return {
    "--sw-bg": look.background,
    "--sw-fg": look.fg,
    "--sw-soft": look.soft,
    "--sw-title": look.title,
    "--sw-font": look.font,
    "--sw-radius": look.radius,
    "--sw-btn-bg": look.buttonBg,
    "--sw-btn-fg": look.buttonFg,
    "--sw-btn-border": look.buttonBorder,
  } as Record<string, string>;
}
