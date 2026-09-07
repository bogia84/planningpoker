import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { applyJoin, buildSnapshot } from "@/lib/roomActions";
import { mutateRoom } from "@/lib/roomStore";

interface JoinBody {
  name: string;
  avatarId: string;
  memberId?: string;
  hostToken?: string;
}

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = (await request.json()) as JoinBody;
  const { env } = getCloudflareContext();

  try {
    const { record, extra: memberId } = await mutateRoom<string>(env.ROOMS_BUCKET, code.toUpperCase(), (r) => {
      const { record: next, memberId } = applyJoin(r, body);
      return { record: next, extra: memberId };
    });
    return NextResponse.json({ state: buildSnapshot(record, memberId) });
  } catch (err) {
    if (err instanceof Error && err.message === "Room not found") {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    throw err;
  }
}
