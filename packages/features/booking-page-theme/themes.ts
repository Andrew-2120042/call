// Booking page looks the owner can pick (free). Kept framework-free so pages, emails and the
// settings preview share one source of truth.

export type PageThemeId = "paper" | "lilac" | "mint" | "sun" | "plum" | "blue";
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

export const PAGE_THEMES: Record<PageThemeId, PageTheme> = {
  paper: { id: "paper", label: "Paper", bg: "#f4f2ee", fg: "#121212", soft: "#6f6a64" },
  lilac: { id: "lilac", label: "Lilac", bg: "#e9d7ff", fg: "#2a0f6b", soft: "#5a3f99" },
  mint: { id: "mint", label: "Mint", bg: "#bdf2d5", fg: "#0f4d3a", soft: "#2f6b55" },
  sun: { id: "sun", label: "Sun", bg: "#ffd43b", fg: "#121212", soft: "#5c4a00" },
  plum: { id: "plum", label: "Plum", bg: "#5b0e2d", fg: "#ffffff", soft: "#f2c9d8" },
  blue: { id: "blue", label: "Blue", bg: "#3b30d9", fg: "#ffffff", soft: "#d7d4ff" },
};

export const BUTTON_RADII: Record<ButtonShape, string> = { pill: "999px", rounded: "16px", square: "6px" };

export const PAGE_THEME_IDS = Object.keys(PAGE_THEMES) as PageThemeId[];
export const BUTTON_SHAPES = Object.keys(BUTTON_RADII) as ButtonShape[];

export function resolvePageTheme(id: string | null | undefined): PageTheme {
  return PAGE_THEMES[(id ?? "paper") as PageThemeId] ?? PAGE_THEMES.paper;
}

export function resolveButtonShape(shape: string | null | undefined): ButtonShape {
  return BUTTON_SHAPES.includes(shape as ButtonShape) ? (shape as ButtonShape) : "pill";
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
