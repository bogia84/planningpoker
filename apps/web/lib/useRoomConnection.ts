"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientMessage, RoomStateSnapshot, ServerMessage } from "@planningpoker/shared";
import { roomWsUrl } from "./wsUrl";

export type ConnectionStatus = "connecting" | "open" | "closed";

export interface JoinInfo {
  name: string;
  avatarId: string;
  memberId?: string;
  hostToken?: string;
}

export function useRoomConnection(roomCode: string, joinInfo: JoinInfo | null) {
  const [state, setState] = useState<RoomStateSnapshot | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [lastError, setLastError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const joinInfoRef = useRef(joinInfo);
  useEffect(() => {
    joinInfoRef.current = joinInfo;
  }, [joinInfo]);

  const send = useCallback((message: ClientMessage) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    if (!joinInfo) return;

    let cancelled = false;
    let closedByUs = false;
    let retryAttempt = 0;
    let socket: WebSocket | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    function applyServerMessage(message: ServerMessage) {
      switch (message.type) {
        case "room_state":
          setState(message.state);
          break;
        case "member_joined":
          setState((prev) => {
            if (!prev) return prev;
            const exists = prev.members.some((m) => m.id === message.member.id);
            const members = exists
              ? prev.members.map((m) => (m.id === message.member.id ? message.member : m))
              : [...prev.members, message.member];
            return { ...prev, members };
          });
          break;
        case "member_left":
          setState((prev) =>
            prev
              ? {
                  ...prev,
                  members: prev.members.map((m) =>
                    m.id === message.memberId ? { ...m, connected: false } : m,
                  ),
                }
              : prev,
          );
          break;
        case "member_updated":
          setState((prev) =>
            prev
              ? { ...prev, members: prev.members.map((m) => (m.id === message.member.id ? message.member : m)) }
              : prev,
          );
          break;
        case "story_list_updated":
          setState((prev) => (prev ? { ...prev, stories: message.stories } : prev));
          break;
        case "story_started":
          setState((prev) =>
            prev
              ? {
                  ...prev,
                  activeStoryId: message.storyId,
                  round: {
                    roundNumber: 1,
                    phase: message.phase,
                    submittedFactorMemberIds: [],
                    submittedPointMemberIds: [],
                    results: null,
                  },
                }
              : prev,
          );
          break;
        case "submission_progress":
          setState((prev) =>
            prev && prev.round
              ? {
                  ...prev,
                  round: {
                    ...prev.round,
                    roundNumber: message.roundNumber,
                    submittedFactorMemberIds: message.submittedFactorMemberIds,
                    submittedPointMemberIds: message.submittedPointMemberIds,
                  },
                }
              : prev,
          );
          break;
        case "revealed":
          setState((prev) =>
            prev
              ? {
                  ...prev,
                  round: {
                    roundNumber: message.roundNumber,
                    phase: "revealed",
                    submittedFactorMemberIds: prev.round?.submittedFactorMemberIds ?? [],
                    submittedPointMemberIds: prev.round?.submittedPointMemberIds ?? [],
                    results: message.results,
                  },
                }
              : prev,
          );
          break;
        case "revote_started":
          setState((prev) =>
            prev
              ? {
                  ...prev,
                  round: {
                    roundNumber: message.roundNumber,
                    phase: "factors",
                    submittedFactorMemberIds: [],
                    submittedPointMemberIds: [],
                    results: null,
                  },
                }
              : prev,
          );
          break;
        case "story_finalized":
          setState((prev) =>
            prev
              ? {
                  ...prev,
                  activeStoryId: prev.activeStoryId === message.storyId ? null : prev.activeStoryId,
                  round: prev.activeStoryId === message.storyId ? null : prev.round,
                  stories: prev.stories.map((s) =>
                    s.id === message.storyId ? { ...s, status: "finalized" } : s,
                  ),
                }
              : prev,
          );
          break;
        case "error":
          setLastError(message.message);
          break;
      }
    }

    function connect() {
      if (cancelled) return;
      setStatus("connecting");
      socket = new WebSocket(roomWsUrl(roomCode));
      wsRef.current = socket;

      socket.addEventListener("open", () => {
        retryAttempt = 0;
        setStatus("open");
        const info = joinInfoRef.current;
        if (!info) return;
        send({
          type: "join",
          name: info.name,
          avatarId: info.avatarId,
          memberId: info.memberId,
          hostToken: info.hostToken,
        });
      });

      socket.addEventListener("message", (event) => {
        try {
          applyServerMessage(JSON.parse(event.data));
        } catch {
          // ignore malformed frames
        }
      });

      socket.addEventListener("close", () => {
        setStatus("closed");
        if (closedByUs || cancelled) return;
        const delay = Math.min(1000 * 2 ** retryAttempt, 10000);
        retryAttempt += 1;
        retryTimeout = setTimeout(connect, delay);
      });

      socket.addEventListener("error", () => {
        socket?.close();
      });
    }

    connect();

    return () => {
      cancelled = true;
      closedByUs = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      socket?.close();
    };
    // Reconnect only when the room or the joining identity actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, joinInfo?.memberId, joinInfo?.name, joinInfo?.avatarId, joinInfo?.hostToken, send]);

  return { state, status, send, lastError };
}
