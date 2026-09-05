"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { StoryHistoryEntry } from "@planningpoker/shared";
import { HistoryTable } from "@/components/history/HistoryTable";

export default function HistoryPage() {
  const [entries, setEntries] = useState<StoryHistoryEntry[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off a fetch on mount/query change is the standard pattern
    setLoading(true);
    const params = query ? `?q=${encodeURIComponent(query)}` : "";
    fetch(`/api/history${params}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((body: { entries: StoryHistoryEntry[] }) => setEntries(body.entries))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [query]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="pixel-heading text-lg text-(--pp-primary)">HISTORY</h1>
        <Link href="/" className="text-sm underline opacity-70 hover:opacity-100">
          Back home
        </Link>
      </div>

      <input
        className="pixel-input"
        placeholder="Search by story title..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <section className="pixel-panel p-4">
        {loading ? <p className="text-sm opacity-60">Loading...</p> : <HistoryTable entries={entries} />}
      </section>
    </main>
  );
}
