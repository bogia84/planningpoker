import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { SessionHistoryEntry } from "@planningpoker/shared";
import { getRoom } from "@/lib/roomStore";

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function toCsv(entries: SessionHistoryEntry[]): string {
  const header = [
    "Story",
    "Stage",
    "Final Point",
    "Avg Risk",
    "Avg Complexity",
    "Avg Repetition",
    "Rounds",
    "Finalized At",
  ];
  const rows = entries.map((e) =>
    [
      e.storyTitle,
      e.stage,
      e.finalPoint,
      e.avgRisk.toFixed(2),
      e.avgComplexity.toFixed(2),
      e.avgRepetition.toFixed(2),
      String(e.roundCount),
      new Date(e.finalizedAt * 1000).toISOString(),
    ].map((v) => csvEscape(String(v))),
  );
  return [header.map(csvEscape), ...rows].map((row) => row.join(",")).join("\r\n");
}

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { env } = getCloudflareContext();

  const room = await getRoom(env.ROOMS_BUCKET, code.toUpperCase());
  if (!room) {
    return new Response("Room not found", { status: 404 });
  }

  const csv = toCsv(room.record.history);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="planning-poker-${room.record.roomCode}.csv"`,
    },
  });
}
