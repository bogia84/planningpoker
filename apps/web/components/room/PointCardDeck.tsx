"use client";

import { useState } from "react";

export function PointCardDeck({
  scaleValues,
  onSelect,
}: {
  scaleValues: string[];
  onSelect: (value: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {scaleValues.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setSelected(value);
              onSelect(value);
            }}
            className={`pixel-card flex h-16 w-12 items-center justify-center text-lg font-bold transition ${
              selected === value ? "bg-(--pp-primary) text-white -translate-y-1" : ""
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      {selected ? (
        <p className="text-xs opacity-60">You picked {selected} — you can change it until the host reveals.</p>
      ) : null}
    </div>
  );
}
