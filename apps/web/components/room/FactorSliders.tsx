"use client";

import { useState } from "react";
import type { FactorScores } from "@planningpoker/shared";

const FACTORS: { key: keyof FactorScores; label: string; hint: string }[] = [
  { key: "risk", label: "Risk", hint: "Unclear demand, 3rd-party deps, future uncertainty" },
  { key: "complexity", label: "Complexity", hint: "Effort needed to build it" },
  { key: "repetition", label: "Repetition", hint: "Monotonous, low-risk, low-complexity work" },
];

export function FactorSliders({
  submitted,
  onSubmit,
}: {
  submitted: boolean;
  onSubmit: (scores: FactorScores) => void;
}) {
  const [scores, setScores] = useState<FactorScores>({ risk: 5, complexity: 5, repetition: 5 });

  if (submitted) {
    return (
      <div className="pixel-card p-4 text-sm">
        Factor scores submitted — waiting to pick your point card.
      </div>
    );
  }

  return (
    <div className="pixel-panel flex flex-col gap-4 p-4">
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
            onChange={(e) => setScores((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
          />
          <p className="text-xs opacity-60">{hint}</p>
        </div>
      ))}
      <button type="button" className="pixel-btn self-start" onClick={() => onSubmit(scores)}>
        SUBMIT SCORES
      </button>
    </div>
  );
}
