"use client";

import type { FactorScores } from "@planningpoker/shared";

const FACTORS: { key: keyof FactorScores; label: string; hint: string }[] = [
  { key: "risk", label: "Risk", hint: "Unclear demand, 3rd-party deps, future uncertainty" },
  { key: "complexity", label: "Complexity", hint: "Effort needed to build it" },
  { key: "repetition", label: "Repetition", hint: "Monotonous, low-risk, low-complexity work" },
];

export function FactorSliders({
  scores,
  onChange,
}: {
  scores: FactorScores;
  onChange: (scores: FactorScores) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {FACTORS.map(({ key, label, hint }) => (
        <div key={key} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <label className="pixel-heading text-xs">{label}</label>
            <span className="text-sm font-bold">{scores[key]}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={scores[key]}
            onChange={(e) => onChange({ ...scores, [key]: Number(e.target.value) })}
          />
          <p className="text-xs opacity-60">{hint}</p>
        </div>
      ))}
    </div>
  );
}
