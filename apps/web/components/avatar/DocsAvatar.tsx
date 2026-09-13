import { findAvatarCharacter } from "@/lib/avatars";

function initials(label: string): string {
  const words = label.trim().split(/\s+/);
  const letters = words.length > 1 ? [words[0][0], words[words.length - 1][0]] : [words[0][0]];
  return letters.join("").toUpperCase();
}

export function DocsAvatar({ avatarId, size = 48 }: { avatarId: string; size?: number }) {
  const character = findAvatarCharacter(avatarId);

  return (
    <div
      role="img"
      aria-label={`${character.label} avatar`}
      className="flex shrink-0 select-none items-center justify-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        background: character.bg,
        color: "var(--pp-ink)",
        fontSize: size * 0.4,
      }}
    >
      {initials(character.label)}
    </div>
  );
}
