import { DurableObject } from "cloudflare:workers";
import type {
  ClientMessage,
  EstimationStage,
  FactorScores,
  Member,
  RevealedResult,
  RoomConfig,
  RoomStateSnapshot,
  ScaleType,
  ServerMessage,
  Story,
} from "@planningpoker/shared";
import { finalizeStoryInD1, loadRoomFromD1, saveStoriesToD1, updateRoomConfigInD1 } from "./db";

interface RoundState {
  roundNumber: number;
  phase: "factors" | "revealed";
  factorScores: Map<string, FactorScores>;
  pointVotes: Map<string, string>;
  results: RevealedResult[] | null;
}

interface StoredSnapshot {
  roomCode: string;
  config: RoomConfig | null;
  hostToken: string | null;
  stories: Story[];
  members: Member[];
  activeStoryId: string | null;
  round: {
    roundNumber: number;
    phase: "factors" | "revealed";
    factorScores: [string, FactorScores][];
    pointVotes: [string, string][];
    results: RevealedResult[] | null;
  } | null;
}

const STORAGE_KEY = "snapshot";

function isValidScore(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 10;
}

export class RoomDurableObject extends DurableObject<Env> {
  private roomCode: string | null = null;
  private config: RoomConfig | null = null;
  private hostToken: string | null = null;
  private stories: Story[] = [];
  private members: Map<string, Member> = new Map();
  private activeStoryId: string | null = null;
  private round: RoundState | null = null;
  private hydrated = false;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  private async hydrate(roomCodeFromUrl: string) {
    if (this.hydrated) return;

    const stored = await this.ctx.storage.get<StoredSnapshot>(STORAGE_KEY);
    if (stored) {
      this.roomCode = stored.roomCode;
      this.config = stored.config;
      this.hostToken = stored.hostToken;
      this.stories = stored.stories;
      this.members = new Map(stored.members.map((m) => [m.id, m]));
      this.activeStoryId = stored.activeStoryId;
      this.round = stored.round
        ? {
            roundNumber: stored.round.roundNumber,
            phase: stored.round.phase,
            factorScores: new Map(stored.round.factorScores),
            pointVotes: new Map(stored.round.pointVotes),
            results: stored.round.results,
          }
        : null;
      this.hydrated = true;
      return;
    }

    this.roomCode = roomCodeFromUrl;
    const loaded = await loadRoomFromD1(this.env.DB, roomCodeFromUrl);
    if (loaded) {
      this.config = loaded.config;
      this.hostToken = loaded.hostToken;
      this.stories = loaded.stories;
    }
    this.hydrated = true;
    await this.persist();
  }

  private async persist() {
    const snapshot: StoredSnapshot = {
      roomCode: this.roomCode!,
      config: this.config,
      hostToken: this.hostToken,
      stories: this.stories,
      members: [...this.members.values()],
      activeStoryId: this.activeStoryId,
      round: this.round
        ? {
            roundNumber: this.round.roundNumber,
            phase: this.round.phase,
            factorScores: [...this.round.factorScores.entries()],
            pointVotes: [...this.round.pointVotes.entries()],
            results: this.round.results,
          }
        : null,
    };
    await this.ctx.storage.put(STORAGE_KEY, snapshot);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/room\/([A-Za-z0-9]+)\/ws\/?$/);
    const roomCode = match ? match[1].toUpperCase() : null;
    if (!roomCode) {
      return new Response("Not found", { status: 404 });
    }

    await this.hydrate(roomCode);

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    this.ctx.acceptWebSocket(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  private memberIdForSocket(ws: WebSocket): string | null {
    const attachment = ws.deserializeAttachment() as { memberId?: string } | null;
    return attachment?.memberId ?? null;
  }

  private send(ws: WebSocket, message: ServerMessage) {
    try {
      ws.send(JSON.stringify(message));
    } catch {
      // socket likely closed; ignore
    }
  }

  private broadcast(message: ServerMessage, exceptMemberId?: string) {
    const payload = JSON.stringify(message);
    for (const ws of this.ctx.getWebSockets()) {
      const memberId = this.memberIdForSocket(ws);
      if (exceptMemberId && memberId === exceptMemberId) continue;
      try {
        ws.send(payload);
      } catch {
        // ignore closed sockets
      }
    }
  }

  private buildStateSnapshot(selfMemberId: string): RoomStateSnapshot {
    return {
      roomCode: this.roomCode!,
      config: this.config ?? { scaleType: "fibonacci", scaleValues: [], stage: "rough" },
      stories: this.stories,
      members: [...this.members.values()],
      activeStoryId: this.activeStoryId,
      round: this.round
        ? {
            roundNumber: this.round.roundNumber,
            phase: this.round.phase,
            submittedFactorMemberIds: [...this.round.factorScores.keys()],
            submittedPointMemberIds: [...this.round.pointVotes.keys()],
            results: this.round.results,
          }
        : null,
      selfMemberId,
    };
  }

  private broadcastSubmissionProgress() {
    if (!this.activeStoryId || !this.round) return;
    this.broadcast({
      type: "submission_progress",
      storyId: this.activeStoryId,
      roundNumber: this.round.roundNumber,
      submittedFactorMemberIds: [...this.round.factorScores.keys()],
      submittedPointMemberIds: [...this.round.pointVotes.keys()],
    });
  }

  async webSocketMessage(ws: WebSocket, messageData: string | ArrayBuffer) {
    if (typeof messageData !== "string") return;

    let message: ClientMessage;
    try {
      message = JSON.parse(messageData);
    } catch {
      this.send(ws, { type: "error", code: "bad_json", message: "Invalid message" });
      return;
    }

    if (message.type === "join") {
      await this.handleJoin(ws, message);
      return;
    }

    const memberId = this.memberIdForSocket(ws);
    if (!memberId) {
      this.send(ws, { type: "error", code: "not_joined", message: "Send join first" });
      return;
    }

    const member = this.members.get(memberId);
    if (!member) {
      this.send(ws, { type: "error", code: "unknown_member", message: "Member not found" });
      return;
    }

    switch (message.type) {
      case "set_avatar":
        member.avatarId = message.avatarId;
        await this.persist();
        this.broadcast({ type: "member_updated", member });
        break;

      case "host_configure":
        if (!member.isHost) return this.sendForbidden(ws);
        this.config = {
          scaleType: message.scaleType as ScaleType,
          scaleValues: message.scaleValues,
          stage: message.stage as EstimationStage,
        };
        await updateRoomConfigInD1(this.env.DB, this.roomCode!, this.config);
        await this.persist();
        this.broadcast({ type: "room_state", state: this.buildStateSnapshot(memberId) });
        break;

      case "host_add_story":
        if (!member.isHost) return this.sendForbidden(ws);
        this.stories.push({
          id: crypto.randomUUID(),
          title: message.title,
          description: message.description,
          sortOrder: this.stories.length,
          status: "pending",
        });
        await this.persistStories();
        break;

      case "host_update_story":
        if (!member.isHost) return this.sendForbidden(ws);
        {
          const story = this.stories.find((s) => s.id === message.storyId);
          if (story) {
            if (message.title !== undefined) story.title = message.title;
            if (message.description !== undefined) story.description = message.description;
          }
        }
        await this.persistStories();
        break;

      case "host_remove_story":
        if (!member.isHost) return this.sendForbidden(ws);
        this.stories = this.stories.filter((s) => s.id !== message.storyId);
        await this.persistStories();
        break;

      case "host_reorder_stories":
        if (!member.isHost) return this.sendForbidden(ws);
        {
          const byId = new Map(this.stories.map((s) => [s.id, s]));
          this.stories = message.storyIds
            .map((id, index) => {
              const story = byId.get(id);
              if (story) story.sortOrder = index;
              return story;
            })
            .filter((s): s is Story => Boolean(s));
        }
        await this.persistStories();
        break;

      case "host_start_story":
        if (!member.isHost) return this.sendForbidden(ws);
        {
          const story = this.stories.find((s) => s.id === message.storyId);
          if (!story) return;
          story.status = "active";
          this.activeStoryId = story.id;
          this.round = {
            roundNumber: 1,
            phase: "factors",
            factorScores: new Map(),
            pointVotes: new Map(),
            results: null,
          };
        }
        await this.persist();
        this.broadcast({ type: "story_list_updated", stories: this.stories });
        this.broadcast({ type: "story_started", storyId: this.activeStoryId!, phase: "factors" });
        break;

      case "submit_factor_scores":
        if (!this.round || this.activeStoryId !== message.storyId || this.round.phase !== "factors") return;
        if (!isValidScore(message.risk) || !isValidScore(message.complexity) || !isValidScore(message.repetition)) {
          this.send(ws, { type: "error", code: "invalid_score", message: "Scores must be integers 1-10" });
          return;
        }
        this.round.factorScores.set(memberId, {
          risk: message.risk,
          complexity: message.complexity,
          repetition: message.repetition,
        });
        await this.persist();
        this.broadcastSubmissionProgress();
        break;

      case "submit_point":
        if (!this.round || this.activeStoryId !== message.storyId || this.round.phase !== "factors") return;
        if (!this.config?.scaleValues.includes(message.value)) {
          this.send(ws, { type: "error", code: "invalid_point", message: "Point not in room scale" });
          return;
        }
        this.round.pointVotes.set(memberId, message.value);
        await this.persist();
        this.broadcastSubmissionProgress();
        break;

      case "host_reveal":
        if (!member.isHost) return this.sendForbidden(ws);
        if (!this.round || this.activeStoryId !== message.storyId || this.round.phase !== "factors") return;
        {
          const results: RevealedResult[] = [];
          for (const [mid, point] of this.round.pointVotes.entries()) {
            const factors = this.round.factorScores.get(mid);
            if (!factors) continue;
            results.push({ memberId: mid, point, ...factors });
          }
          this.round.phase = "revealed";
          this.round.results = results;
        }
        await this.persist();
        this.broadcast({
          type: "revealed",
          storyId: this.activeStoryId!,
          roundNumber: this.round.roundNumber,
          results: this.round.results!,
        });
        break;

      case "host_start_revote":
        if (!member.isHost) return this.sendForbidden(ws);
        if (!this.round || this.activeStoryId !== message.storyId || this.round.phase !== "revealed") return;
        this.round = {
          roundNumber: this.round.roundNumber + 1,
          phase: "factors",
          factorScores: new Map(),
          pointVotes: new Map(),
          results: null,
        };
        await this.persist();
        this.broadcast({
          type: "revote_started",
          storyId: this.activeStoryId!,
          roundNumber: this.round.roundNumber,
        });
        break;

      case "host_finalize_story":
        if (!member.isHost) return this.sendForbidden(ws);
        if (!this.round || this.activeStoryId !== message.storyId || this.round.phase !== "revealed") return;
        await this.finalizeStory(message.storyId, message.finalPoint);
        break;

      case "leave":
        member.connected = false;
        await this.persist();
        this.broadcast({ type: "member_left", memberId });
        break;
    }
  }

  private async persistStories() {
    await this.persist();
    await saveStoriesToD1(this.env.DB, this.roomCode!, this.stories);
    this.broadcast({ type: "story_list_updated", stories: this.stories });
  }

  private sendForbidden(ws: WebSocket) {
    this.send(ws, { type: "error", code: "forbidden", message: "Host-only action" });
  }

  private async finalizeStory(storyId: string, finalPoint: string) {
    const story = this.stories.find((s) => s.id === storyId);
    if (!story || !this.round || !this.round.results) return;

    const results = this.round.results;
    const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / (values.length || 1);

    const historyId = await finalizeStoryInD1(this.env.DB, {
      storyId,
      roomId: this.roomCode!,
      storyTitle: story.title,
      stage: this.config?.stage ?? "rough",
      finalPoint,
      avgRisk: avg(results.map((r) => r.risk)),
      avgComplexity: avg(results.map((r) => r.complexity)),
      avgRepetition: avg(results.map((r) => r.repetition)),
      roundCount: this.round.roundNumber,
      memberVotesJson: JSON.stringify(results),
    });

    story.status = "finalized";
    this.activeStoryId = null;
    this.round = null;
    await this.persist();

    this.broadcast({ type: "story_finalized", storyId, finalPoint, historyId });
    this.broadcast({ type: "story_list_updated", stories: this.stories });
  }

  private async handleJoin(
    ws: WebSocket,
    message: Extract<ClientMessage, { type: "join" }>,
  ) {
    const memberId = message.memberId ?? crypto.randomUUID();
    let member = this.members.get(memberId);

    if (member) {
      member.connected = true;
      member.name = message.name || member.name;
      member.avatarId = message.avatarId || member.avatarId;
    } else {
      const isHost = Boolean(message.hostToken && this.hostToken && message.hostToken === this.hostToken);
      member = {
        id: memberId,
        name: message.name,
        avatarId: message.avatarId,
        isHost,
        connected: true,
      };
      this.members.set(memberId, member);
    }

    ws.serializeAttachment({ memberId });
    await this.persist();

    this.send(ws, { type: "room_state", state: this.buildStateSnapshot(memberId) });
    this.broadcast({ type: "member_joined", member }, memberId);
  }

  async webSocketClose(ws: WebSocket) {
    const memberId = this.memberIdForSocket(ws);
    if (!memberId) return;
    const member = this.members.get(memberId);
    if (!member) return;

    // A member may have other open sockets (e.g. duplicate tabs); only mark
    // disconnected if this was their last open connection.
    const stillConnected = this.ctx
      .getWebSockets()
      .some((other) => other !== ws && this.memberIdForSocket(other) === memberId);

    if (!stillConnected) {
      member.connected = false;
      await this.persist();
      this.broadcast({ type: "member_left", memberId });
    }
  }

  async webSocketError() {
    // Hibernatable WebSocket errors are followed by a close event; nothing extra to do.
  }
}
