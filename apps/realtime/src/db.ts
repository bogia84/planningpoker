import type { RoomConfig, Story, StoryStatus } from "@planningpoker/shared";

export interface LoadedRoom {
  config: RoomConfig;
  hostToken: string;
  stories: Story[];
}

export async function loadRoomFromD1(db: D1Database, roomCode: string): Promise<LoadedRoom | null> {
  const roomRow = await db
    .prepare("SELECT * FROM rooms WHERE id = ?")
    .bind(roomCode)
    .first<{
      id: string;
      host_token: string;
      scale_type: string;
      scale_values: string;
      stage: string;
    }>();

  if (!roomRow) return null;

  const storyRows = await db
    .prepare("SELECT * FROM stories WHERE room_id = ? ORDER BY sort_order ASC")
    .bind(roomCode)
    .all<{
      id: string;
      title: string;
      description: string | null;
      sort_order: number;
      status: string;
    }>();

  return {
    hostToken: roomRow.host_token,
    config: {
      scaleType: roomRow.scale_type as RoomConfig["scaleType"],
      scaleValues: JSON.parse(roomRow.scale_values),
      stage: roomRow.stage as RoomConfig["stage"],
    },
    stories: (storyRows.results ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      sortOrder: row.sort_order,
      status: row.status as StoryStatus,
    })),
  };
}

export async function saveStoriesToD1(db: D1Database, roomCode: string, stories: Story[]): Promise<void> {
  const statements = [
    db.prepare("DELETE FROM stories WHERE room_id = ?").bind(roomCode),
    ...stories.map((story) =>
      db
        .prepare(
          "INSERT INTO stories (id, room_id, title, description, sort_order, status) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(story.id, roomCode, story.title, story.description ?? null, story.sortOrder, story.status),
    ),
  ];
  await db.batch(statements);
}

export async function updateRoomConfigInD1(db: D1Database, roomCode: string, config: RoomConfig): Promise<void> {
  await db
    .prepare("UPDATE rooms SET scale_type = ?, scale_values = ?, stage = ? WHERE id = ?")
    .bind(config.scaleType, JSON.stringify(config.scaleValues), config.stage, roomCode)
    .run();
}

export interface FinalizeStoryInput {
  storyId: string;
  roomId: string;
  storyTitle: string;
  stage: RoomConfig["stage"];
  finalPoint: string;
  avgRisk: number;
  avgComplexity: number;
  avgRepetition: number;
  roundCount: number;
  memberVotesJson: string;
}

export async function finalizeStoryInD1(db: D1Database, input: FinalizeStoryInput): Promise<string> {
  const historyId = crypto.randomUUID();

  await db.batch([
    db
      .prepare(
        `INSERT INTO story_history
          (id, story_id, room_id, story_title, stage, final_point, avg_risk, avg_complexity, avg_repetition, round_count, member_votes_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        historyId,
        input.storyId,
        input.roomId,
        input.storyTitle,
        input.stage,
        input.finalPoint,
        input.avgRisk,
        input.avgComplexity,
        input.avgRepetition,
        input.roundCount,
        input.memberVotesJson,
      ),
    db.prepare("UPDATE stories SET status = 'finalized' WHERE id = ?").bind(input.storyId),
    db.prepare("UPDATE rooms SET last_active_at = unixepoch() WHERE id = ?").bind(input.roomId),
  ]);

  return historyId;
}
