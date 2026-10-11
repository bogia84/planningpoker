import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getRoom } from "@/lib/roomStore";
import { deleteRoomKeys, keysToRoomCodes, listStaleRoomKeys, roomCodeToKey } from "@/lib/roomCleanup";

const WIPE_ALL_CONFIRM = "WIPE ALL DATA";

function isAuthorized(request: Request, env: CloudflareEnv): boolean {
  return Boolean(env.ADMIN_SECRET) && request.headers.get("x-admin-secret") === env.ADMIN_SECRET;
}

// Lists every session (room) currently stored in R2. Protected by the same shared
// ADMIN_SECRET as /api/admin/cleanup — see that route for how to set it.
export async function GET(request: Request) {
  const { env } = getCloudflareContext();

  if (!env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Admin secret not configured" }, { status: 500 });
  }
  if (!isAuthorized(request, env)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await listStaleRoomKeys(env.ROOMS_BUCKET);
  const roomCodes = keysToRoomCodes(keys);

  const rooms = (
    await Promise.all(
      roomCodes.map(async (roomCode) => {
        const room = await getRoom(env.ROOMS_BUCKET, roomCode);
        if (!room) return null;
        const { record } = room;
        return {
          roomCode: record.roomCode,
          sessionName: record.config.sessionName,
          stage: record.config.stage,
          memberCount: record.members.length,
          storyCount: record.stories.length,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        };
      }),
    )
  ).filter((room): room is NonNullable<typeof room> => room !== null);

  return NextResponse.json({ count: rooms.length, rooms });
}

interface DeleteRoomsBody {
  roomCode?: string;
  all?: boolean;
  confirm?: string;
}

// Deletes one session by roomCode, or every session with `all: true` + the confirm
// phrase below. Same ADMIN_SECRET auth as GET above.
export async function DELETE(request: Request) {
  const { env } = getCloudflareContext();

  if (!env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Admin secret not configured" }, { status: 500 });
  }
  if (!isAuthorized(request, env)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as DeleteRoomsBody;

  if (body.all) {
    if (body.confirm !== WIPE_ALL_CONFIRM) {
      return NextResponse.json(
        { error: `all requires confirm: "${WIPE_ALL_CONFIRM}"` },
        { status: 400 },
      );
    }
    const keys = await listStaleRoomKeys(env.ROOMS_BUCKET);
    await deleteRoomKeys(env.ROOMS_BUCKET, keys);
    return NextResponse.json({ deletedCount: keys.length, roomCodes: keysToRoomCodes(keys) });
  }

  const roomCode = body.roomCode?.trim().toUpperCase();
  if (!roomCode) {
    return NextResponse.json(
      { error: "roomCode is required (or set all: true with confirm)" },
      { status: 400 },
    );
  }

  const existing = await getRoom(env.ROOMS_BUCKET, roomCode);
  if (!existing) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  await deleteRoomKeys(env.ROOMS_BUCKET, [roomCodeToKey(roomCode)]);
  return NextResponse.json({ deletedCount: 1, roomCodes: [roomCode] });
}
