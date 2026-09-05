"use client";

import { AVATAR_PALETTES } from "@/lib/avatars";
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
      {AVATAR_PALETTES.map((palette) => (
        <button
          key={palette.id}
          type="button"
          onClick={() => onChange(palette.id)}
          title={palette.label}
          className={`rounded-md border-4 p-1 transition ${
            value === palette.id
              ? "border-(--pp-ink) scale-105"
              : "border-transparent hover:border-(--pp-ink)/30"
          }`}
        >
          <PixelAvatar avatarId={palette.id} size={40} />
        </button>
      ))}
    </div>
  );
}
