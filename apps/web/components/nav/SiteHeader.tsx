"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="px-4 pt-4">
      {isHome ? (
        <a href="https://tamdoan.work" className="pixel-btn ghost inline-flex items-center gap-2">
          ← TAMDOAN.WORK
        </a>
      ) : (
        <Link href="/" className="pixel-btn ghost inline-flex items-center gap-2">
          ← HOME
        </Link>
      )}
    </div>
  );
}
