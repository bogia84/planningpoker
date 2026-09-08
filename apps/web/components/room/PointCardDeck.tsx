"use client";

export function PointCardDeck({
  scaleValues,
  selected,
  onSelect,
}: {
  scaleValues: string[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {scaleValues.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          className={`pixel-card flex h-16 w-12 items-center justify-center text-lg font-bold transition ${
            selected === value ? "bg-(--pp-primary) text-white -translate-y-1" : ""
          }`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
