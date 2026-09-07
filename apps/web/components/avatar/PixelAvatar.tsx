import { findAvatarCharacter } from "@/lib/avatars";

export function PixelAvatar({ avatarId, size = 48 }: { avatarId: string; size?: number }) {
  const character = findAvatarCharacter(avatarId);

  return (
    <svg
      viewBox="0 0 8 8"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      style={{ background: character.bg, borderRadius: 6, display: "block" }}
      role="img"
      aria-label={`${character.label} avatar`}
    >
      {character.grid.map((row, y) =>
        row.split("").map((cell, x) =>
          cell === "0" ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={character.colors[cell]} />
          ),
        ),
      )}
    </svg>
  );
}
