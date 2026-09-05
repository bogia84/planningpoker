"use client";

import type { Member } from "@planningpoker/shared";
import { PixelAvatar } from "@/components/avatar/PixelAvatar";

export function MemberList({
  members,
  submittedFactorIds,
  submittedPointIds,
}: {
  members: Member[];
  submittedFactorIds?: string[];
  submittedPointIds?: string[];
}) {
  const showProgress = Boolean(submittedFactorIds || submittedPointIds);

  return (
    <ul className="flex flex-wrap gap-3">
      {members.map((m) => {
        const factorsDone = submittedFactorIds?.includes(m.id);
        const pointDone = submittedPointIds?.includes(m.id);
        return (
          <li
            key={m.id}
            className={`pixel-card flex items-center gap-2 px-2 py-1 text-sm ${m.connected ? "" : "opacity-40"}`}
          >
            <PixelAvatar avatarId={m.avatarId} size={28} />
            <span>{m.name}</span>
            {m.isHost ? (
              <span className="rounded bg-(--pp-warning) px-1 text-[10px] font-bold text-(--pp-ink)">HOST</span>
            ) : null}
            {showProgress ? (
              <span className="flex gap-1">
                <span
                  className={`h-2 w-2 rounded-full ${factorsDone ? "bg-(--pp-success)" : "bg-black/20"}`}
                  title="Factor scores submitted"
                />
                <span
                  className={`h-2 w-2 rounded-full ${pointDone ? "bg-(--pp-primary)" : "bg-black/20"}`}
                  title="Point submitted"
                />
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
