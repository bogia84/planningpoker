"use client";

import { useEffect } from "react";
import type { HelpContent } from "@/lib/helpContent";

export function HelpModal({
  open,
  onClose,
  content,
}: {
  open: boolean;
  onClose: () => void;
  content: HelpContent;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="pixel-panel flex max-h-[80vh] w-full max-w-[400px] flex-col gap-4 overflow-y-auto p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="help-modal-title" className="pixel-heading text-sm text-(--pp-primary)">
            {content.title}
          </h2>
          <button type="button" className="pixel-btn ghost !px-2 !py-1" onClick={onClose} aria-label="Close">
            X
          </button>
        </div>

        {content.intro ? <p className="text-sm opacity-80">{content.intro}</p> : null}

        {content.sections.map((section, i) => (
          <div key={i} className="flex flex-col gap-1">
            {section.heading ? <h3 className="pixel-heading text-xs">{section.heading}</h3> : null}
            <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm">
              {section.steps.map((step, j) => (
                <li key={j}>{step}</li>
              ))}
            </ol>
          </div>
        ))}

        <button type="button" className="pixel-btn secondary self-end" onClick={onClose}>
          GOT IT
        </button>
      </div>
    </div>
  );
}
