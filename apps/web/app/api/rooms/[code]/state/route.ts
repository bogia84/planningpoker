import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { buildSnapshot } from "@/lib/roomActions";
import { getRoom } from "@/lib/roomStore";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const url = new URL(request.url);
  const memberId = url.searchParams.get("memberId");
  if (!memberId) {
    return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  }

  const { env } = getCloudflareContext();
  const room = await getRoom(env.ROOMS_BUCKET, code.toUpperCase());
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({ state: buildSnapshot(room.record, memberId) });
}
