import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getRoom } from "@/lib/roomStore";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { env } = getCloudflareContext();

  const room = await getRoom(env.ROOMS_BUCKET, code.toUpperCase());
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({
    roomCode: room.record.roomCode,
    scaleType: room.record.config.scaleType,
    scaleValues: room.record.config.scaleValues,
    stage: room.record.config.stage,
  });
}
