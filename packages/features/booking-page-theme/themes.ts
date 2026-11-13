// Booking page looks the owner can pick (free). Kept framework-free so pages, emails and the
// settings preview share one source of truth.

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
