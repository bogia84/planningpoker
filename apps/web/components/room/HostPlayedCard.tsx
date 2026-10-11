"use client";

import { useEffect, useState } from "react";

/**
 * The host's revealed point, played face-up in the center of the table —
 * distinct from the small per-seat badges every member gets. Keyed by the
 * caller on host id + point so a new host/value remounts and re-animates in.
 */
export function HostPlayedCard({ point }: { point: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={`pixel-card flex h-[70%] w-[55%] min-h-0 min-w-0 items-center justify-center overflow-hidden bg-(--pp-primary) px-1 py-0.5 text-white transition-all duration-300 ease-out sm:px-3 sm:py-2 ${
        visible ? "scale-100 opacity-100" : "scale-75 opacity-0"
      }`}
      title={`Host's revealed card: ${point}`}
    >
      <span className="w-full truncate text-center text-sm font-bold leading-none sm:text-2xl">
        {point}
      </span>
    </div>
  );
}
