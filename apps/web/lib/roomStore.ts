import type { R2Bucket } from "@cloudflare/workers-types";
import type { FactorScores, Member, RevealedResult, RoomConfig, SessionHistoryEntry, Story } from "@planningpoker/shared";

export interface StoredRound {
  roundNumber: number;
  phase: "factors" | "revealed";
  factorScores: Record<string, FactorScores>;
  pointVotes: Record<string, string>;
  results: RevealedResult[] | null;
}

export interface RoomRecord {
  roomCode: string;
  hostToken: string;
  config: RoomConfig;
  stories: Story[];
  members: Member[];
  activeStoryId: string | null;
  round: StoredRound | null;
  history: SessionHistoryEntry[];
  createdAt: number;
  updatedAt: number;
}

export class RoomConflictError extends Error {
  constructor() {
    super("Room is busy, please retry");
  }
}

function objectKey(roomCode: string): string {
  return `rooms/${roomCode.toUpperCase()}.json`;
}

export async function getRoom(
  bucket: R2Bucket,
  roomCode: string,
): Promise<{ record: RoomRecord; etag: string } | null> {
  const obj = await bucket.get(objectKey(roomCode));
  if (!obj) return null;
  const record = await obj.json<RoomRecord>();
  return { record, etag: obj.etag };
}

export async function createRoom(bucket: R2Bucket, record: RoomRecord): Promise<boolean> {
  // Tiny race between head() and put() is acceptable: room codes are drawn from a
  // 32-symbol, 6-character alphabet (~1B combinations), so collisions are rare, and
  // POST /api/rooms already retries with a fresh code on failure either way.
  const existing = await bucket.head(objectKey(record.roomCode));
  if (existing) return false;
  await bucket.put(objectKey(record.roomCode), JSON.stringify(record), {
    httpMetadata: { contentType: "application/json" },
  });
  return true;
}

export async function mutateRoom<T = undefined>(
  bucket: R2Bucket,
  roomCode: string,
  mutator: (record: RoomRecord) => { record: RoomRecord; extra?: T },
): Promise<{ record: RoomRecord; extra: T }> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await getRoom(bucket, roomCode);
    if (!existing) throw new Error("Room not found");

    const { record, extra } = mutator(existing.record);
    record.updatedAt = Date.now();

    const put = await bucket.put(objectKey(roomCode), JSON.stringify(record), {
      onlyIf: { etagMatches: existing.etag },
      httpMetadata: { contentType: "application/json" },
    });
    if (put) return { record, extra: extra as T };
  }
  throw new RoomConflictError();
}
