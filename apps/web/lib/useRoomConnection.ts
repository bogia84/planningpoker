"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientMessage, RoomStateSnapshot } from "@planningpoker/shared";
import { BASE_PATH } from "./basePath";

export type ConnectionStatus = "connecting" | "open" | "closed";

export interface JoinInfo {
  name: string;
  avatarId: string;
  memberId?: string;
  hostToken?: string;
}

const POLL_INTERVAL_MS = 1500;
const POLL_INTERVAL_HIDDEN_MS = 6000;
const JOIN_RETRY_MS = 3000;

export function useRoomConnection(roomCode: string, joinInfo: JoinInfo | null) {
  const [state, setState] = useState<RoomStateSnapshot | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [lastError, setLastError] = useState<string | null>(null);
  const memberIdRef = useRef<string | null>(null);

  const send = useCallback(
    (message: ClientMessage) => {
      if (message.type === "join") return;
      const memberId = memberIdRef.current;
      if (!memberId) return;
      fetch(`${BASE_PATH}/api/rooms/${roomCode}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, action: message }),
      })
        .then(async (res) => {
          const body = (await res.json()) as { state?: RoomStateSnapshot; message?: string };
          if (!res.ok) {
            setLastError(body.message ?? "Action failed");
            return;
          }
          if (body.state) setState(body.state);
        })
        .catch(() => setLastError("Network error — please retry"));
    },
    [roomCode],
  );

  useEffect(() => {
    if (!joinInfo) return;

    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    function scheduleNextPoll() {
      const delay = document.visibilityState === "hidden" ? POLL_INTERVAL_HIDDEN_MS : POLL_INTERVAL_MS;
      pollTimer = setTimeout(poll, delay);
    }

    async function poll() {
      if (cancelled) return;
      const memberId = memberIdRef.current;
      if (!memberId) return;
      try {
        const res = await fetch(
          `${BASE_PATH}/api/rooms/${roomCode}/state?memberId=${encodeURIComponent(memberId)}`,
        );
        if (!res.ok) throw new Error("poll failed");
        const body = (await res.json()) as { state: RoomStateSnapshot };
        if (cancelled) return;
        setState(body.state);
        setStatus("open");
      } catch {
        if (!cancelled) setStatus("closed");
      } finally {
        if (!cancelled) scheduleNextPoll();
      }
    }

    async function join() {
      if (cancelled) return;
      setStatus("connecting");
      try {
        const res = await fetch(`${BASE_PATH}/api/rooms/${roomCode}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(joinInfo),
        });
        if (!res.ok) throw new Error("join failed");
        const body = (await res.json()) as { state: RoomStateSnapshot };
        if (cancelled) return;
        memberIdRef.current = body.state.selfMemberId;
        setState(body.state);
        setStatus("open");
        scheduleNextPoll();
      } catch {
        if (cancelled) return;
        setStatus("closed");
        pollTimer = setTimeout(join, JOIN_RETRY_MS);
      }
    }

    function handleUnload() {
      const memberId = memberIdRef.current;
      if (!memberId || typeof navigator.sendBeacon !== "function") return;
      const payload = JSON.stringify({ memberId, action: { type: "leave" } });
      navigator.sendBeacon(
        `${BASE_PATH}/api/rooms/${roomCode}/action`,
        new Blob([payload], { type: "application/json" }),
      );
    }

    join();
    window.addEventListener("pagehide", handleUnload);

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
      window.removeEventListener("pagehide", handleUnload);
    };
    // Reconnect only when the room or the joining identity actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, joinInfo?.memberId, joinInfo?.name, joinInfo?.avatarId, joinInfo?.hostToken]);

  return { state, status, send, lastError };
}
