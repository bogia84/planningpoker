"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemePicker } from "@/components/theme/ThemePicker";
import { APP_VERSION } from "@/lib/version";

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) router.push(`/room/${trimmed}`);
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-16 text-center">
      <div>
        <h1 className="pixel-heading text-3xl sm:text-4xl text-(--pp-primary) drop-shadow-(--pp-heading-shadow)">
          PLANNING
          <br />
          POKER
        </h1>
        <p className="mt-2 text-sm uppercase tracking-widest opacity-50">v{APP_VERSION}</p>
        <p className="mt-4 text-lg">Estimate user stories with your Scrum team.</p>
      </div>

      <ThemePicker />

      <div className="pixel-panel flex w-full max-w-sm flex-col gap-6 p-6">
        <Link href="/create" className="pixel-btn text-center">
          HOST A ROOM
        </Link>

        <div className="flex items-center gap-3 text-sm opacity-70">
          <div className="h-px flex-1 bg-current" />
          OR JOIN
          <div className="h-px flex-1 bg-current" />
        </div>

        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <input
            className="pixel-input text-center tracking-widest uppercase"
            placeholder="ROOM CODE"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={8}
          />
          <button type="submit" className="pixel-btn secondary" disabled={!code.trim()}>
            JOIN ROOM
          </button>
        </form>
      </div>
    </main>
  );
}
