export type Theme = "pixel" | "docs";

export const THEMES: Theme[] = ["docs", "pixel"];

export const DEFAULT_THEME: Theme = "docs";

export const THEME_STORAGE_KEY = "pp-theme";

export function isTheme(value: unknown): value is Theme {
  return value === "pixel" || value === "docs";
}
