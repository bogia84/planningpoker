import { findAvatarPalette } from "@/lib/avatars";

const GRID = [
  "00111100",
  "01333310",
  "13322331",
  "13311331",
  "13111131",
  "01333310",
  "00111100",
  "00011000",
];

export function PixelAvatar({ avatarId, size = 48 }: { avatarId: string; size?: number }) {
  const palette = findAvatarPalette(avatarId);
  const colors: Record<string, string> = {
    "1": palette.base,
    "2": palette.eye,
    "3": palette.accent,
  };

  return (
    <svg
      viewBox="0 0 8 8"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      style={{ background: palette.bg, borderRadius: 6, display: "block" }}
      role="img"
      aria-label={`${palette.label} avatar`}
    >
      {GRID.map((row, y) =>
        row.split("").map((cell, x) =>
          cell === "0" ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={colors[cell]} />
          ),
        ),
      )}
    </svg>
  );
}
