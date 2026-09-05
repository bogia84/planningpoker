export { RoomDurableObject } from "./room-do";

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    // Expected path: /room/:code/ws
    const match = url.pathname.match(/^\/room\/([A-Za-z0-9]+)\/ws\/?$/);
    if (!match) {
      return new Response("Not found", { status: 404, headers: corsHeaders() });
    }

    const roomCode = match[1].toUpperCase();

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket upgrade", {
        status: 426,
        headers: corsHeaders(),
      });
    }

    const id = env.ROOM_DO.idFromName(roomCode);
    const stub = env.ROOM_DO.get(id);
    return stub.fetch(request);
  },
};
