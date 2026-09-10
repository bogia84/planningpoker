import type { R2Bucket } from "@cloudflare/workers-types";

const ROOM_PREFIX = "rooms/";
const R2_DELETE_BATCH_SIZE = 1000;

function keyToRoomCode(key: string): string {
  return key.slice(ROOM_PREFIX.length, -".json".length);
}

// Every room mutation (createRoom/mutateRoom in roomStore.ts) does a full R2 put of the
// whole record, so an object's `uploaded` timestamp is effectively the room's updatedAt —
// letting us find stale rooms from list() metadata alone, without fetching each room's body.
// Pass cutoffMs = undefined to match every room (used for a full wipe).
export async function listStaleRoomKeys(bucket: R2Bucket, cutoffMs?: number): Promise<string[]> {
  const staleKeys: string[] = [];
  let cursor: string | undefined;

  do {
    const page = await bucket.list({ prefix: ROOM_PREFIX, cursor });
    for (const object of page.objects) {
      if (cutoffMs === undefined || object.uploaded.getTime() < cutoffMs) {
        staleKeys.push(object.key);
      }
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  return staleKeys;
}

export async function deleteRoomKeys(bucket: R2Bucket, keys: string[]): Promise<void> {
  for (let i = 0; i < keys.length; i += R2_DELETE_BATCH_SIZE) {
    await bucket.delete(keys.slice(i, i + R2_DELETE_BATCH_SIZE));
  }
}

export function keysToRoomCodes(keys: string[]): string[] {
  return keys.map(keyToRoomCode);
}
