import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { env } = getCloudflareContext();

  const room = await env.DB.prepare("SELECT id, scale_type, scale_values, stage FROM rooms WHERE id = ?")
    .bind(code.toUpperCase())
    .first<{ id: string; scale_type: string; scale_values: string; stage: string }>();

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({
    roomCode: room.id,
    scaleType: room.scale_type,
    scaleValues: JSON.parse(room.scale_values) as string[],
    stage: room.stage,
  });
}
