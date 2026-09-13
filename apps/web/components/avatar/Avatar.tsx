"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { DocsAvatar } from "./DocsAvatar";
import { PixelAvatar } from "./PixelAvatar";

export function Avatar({ avatarId, size }: { avatarId: string; size?: number }) {
  const { theme } = useTheme();
  return theme === "docs" ? (
    <DocsAvatar avatarId={avatarId} size={size} />
  ) : (
    <PixelAvatar avatarId={avatarId} size={size} />
  );
}
