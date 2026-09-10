"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpButton } from "@/components/help/HelpButton";
import { CREATE_HELP, HOME_HELP } from "@/lib/helpContent";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const helpContent = isHome ? HOME_HELP : pathname === "/create" ? CREATE_HELP : null;

  return (
    <div className="flex items-center justify-between gap-2 px-4 pt-4">
      {isHome ? (
        <a href="https://tamdoan.work" className="pixel-btn ghost inline-flex items-center gap-2">
          ← TAMDOAN.WORK
        </a>
      ) : (
        <Link href="/" className="pixel-btn ghost inline-flex items-center gap-2">
          ← HOME
        </Link>
      )}
      {helpContent ? <HelpButton content={helpContent} /> : null}
    </div>
  );
}
