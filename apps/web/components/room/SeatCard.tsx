"use client";

import { useState, type CSSProperties } from "react";

/**
 * Side seats put the card in the avatar row on the avatar's table-facing side,
 * pushed further inward the more the seat faces sideways so it clears the
 * neighbouring seat's label and buttons. Top and bottom seats put it past the
 * seat block (below for upper seats, above for lower ones), capped so it never
 * crosses the board midline into the opposite seat's card.
 */
function placement(angle: number, topPct: number, blockRem: number, bubbleRem: number, scale: number) {
  const ux = -Math.cos(angle);
  const uy = -Math.sin(angle);
  const below = uy > 0;
  return {
    mode: Math.abs(ux) >= 0.45 ? "h" : "v",
    style: {
      "--sx": ux > 0 ? 1 : -1,
      "--sy": below ? 1 : -1,
      "--exf": Math.abs(ux).toFixed(3),
      "--hh": `${blockRem / 2 + (below ? 0 : bubbleRem)}rem`,
      "--avy": `${-blockRem / 2 + 1.125}rem`,
      // Seat-to-midline distance as a share of the 3:2 container width (cqw).
      "--mid": (Math.abs(50 - topPct) * (2 / 3)).toFixed(2),
      "--pp-card-scale": scale,
    } as CSSProperties,
  };
}

type PlacementProps = {
  /** The seat's angle on the ellipse, in radians. */
  angle: number;
  /** The seat's top offset, in percent of the table container height. */
  topPct: number;
  /** Height in rem of the seat block (avatar, label and any control rows). */
  blockRem: number;
  /** Height in rem of the thinking/nudge bubble that sits above the avatar. */
  bubbleRem: number;
  scale: number;
};

/**
 * A playing card positioned relative to its seat element. `point` is only ever
 * passed once the round is revealed, so a face-down card has no value anywhere
 * in the DOM.
 */
export function SeatCard({
  name,
  point,
  flipDelayMs,
  angle,
  topPct,
  blockRem,
  bubbleRem,
  scale,
}: PlacementProps & {
  name: string;
  /** Revealed value; undefined while the card is still face-down. */
  point?: string;
  flipDelayMs: number;
}) {
  // A card that mounts already face-up (load/reconnect on a revealed round) shows
  // no flip and no entrance animation; only live transitions animate.
  const [mountedFaceUp] = useState(point !== undefined);
  const { mode, style } = placement(angle, topPct, blockRem, bubbleRem, scale);
  const len = point === undefined ? 0 : Math.min([...point].length, 5);

  return (
    <div
      className="pp-seat-card"
      data-mode={mode}
      style={{ ...style, "--pp-flip-delay": `${flipDelayMs}ms` } as CSSProperties}
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

export function SeatCardSlot(props: PlacementProps) {
  const { mode, style } = placement(props.angle, props.topPct, props.blockRem, props.bubbleRem, props.scale);
  return (
    <div className="pp-seat-card" data-mode={mode} style={style} aria-hidden="true">
      <div className="pp-card-slot" />
    </div>
  );
}
