export function roomWsUrl(roomCode: string): string {
  const origin = process.env.NEXT_PUBLIC_REALTIME_WS_ORIGIN ?? "ws://127.0.0.1:8787";
  return `${origin}/room/${roomCode.toUpperCase()}/ws`;
}
