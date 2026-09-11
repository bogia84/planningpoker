"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME, isTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initial state must match SSR output (always DEFAULT_THEME, since the
  // server has no access to localStorage) to avoid a hydration mismatch.
  // The blocking script in <head> already applies the correct theme to the
  // DOM before first paint; this effect just syncs React state to match it
  // once mounted, which may briefly re-render theme-dependent UI (like the
  // ThemePicker's selection ring) but never the page's actual visual skin.
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      // localStorage unavailable (private mode, disabled storage, etc.)
    }
    const resolved = isTheme(stored) ? stored : DEFAULT_THEME;
    if (resolved !== theme) setThemeState(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function setTheme(next: Theme) {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore write failures
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
