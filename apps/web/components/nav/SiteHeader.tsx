"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div className="px-4 pt-4">
      <Link href="/" className="pixel-btn ghost inline-flex items-center gap-2 text-xs">
        ← HOME
      </Link>
    </div>
  );
}
