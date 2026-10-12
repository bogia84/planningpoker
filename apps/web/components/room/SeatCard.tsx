"use client";

import { useState, type CSSProperties } from "react";

type RingPosition = {
  /** Horizontal position on the board's inner card ring, in percent of the table container's width. */
  cx: number;
  /** Vertical position on the inner card ring, in percent of the table container's height. */
  cy: number;
  /** Card size multiplier — purely a function of seat count, never of any one seat's content. */
  scale: number;
};

function ringStyle({ cx, cy, scale }: RingPosition): CSSProperties {
  return {
    left: `${cx}%`,
    top: `${cy}%`,
    "--pp-card-scale": scale,
  } as CSSProperties;
}

/**
 * A playing card positioned on the board's inner ring of card slots. `point` is
 * only ever passed once the round is revealed, so a face-down card has no value
 * anywhere in the DOM.
 */
export function SeatCard({
  name,
  point,
  flipDelayMs,
  cx,
  cy,
  scale,
}: RingPosition & {
  name: string;
  /** Revealed value; undefined while the card is still face-down. */
  point?: string;
  flipDelayMs: number;
}) {
  // A card that mounts already face-up (load/reconnect on a revealed round) shows
  // no flip and no entrance animation; only live transitions animate.
  const [mountedFaceUp] = useState(point !== undefined);
  const len = point === undefined ? 0 : Math.min([...point].length, 5);

  return (
    <div
      className="pp-seat-card"
      style={{ ...ringStyle({ cx, cy, scale }), "--pp-flip-delay": `${flipDelayMs}ms` } as CSSProperties}
      role="img"
      aria-label={point === undefined ? "Card face down" : `${name}: ${point}`}
    >
      <div
        className={`pp-card-inner h-full w-full ${mountedFaceUp ? "" : "pp-card-in"}`}
        data-flipped={point !== undefined}
      >
        <div className="pp-card-face pp-card-back" />
        {point !== undefined ? (
          <div className="pp-card-face pp-card-front" aria-hidden="true">
            <span className="pp-card-corner pp-card-corner-tl" data-len={len}>
              {point}
            </span>
            <span className="pp-card-center" data-len={len}>
              {point}
            </span>
            <span className="pp-card-corner pp-card-corner-br" data-len={len}>
              {point}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SeatCardSlot(props: RingPosition) {
  return (
    <div className="pp-seat-card" style={ringStyle(props)} aria-hidden="true">
      <div className="pp-card-slot" />
    </div>
  );
}
