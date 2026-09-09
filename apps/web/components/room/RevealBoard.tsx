"use client";

import { useState } from "react";
import type { Member, RevealedResult } from "@planningpoker/shared";

export function RevealBoard({
  results,
  members,
  isHost,
  scaleValues,
  onRevote,
  onFinalize,
}: {
  results: RevealedResult[];
  members: Member[];
  isHost: boolean;
  scaleValues: string[];
  onRevote: () => void;
  onFinalize: (finalPoint: string) => void;
}) {
  const points = results.map((r) => r.point);
  const consensus = points.length > 0 && points.every((p) => p === points[0]);

  const numericPoints = points.map((p) => Number.parseFloat(p)).filter((n) => !Number.isNaN(n));
  const averagePoint =
    numericPoints.length > 1 ? numericPoints.reduce((a, b) => a + b, 0) / numericPoints.length : null;

  function nearestScaleValue(target: number): string | null {
    let best: { value: string; diff: number } | null = null;
    for (const v of scaleValues) {
      const n = Number.parseFloat(v);
      if (Number.isNaN(n)) continue;
      const diff = Math.abs(n - target);
      if (!best || diff < best.diff) best = { value: v, diff };
    }
    return best?.value ?? null;
  }

  const defaultFinalPoint =
    (consensus ? points[0] : null) ??
    (averagePoint !== null ? nearestScaleValue(averagePoint) : null) ??
    points[0] ??
    scaleValues[0] ??
    "";
  const [finalPoint, setFinalPoint] = useState(defaultFinalPoint);

  return (
    <div className="pixel-panel flex flex-col gap-4 p-4">
      <div
        className={`pixel-card px-3 py-2 text-sm font-bold ${
          consensus ? "bg-(--pp-success) text-white" : "bg-(--pp-warning)"
        }`}
      >
        {consensus ? "Consensus reached!" : "No consensus yet — discuss and consider a re-vote."}
      </div>

      {!consensus && averagePoint !== null ? (
        <div className="pixel-card bg-(--pp-panel) px-3 py-2 text-sm">
          Average story point: <span className="font-bold">{averagePoint.toFixed(1)}</span>
        </div>
      ) : null}

      <ul className="flex flex-col gap-2">
        {results.map((r) => {
          const member = members.find((m) => m.id === r.memberId);
          return (
            <li
              key={r.memberId}
              className="pixel-card flex items-center justify-between gap-3 px-3 py-2"
            >
              <span className="truncate text-sm font-bold">{member?.name ?? "Unknown"}</span>
              <div className="group relative shrink-0">
                <span
                  className="cursor-help text-xl font-bold underline decoration-dotted decoration-2 underline-offset-4"
                  tabIndex={0}
                >
                  {r.point}
                </span>
                <div className="pixel-panel pointer-events-none invisible absolute bottom-full right-0 z-10 mb-2 w-36 flex-col gap-2 p-3 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 flex">
                  <Gauge label="Risk" value={r.risk} />
                  <Gauge label="Complexity" value={r.complexity} />
                  <Gauge label="Repetition" value={r.repetition} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {isHost ? (
        <div className="flex flex-wrap items-center gap-2 border-t-2 border-dashed border-(--pp-ink)/30 pt-4">
          <button type="button" className="pixel-btn ghost" onClick={onRevote}>
            START RE-VOTE
          </button>

          <select
            className="pixel-input"
            value={finalPoint}
            onChange={(e) => setFinalPoint(e.target.value)}
          >
            {scaleValues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <button type="button" className="pixel-btn secondary" onClick={() => onFinalize(finalPoint)}>
            FINALIZE STORY
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Gauge({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  return (
    <div className="flex flex-col gap-0.5 text-left">
      <div className="flex items-center justify-between text-[10px] font-bold">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-sm border border-(--pp-ink) bg-(--pp-bg)">
        <div className="h-full bg-(--pp-primary)" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
