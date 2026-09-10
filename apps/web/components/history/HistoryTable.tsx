import type { SessionHistoryEntry } from "@planningpoker/shared";

export function HistoryTable({ entries }: { entries: SessionHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm opacity-60">No finalized stories yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-base">
        <thead>
          <tr className="pixel-heading text-left text-sm">
            <th className="border-b-2 border-(--pp-ink) px-2 py-2">Story</th>
            <th className="border-b-2 border-(--pp-ink) px-2 py-2">Stage</th>
            <th className="border-b-2 border-(--pp-ink) px-2 py-2">Point</th>
            <th className="border-b-2 border-(--pp-ink) px-2 py-2">Risk</th>
            <th className="border-b-2 border-(--pp-ink) px-2 py-2">Complexity</th>
            <th className="border-b-2 border-(--pp-ink) px-2 py-2">Repetition</th>
            <th className="border-b-2 border-(--pp-ink) px-2 py-2">Rounds</th>
            <th className="border-b-2 border-(--pp-ink) px-2 py-2">Finalized</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="odd:bg-black/5">
              <td className="px-2 py-2.5">{entry.storyTitle}</td>
              <td className="px-2 py-2.5 capitalize">{entry.stage}</td>
              <td className="px-2 py-2.5 font-bold">{entry.finalPoint}</td>
              <td className="px-2 py-2.5">{entry.avgRisk.toFixed(1)}</td>
              <td className="px-2 py-2.5">{entry.avgComplexity.toFixed(1)}</td>
              <td className="px-2 py-2.5">{entry.avgRepetition.toFixed(1)}</td>
              <td className="px-2 py-2.5">{entry.roundCount}</td>
              <td className="px-2 py-2.5">{new Date(entry.finalizedAt * 1000).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
