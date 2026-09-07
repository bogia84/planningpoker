"use client";

import type { Member, RevealedResult, RoundPhase } from "@planningpoker/shared";
import { PixelAvatar } from "@/components/avatar/PixelAvatar";

export function MemberList({
  members,
  phase,
  submittedFactorIds,
  submittedPointIds,
  results,
}: {
  members: Member[];
  phase?: RoundPhase;
  submittedFactorIds?: string[];
  submittedPointIds?: string[];
  results?: RevealedResult[] | null;
}) {
  const seatCount = Math.max(members.length, 1);

  return (
    <div className="relative mx-auto aspect-4/3 w-full max-w-xl">
      <div className="pixel-card absolute inset-x-[22%] inset-y-[30%] flex items-center justify-center bg-[#B5732A]/25">
        <span className="pixel-heading text-[10px] opacity-40 sm:text-xs">TABLE</span>
      </div>

      {members.map((m, i) => {
        const angle = (i / seatCount) * 2 * Math.PI - Math.PI / 2;
        const left = 50 + 42 * Math.cos(angle);
        const top = 50 + 40 * Math.sin(angle);

        const factorsDone = submittedFactorIds?.includes(m.id);
        const pointDone = submittedPointIds?.includes(m.id);
        // The round stays in the "factors" phase for everyone until the host reveals —
        // there's no separate server-side "voting" phase, so waiting-for-vote is just
        // "round is open and this member hasn't submitted a point card yet". This is
        // independent per member, so every not-yet-voted member gets the indicator at once.
        const roundOpen = phase === "factors" || phase === "voting";
        const isThinking = roundOpen && !pointDone && m.connected;
        const revealedPoint =
          phase === "revealed" ? results?.find((r) => r.memberId === m.id)?.point : undefined;

        return (
          <div
            key={m.id}
            className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 ${
              m.connected ? "" : "opacity-40"
            }`}
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <div className="relative">
              {revealedPoint !== undefined ? (
                <span
                  className="pixel-card absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-(--pp-primary) px-2 py-0.5 text-xs font-bold text-white"
                  title="Revealed point"
                >
                  {revealedPoint}
                </span>
              ) : null}
              {isThinking ? (
                <>
                  <span
                    className="absolute -top-4 left-0 -translate-x-1/3 -translate-y-full animate-bounce text-lg leading-none"
                    title="Still deciding"
                    aria-label="Thinking"
                  >
                    💭
                  </span>
                  <span
                    className="absolute -top-3 right-0 translate-x-1/3 -translate-y-full animate-bounce text-lg leading-none [animation-delay:150ms]"
                    title="Come on, vote already!"
                    aria-label="Nudge to vote"
                  >
                    <span className="inline-block rotate-[-35deg]">👊</span>
                  </span>
                </>
              ) : null}
              {roundOpen && pointDone ? (
                <span
                  className="absolute -top-1 -right-1 rounded-full bg-(--pp-success) px-1 text-[10px] leading-tight text-white"
                  title="Voted"
                >
                  ✓
                </span>
              ) : null}
              <PixelAvatar avatarId={m.avatarId} size={36} />
            </div>
            <span className="pixel-card max-w-[5.5rem] truncate bg-(--pp-panel) px-1 py-0.5 text-[10px]">
              {m.name}
            </span>
            {m.isHost ? (
              <span className="rounded bg-(--pp-warning) px-1 text-[9px] font-bold text-(--pp-ink)">HOST</span>
            ) : null}
            {phase === "factors" && !factorsDone && m.connected ? (
              <span className="text-[9px] opacity-50">scoring…</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
