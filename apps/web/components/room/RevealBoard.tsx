"use client";

import { useState } from "react";
import type { Member, RevealedResult } from "@planningpoker/shared";
import { PixelAvatar } from "@/components/avatar/PixelAvatar";

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
  const [finalPoint, setFinalPoint] = useState(points[0] ?? scaleValues[0] ?? "");

  return (
    <div className="pixel-panel flex flex-col gap-4 p-4">
      <div
        className={`pixel-card px-3 py-2 text-sm font-bold ${
          consensus ? "bg-(--pp-success) text-white" : "bg-(--pp-warning)"
        }`}
      >
        {consensus ? "Consensus reached!" : "No consensus yet — discuss and consider a re-vote."}
      </div>

      <ul className="flex flex-wrap gap-3">
        {results.map((r) => {
          const member = members.find((m) => m.id === r.memberId);
          return (
            <li key={r.memberId} className="pixel-card flex w-40 flex-col items-center gap-2 p-3">
              <PixelAvatar avatarId={member?.avatarId ?? "mint"} size={32} />
              <span className="text-xs">{member?.name ?? "Unknown"}</span>
              <span className="text-2xl font-bold">{r.point}</span>
              <div className="grid w-full grid-cols-3 gap-1 text-center text-[10px] opacity-70">
                <span>R {r.risk}</span>
                <span>C {r.complexity}</span>
                <span>P {r.repetition}</span>
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
