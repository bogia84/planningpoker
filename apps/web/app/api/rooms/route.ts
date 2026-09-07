import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SCALE_PRESETS, type EstimationStage, type ScaleType } from "@planningpoker/shared";
import { generateRoomCode } from "@/lib/roomCode";
import { createRoom, type RoomRecord } from "@/lib/roomStore";

interface CreateRoomBody {
  scaleType: ScaleType;
  scaleValues?: string[];
  stage: EstimationStage;
  stories?: { title: string; description?: string }[];
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateRoomBody;

  if (!body.scaleType || !body.stage) {
    return NextResponse.json({ error: "scaleType and stage are required" }, { status: 400 });
  }

  const scaleValues =
    body.scaleType === "custom"
      ? (body.scaleValues ?? []).map((v) => v.trim()).filter(Boolean)
      : SCALE_PRESETS[body.scaleType];

  if (!scaleValues || scaleValues.length === 0) {
    return NextResponse.json({ error: "scaleValues must not be empty" }, { status: 400 });
  }

  const { env } = getCloudflareContext();
  const hostToken = crypto.randomUUID();
  const now = Date.now();

  const stories = (body.stories ?? []).map((story, index) => ({
    id: crypto.randomUUID(),
    title: story.title,
    description: story.description,
    sortOrder: index,
    status: "pending" as const,
  }));

  let roomCode = "";
  for (let attempts = 0; attempts < 5 && !roomCode; attempts++) {
    const candidate = generateRoomCode();
    const record: RoomRecord = {
      roomCode: candidate,
      hostToken,
      config: { scaleType: body.scaleType, scaleValues, stage: body.stage },
      stories,
      members: [],
      activeStoryId: null,
      round: null,
      history: [],
      createdAt: now,
      updatedAt: now,
    };
    if (await createRoom(env.ROOMS_BUCKET, record)) {
      roomCode = candidate;
    }
  }

  if (!roomCode) {
    return NextResponse.json({ error: "Could not allocate a room code, please retry" }, { status: 500 });
  }

  return NextResponse.json({ roomCode, hostToken });
}
