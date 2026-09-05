"use client";

import { SCALE_PRESETS, type ScaleType } from "@planningpoker/shared";

const SCALE_LABELS: Record<ScaleType, string> = {
  tshirt: "T-Shirt Sizes",
  fibonacci: "Fibonacci",
  modified_fibonacci: "Modified Fibonacci",
  custom: "Custom",
};

export function ScaleConfigForm({
  scaleType,
  customValues,
  onScaleTypeChange,
  onCustomValuesChange,
}: {
  scaleType: ScaleType;
  customValues: string;
  onScaleTypeChange: (type: ScaleType) => void;
  onCustomValuesChange: (values: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(SCALE_LABELS) as ScaleType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onScaleTypeChange(type)}
            className={`pixel-card p-3 text-sm ${scaleType === type ? "bg-(--pp-primary) text-white" : ""}`}
          >
            {SCALE_LABELS[type]}
          </button>
        ))}
      </div>

      {scaleType === "custom" ? (
        <div className="flex flex-col gap-1">
          <label className="text-sm opacity-70">Comma-separated point values</label>
          <input
            className="pixel-input"
            placeholder="1, 2, 3, 5, 8, 13"
            value={customValues}
            onChange={(e) => onCustomValuesChange(e.target.value)}
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {SCALE_PRESETS[scaleType].map((v) => (
            <span key={v} className="pixel-card px-3 py-1 text-sm">
              {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
