import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { StoryHistoryEntry } from "@planningpoker/shared";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  const room = url.searchParams.get("room")?.trim();

  const { env } = getCloudflareContext();

  const conditions: string[] = [];
  const bindings: string[] = [];

  if (q) {
    conditions.push("story_title LIKE ?");
    bindings.push(`%${q}%`);
  }
  if (room) {
    conditions.push("room_id = ?");
    bindings.push(room.toUpperCase());
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { results } = await env.DB.prepare(
    `SELECT id, story_id, room_id, story_title, stage, final_point, avg_risk, avg_complexity, avg_repetition, round_count, finalized_at
     FROM story_history ${where} ORDER BY finalized_at DESC LIMIT 200`,
  )
    .bind(...bindings)
    .all<{
      id: string;
      story_id: string;
      room_id: string;
      story_title: string;
      stage: string;
      final_point: string;
      avg_risk: number;
      avg_complexity: number;
      avg_repetition: number;
      round_count: number;
      finalized_at: number;
    }>();

  const entries: StoryHistoryEntry[] = (results ?? []).map((row) => ({
    id: row.id,
    storyId: row.story_id,
    roomId: row.room_id,
    storyTitle: row.story_title,
    stage: row.stage as StoryHistoryEntry["stage"],
    finalPoint: row.final_point,
    avgRisk: row.avg_risk,
    avgComplexity: row.avg_complexity,
    avgRepetition: row.avg_repetition,
    roundCount: row.round_count,
    finalizedAt: row.finalized_at,
  }));

  return NextResponse.json({ entries });
}
