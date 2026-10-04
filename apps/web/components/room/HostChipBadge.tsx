const NOTCH_COUNT = 8;

/**
 * Poker-chip styled badge marking the room host's avatar. Purely
 * presentational and static — no hover/transition/animation.
 */
export function HostChipBadge() {
  return (
    <span
      className="pixel-card absolute -top-2 left-1/2 z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-(--pp-warning) text-(--pp-ink)"
      title="Host"
      aria-label="Host"
    >
      <svg viewBox="0 0 20 20" className="h-full w-full" aria-hidden="true">
        {Array.from({ length: NOTCH_COUNT }, (_, i) => {
          const angle = (i / NOTCH_COUNT) * 360;
          return (
            <rect
              key={i}
              x="9"
              y="0.5"
              width="2"
              height="3"
              fill="var(--pp-ink)"
              transform={`rotate(${angle} 10 10)`}
            />
          );
        })}
        <text
          x="10"
          y="10"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fontWeight="bold"
          fill="var(--pp-ink)"
        >
          D
        </text>
      </svg>
    </span>
  );
}
