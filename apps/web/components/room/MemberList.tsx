"use client";

import { Fragment, useMemo } from "react";
import type { Member, RevealedResult, RoundPhase } from "@planningpoker/shared";
import { Avatar } from "@/components/avatar/Avatar";
import { HostChipBadge } from "@/components/room/HostChipBadge";
import { SeatCard, SeatCardSlot } from "@/components/room/SeatCard";

const TABLE_QUOTES = [
  "ROUND OF THE KNIGHTS",
  "IN AGILE WE TRUST",
  "8 POINTS? BOLD.",
  "NO ESTIMATES WERE HARMED",
  "THE FIBONACCI GUY STRIKES AGAIN",
  "IT DEPENDS™",
  "STANDUP SOON, HOLD THE LINE",
  "SPRINT NOW, REGRET LATER",
  "SIZE IT, DON'T FIGHT IT",
  "WHOEVER PICKS 1 BUYS COFFEE",
  "SCOPE CREEP IS WATCHING",
  "THIS TICKET HAS TRUST ISSUES",
  "MAY YOUR VELOCITY BE EVER STABLE",
];

function pickTableQuote(): string {
  return TABLE_QUOTES[Math.floor(Math.random() * TABLE_QUOTES.length)] ?? TABLE_QUOTES[0];
}

/**
 * The board's inner ring of card slots sits inside the seat ellipse (radius 40/36),
 * so a card's position never depends on any one seat's avatar/label/button geometry
 * — only on how many seats share the ring. Both the radius and the card size shrink
 * as seatCount grows.
 *
 * Both the ring's px size (via these %-of-board radii) and the card's px size (via
 * `--pp-card-w: 3.75cqw * scale` in globals.css) scale with the container's actual
 * width, so the two failure modes below scale together with the container — making
 * seatCount=11 at the narrowest supported width (320px) the single worst case for
 * both. Solved directly for that case (W=320px, H=320*2/3=213.3px):
 *
 * ANGULAR (card vs. adjacent card): at seatCount=11 the ring (rx=18%, ry=13%) sits
 * at px semi-axes a=57.6, b=27.7. The tightest gap between adjacent card centers on
 * that ellipse (near its "flattest" points, not the major/minor axis tips) works out
 * to ~16.1px by direct point-to-point distance. A card at scale=0.75 is
 * 3.75% * 320px * 0.75 = 9px wide; 9px + a 3px minimum gap = 12px, leaving ~4px of
 * margin at the worst-case pair.
 *
 * RADIAL (card vs. its own seat's avatar): seatRy (36%) is 76.8px; cardRy (13%) is
 * 27.7px, a 49px gap. The avatar is a fixed 36px (18px half) and the card's half
 * height is 0.7 * 9px = 6.3px, so only 18 + 6.3 + 3px gap = ~27.3px is needed —
 * radial clearance is never the binding constraint in the 8-11 member range, so it
 * doesn't need its own floor.
 *
 * Fewer members (8-10) get a wider angle step and a bigger scale, but the ring radii
 * only shrink a little more for them — both margins grow, as confirmed by re-running
 * the same two checks at seatCount 8/9/10: the angular margin only gets bigger
 * (~9px, ~9px, ~6px of slack respectively) as seatCount drops from 11. Wider
 * containers (390/768/1280px) are strictly easier still: both the ring and the card
 * scale with the container's width, while the few-px minimum gap and the avatar's
 * fixed 36px stay constant, so they matter relatively less as the container grows.
 */
function innerRingRadius(seatCount: number) {
  const extra = Math.max(0, seatCount - 6);
  return {
    rx: Math.max(18, 24 - extra * 1.2),
    ry: Math.max(13, 17 - extra * 0.8),
  };
}

function cardScaleFor(seatCount: number) {
  const extra = Math.max(0, seatCount - 6);
  return Math.max(0.75, 1 - extra * 0.05);
}

export function MemberList({
  members,
  phase,
  roundNumber,
  submittedFactorIds,
  submittedPointIds,
  results,
  nudgeMemberIds,
  nudgeTexts,
  selfMemberId,
  viewerIsHost,
  onTransferHost,
  onRemoveMember,
}: {
  members: Member[];
  phase?: RoundPhase;
  /** Keys the cards so nothing carries over into a new round. */
  roundNumber?: number;
  submittedFactorIds?: string[];
  submittedPointIds?: string[];
  results?: RevealedResult[] | null;
  /** Members the host just tried to reveal past — they get punched until they vote. */
  nudgeMemberIds?: string[];
  /** Per-member taunt line, keyed by member id, so everyone gets a different jab. */
  nudgeTexts?: Record<string, string>;
  /** The viewer's own member id, used to hide host controls on their own seat. */
  selfMemberId?: string;
  /** Whether the viewer is the host — gates the transfer-host/remove-member controls. */
  viewerIsHost?: boolean;
  onTransferHost?: (memberId: string) => void;
  onRemoveMember?: (memberId: string) => void;
}) {
  const seatCount = Math.max(members.length, 1);
  const tableQuote = useMemo(() => pickTableQuote(), []);
  const { rx: cardRx, ry: cardRy } = innerRingRadius(seatCount);
  const cardScale = cardScaleFor(seatCount);

  return (
    <div className="pp-seat-root relative mx-auto aspect-3/2 w-full max-w-3xl">
      <div className="pixel-card pp-board-outer absolute inset-x-[16%] inset-y-[24.5%] select-none overflow-hidden p-[1.5%]">
        <div className="pp-board-frame h-full w-full rounded border-4 border-(--pp-ink) p-[5%]">
          <div className="pp-board-surface flex h-full w-full flex-col items-center justify-center rounded border-2 border-(--pp-ink)/40 px-[8%]">
            <span className="pp-board-quote pixel-heading pointer-events-none text-center text-base leading-tight tracking-wide sm:text-lg">
              {tableQuote}
            </span>
          </div>
        </div>
      </div>

      {members.map((m, i) => {
        const angle = (i / seatCount) * 2 * Math.PI - Math.PI / 2;
        const left = 50 + 40 * Math.cos(angle);
        const top = 50 + 36 * Math.sin(angle);
        const cardCx = 50 + cardRx * Math.cos(angle);
        const cardCy = 50 + cardRy * Math.sin(angle);

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
        const hasCard = phase === "revealed" ? revealedPoint !== undefined : roundOpen && pointDone;
        const showSlot = !hasCard && Boolean(phase) && m.connected;

        return (
          <Fragment key={m.id}>
            {hasCard ? (
              <SeatCard
                key={`${roundNumber ?? 0}-${m.id}`}
                name={m.name}
                point={revealedPoint}
                cx={cardCx}
                cy={cardCy}
                scale={cardScale}
                flipDelayMs={Math.min(i * 60, 600)}
              />
            ) : showSlot ? (
              <SeatCardSlot cx={cardCx} cy={cardCy} scale={cardScale} />
            ) : null}
            <div
              className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 ${
                m.connected ? "" : "opacity-40"
              }`}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <div className="relative">
                {isThinking && !isNudged ? (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full">
                    <span
                      className="block animate-bounce text-lg leading-none"
                      title="Still deciding"
                      aria-label="Thinking"
                    >
                      💭
                    </span>
                  </div>
                ) : null}
                {isNudged ? (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center gap-0.5">
                    <span className="pixel-card whitespace-nowrap bg-(--pp-danger) px-2 py-1 text-sm font-bold text-white">
                      {nudgeText}
                    </span>
                    <span className="animate-bounce text-lg leading-none" aria-label="Nudge to vote">
                      <span className="inline-block rotate-[-35deg]">👊</span>
                    </span>
                  </div>
                ) : null}
                <Avatar avatarId={m.avatarId} size={36} />
                {m.isHost ? <HostChipBadge /> : null}
              </div>
              <span className="pixel-card max-w-[7rem] truncate bg-(--pp-panel) px-1.5 py-0.5 text-sm font-bold">
                {m.name}
              </span>
              {phase === "factors" && !factorsDone && m.connected ? (
                <span className="text-sm opacity-50">scoring…</span>
              ) : null}
              {viewerIsHost && m.id !== selfMemberId ? (
                <div className="mt-0.5 flex items-center gap-1">
                  {onTransferHost ? (
                    <button
                      type="button"
                      className="pixel-btn ghost px-1.5 py-0.5 text-sm"
                      title="Make host"
                      onClick={() => onTransferHost(m.id)}
                    >
                      ⇄
                    </button>
                  ) : null}
                  {onRemoveMember ? (
                    <button
                      type="button"
                      className="pixel-btn danger px-1.5 py-0.5 text-sm"
                      title="Remove from room"
                      onClick={() => onRemoveMember(m.id)}
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
