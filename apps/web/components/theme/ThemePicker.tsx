"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import type { Theme } from "@/lib/theme";

const THEME_OPTIONS: Array<{
  id: Theme;
  label: string;
  description: string;
  swatches: string[];
}> = [
  {
    id: "docs",
    label: "Docs",
    description: "Clean & professional",
    swatches: ["#f7f8fa", "#0052cc", "#6554c0"],
  },
  {
    id: "pixel",
    label: "Pixel",
    description: "Retro 8-bit",
    swatches: ["#fbf3e3", "#6c5ce7", "#ff6fa5"],
  },
];

export function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs uppercase tracking-widest opacity-60">Choose a theme</p>
      <div className="flex gap-3">
        {THEME_OPTIONS.map((option) => {
          const selected = theme === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              aria-pressed={selected}
              className="pixel-card flex flex-col items-center gap-2 px-4 py-3 transition-transform"
              style={{
                borderColor: selected ? "var(--pp-primary)" : undefined,
                outline: selected ? "2px solid var(--pp-primary)" : undefined,
                outlineOffset: selected ? "1px" : undefined,
              }}
            >
              <div className="flex gap-1">
                {option.swatches.map((color, i) => (
                  <span
                    key={i}
                    className="h-4 w-4 rounded-full"
                    style={{ background: color }}
                  />
                ))}
              </div>
              <span className="pixel-heading text-xs">{option.label}</span>
              <span className="text-xs opacity-60">{option.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
