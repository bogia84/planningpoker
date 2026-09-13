import type { SessionHistoryEntry } from "@planningpoker/shared";

export function HistoryTable({ entries }: { entries: SessionHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm opacity-60">No finalized stories yet.</p>;
  }

  return (
    <div className="pp-table-wrap">
      <table className="pp-table">
        <thead>
          <tr className="pixel-heading">
            <th>Story</th>
            <th>Stage</th>
            <th>Point</th>
            <th>Risk</th>
            <th>Complexity</th>
            <th>Repetition</th>
            <th>Rounds</th>
            <th>Finalized</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.storyTitle}</td>
              <td className="capitalize">{entry.stage}</td>
              <td className="font-bold">{entry.finalPoint}</td>
              <td>{entry.avgRisk.toFixed(1)}</td>
              <td>{entry.avgComplexity.toFixed(1)}</td>
              <td>{entry.avgRepetition.toFixed(1)}</td>
              <td>{entry.roundCount}</td>
              <td>{new Date(entry.finalizedAt * 1000).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
