import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SCALE_PRESETS, type EstimationStage, type ScaleType } from "@planningpoker/shared";
import { generateRoomCode } from "@/lib/roomCode";

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

  let roomCode = "";
  let attempts = 0;
  while (attempts < 5) {
    const candidate = generateRoomCode();
    try {
      await env.DB.prepare(
        "INSERT INTO rooms (id, host_token, scale_type, scale_values, stage) VALUES (?, ?, ?, ?, ?)",
      )
        .bind(candidate, hostToken, body.scaleType, JSON.stringify(scaleValues), body.stage)
        .run();
      roomCode = candidate;
      break;
    } catch (err) {
      attempts += 1;
      if (attempts >= 5) throw err;
    }
  }

  const stories = body.stories ?? [];
  if (stories.length > 0) {
    const statements = stories.map((story, index) =>
      env.DB.prepare(
        "INSERT INTO stories (id, room_id, title, description, sort_order, status) VALUES (?, ?, ?, ?, ?, 'pending')",
      ).bind(crypto.randomUUID(), roomCode, story.title, story.description ?? null, index),
    );
    await env.DB.batch(statements);
  }

  return NextResponse.json({ roomCode, hostToken });
}
