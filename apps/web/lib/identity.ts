export interface RoomIdentity {
  memberId: string;
  name: string;
  avatarId: string;
}

function identityKey(roomCode: string) {
  return `pp:member:${roomCode.toUpperCase()}`;
}

function hostTokenKey(roomCode: string) {
  return `pp:host:${roomCode.toUpperCase()}`;
}

export function loadIdentity(roomCode: string): RoomIdentity | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(identityKey(roomCode));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RoomIdentity;
  } catch {
    return null;
  }
}

export function saveIdentity(roomCode: string, identity: RoomIdentity) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(identityKey(roomCode), JSON.stringify(identity));
}

export function loadHostToken(roomCode: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(hostTokenKey(roomCode));
}

export function saveHostToken(roomCode: string, token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(hostTokenKey(roomCode), token);
}
