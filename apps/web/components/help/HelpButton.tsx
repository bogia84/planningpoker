"use client";

import { useState } from "react";
import { HelpModal } from "./HelpModal";
import type { HelpContent } from "@/lib/helpContent";

export function HelpButton({ content }: { content: HelpContent }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="pixel-btn ghost !px-3 !py-2"
        onClick={() => setOpen(true)}
        aria-label="Help"
      >
        ?
      </button>
      <HelpModal open={open} onClose={() => setOpen(false)} content={content} />
    </>
  );
}
