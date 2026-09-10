import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { deleteRoomKeys, keysToRoomCodes, listStaleRoomKeys } from "@/lib/roomCleanup";

const MAX_ROOM_CODES_IN_RESPONSE = 200;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const WIPE_ALL_CONFIRM = "WIPE ALL DATA";

interface CleanupBody {
  olderThanDays?: number;
  wipeAll?: boolean;
  confirm?: string;
  dryRun?: boolean;
}

// Deletes rooms whose last activity is older than `olderThanDays` (or every room, with
// wipeAll), to reclaim R2 storage. Protected by a shared secret since the app has no global
// admin auth (only per-room hostTokens). Set the secret in prod with
// `wrangler secret put ADMIN_SECRET`; for local dev, put it in apps/web/.dev.vars (see
// .dev.vars.example).
export async function POST(request: Request) {
  const { env } = getCloudflareContext();

  if (!env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Admin secret not configured" }, { status: 500 });
  }
  if (request.headers.get("x-admin-secret") !== env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CleanupBody;

  let cutoffMs: number | undefined;
  if (body.wipeAll) {
    if (body.confirm !== WIPE_ALL_CONFIRM) {
      return NextResponse.json(
        { error: `wipeAll requires confirm: "${WIPE_ALL_CONFIRM}"` },
        { status: 400 },
      );
    }
    cutoffMs = undefined;
  } else {
    if (!Number.isFinite(body.olderThanDays) || body.olderThanDays! < 1) {
      return NextResponse.json(
        { error: "olderThanDays must be a number >= 1 (or set wipeAll: true)" },
        { status: 400 },
      );
    }
    cutoffMs = Date.now() - body.olderThanDays! * MS_PER_DAY;
  }

  const dryRun = body.dryRun === true;
  const staleKeys = await listStaleRoomKeys(env.ROOMS_BUCKET, cutoffMs);
  if (!dryRun) {
    await deleteRoomKeys(env.ROOMS_BUCKET, staleKeys);
  }

  return NextResponse.json({
    dryRun,
    wipeAll: Boolean(body.wipeAll),
    olderThanDays: body.wipeAll ? null : body.olderThanDays,
    deletedCount: staleKeys.length,
    roomCodes: keysToRoomCodes(staleKeys.slice(0, MAX_ROOM_CODES_IN_RESPONSE)),
  });
}
