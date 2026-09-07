"use client";

import type { Member, RevealedResult, RoundPhase } from "@planningpoker/shared";
import { PixelAvatar } from "@/components/avatar/PixelAvatar";

export function MemberList({
  members,
  phase,
  submittedFactorIds,
  submittedPointIds,
  results,
  nudgeMemberIds,
  nudgeTexts,
}: {
  members: Member[];
  phase?: RoundPhase;
  submittedFactorIds?: string[];
  submittedPointIds?: string[];
  results?: RevealedResult[] | null;
  /** Members the host just tried to reveal past — they get punched until they vote. */
  nudgeMemberIds?: string[];
  /** Per-member taunt line, keyed by member id, so everyone gets a different jab. */
  nudgeTexts?: Record<string, string>;
}) {
  const seatCount = Math.max(members.length, 1);

  return (
    <div className="relative mx-auto aspect-3/2 w-full max-w-3xl">
      <div className="pixel-card absolute inset-x-[18%] inset-y-[24%] flex flex-col items-center justify-center gap-1.5 bg-[#B5732A]/25">
        <span className="pixel-heading text-center text-[9px] opacity-50 sm:text-[11px]">ROUND OF THE KNIGHT</span>
        <div className="pixel-card flex h-12 w-9 flex-col items-center justify-center gap-0.5 bg-(--pp-panel)">
          <span className="text-xl leading-none">👑</span>
        </div>
      </div>

      {members.map((m, i) => {
        const angle = (i / seatCount) * 2 * Math.PI - Math.PI / 2;
        const left = 50 + 40 * Math.cos(angle);
        const top = 50 + 36 * Math.sin(angle);

        const factorsDone = submittedFactorIds?.includes(m.id);
        const pointDone = submittedPointIds?.includes(m.id);
        // The round stays in the "factors" phase for everyone until the host reveals —
        // there's no separate server-side "voting" phase, so waiting-for-vote is just
        // "round is open and this member hasn't submitted a point card yet". This is
        // independent per member, so every not-yet-voted member gets the indicator at once.
        const roundOpen = phase === "factors" || phase === "voting";
        const isThinking = roundOpen && !pointDone && m.connected;
        const isNudged = isThinking && Boolean(nudgeMemberIds?.includes(m.id));
        const nudgeText = nudgeTexts?.[m.id] ?? "VOTE ALREADY!";
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
                  className="pixel-card absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full min-w-[1.75rem] whitespace-nowrap bg-(--pp-primary) px-2 py-1 text-center text-lg font-bold leading-none text-white"
                  title="Revealed point"
                >
                  {revealedPoint}
                </span>
              ) : null}
              {isThinking && !isNudged ? (
                <span
                  className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full animate-bounce text-lg leading-none"
                  title="Still deciding"
                  aria-label="Thinking"
                >
                  💭
                </span>
              ) : null}
              {isNudged ? (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center gap-0.5">
                  <span className="pixel-card whitespace-nowrap bg-(--pp-danger) px-2 py-1 text-xs font-bold text-white">
                    {nudgeText}
                  </span>
                  <span className="animate-bounce text-lg leading-none" aria-label="Nudge to vote">
                    <span className="inline-block rotate-[-35deg]">👊</span>
                  </span>
                </div>
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
            <span className="pixel-card max-w-[7rem] truncate bg-(--pp-panel) px-1.5 py-0.5 text-sm font-bold">
              {m.name}
            </span>
            {m.isHost ? (
              <span className="rounded bg-(--pp-warning) px-1.5 py-0.5 text-xs font-bold text-(--pp-ink)">
                HOST
              </span>
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
