"use client";

import { AVATAR_CHARACTERS } from "@/lib/avatars";
import { PixelAvatar } from "./PixelAvatar";

export function AvatarPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (avatarId: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {AVATAR_CHARACTERS.map((character) => (
        <button
          key={character.id}
          type="button"
          onClick={() => onChange(character.id)}
          title={character.label}
          className={`rounded-md border-4 p-1 transition ${
            value === character.id
              ? "border-(--pp-ink) scale-105"
              : "border-transparent hover:border-(--pp-ink)/30"
          }`}
        >
          <PixelAvatar avatarId={character.id} size={40} />
        </button>
      ))}
    </div>
  );
}
