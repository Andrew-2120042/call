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
  fog: { id: "fog", label: "Fog", bg: "#f2f1f8", fg: "#1b1a3a", soft: "#6b6890" },
  coral: { id: "coral", label: "Coral", bg: "#ffe1d6", fg: "#3a1408", soft: "#8a4a36" },
  sky: { id: "sky", label: "Sky", bg: "#d6ebff", fg: "#0e2a4a", soft: "#4a6a8c" },
  butter: { id: "butter", label: "Butter", bg: "#ffe9a8", fg: "#3a2e00", soft: "#7a6420" },
  pine: { id: "pine", label: "Pine", bg: "#0f3d35", fg: "#f1fff9", soft: "#9cc9bc" },
  ink: { id: "ink", label: "Ink", bg: "#1b1a3a", fg: "#ffffff", soft: "#b7b4d9" },
};

export const BUTTON_RADII: Record<ButtonShape, string> = { pill: "999px", rounded: "18px", square: "6px" };

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
