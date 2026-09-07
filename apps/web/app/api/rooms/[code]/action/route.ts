import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { RoomAction } from "@planningpoker/shared";
import { ActionError, applyAction, buildSnapshot } from "@/lib/roomActions";
import { mutateRoom, RoomConflictError } from "@/lib/roomStore";

interface ActionBody {
  memberId: string;
  action: RoomAction;
}

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = (await request.json()) as ActionBody;
  const { env } = getCloudflareContext();

  try {
    const { record } = await mutateRoom(env.ROOMS_BUCKET, code.toUpperCase(), (r) => ({
      record: applyAction(r, body.memberId, body.action),
    }));
    return NextResponse.json({ state: buildSnapshot(record, body.memberId) });
  } catch (err) {
    if (err instanceof ActionError) {
      const status = err.code === "forbidden" ? 403 : err.code === "unknown_member" ? 404 : 400;
      return NextResponse.json({ code: err.code, message: err.message }, { status });
    }
    if (err instanceof RoomConflictError) {
      return NextResponse.json({ code: "conflict", message: err.message }, { status: 409 });
    }
    if (err instanceof Error && err.message === "Room not found") {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    throw err;
  }
}
