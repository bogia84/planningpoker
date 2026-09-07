import type {
  EstimationStage,
  RevealedResult,
  RoomAction,
  RoomConfig,
  RoomStateSnapshot,
  ScaleType,
  SessionHistoryEntry,
  Story,
} from "@planningpoker/shared";
import type { RoomRecord } from "./roomStore";

export class ActionError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function isValidScore(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 10;
}

export function buildSnapshot(record: RoomRecord, selfMemberId: string): RoomStateSnapshot {
  return {
    roomCode: record.roomCode,
    config: record.config,
    stories: record.stories,
    members: record.members,
    activeStoryId: record.activeStoryId,
    round: record.round
      ? {
          roundNumber: record.round.roundNumber,
          phase: record.round.phase,
          submittedFactorMemberIds: Object.keys(record.round.factorScores),
          submittedPointMemberIds: Object.keys(record.round.pointVotes),
          results: record.round.results,
        }
      : null,
    history: record.history,
    selfMemberId,
  };
}

export function applyJoin(
  record: RoomRecord,
  input: { name: string; avatarId: string; memberId?: string; hostToken?: string },
): { record: RoomRecord; memberId: string } {
  const memberId = input.memberId ?? crypto.randomUUID();
  const idx = record.members.findIndex((m) => m.id === memberId);
  const members = [...record.members];

  if (idx >= 0) {
    const existing = members[idx];
    members[idx] = {
      ...existing,
      connected: true,
      name: input.name || existing.name,
      avatarId: input.avatarId || existing.avatarId,
    };
  } else {
    const isHost = Boolean(input.hostToken && record.hostToken && input.hostToken === record.hostToken);
    members.push({ id: memberId, name: input.name, avatarId: input.avatarId, isHost, connected: true });
  }

  return { record: { ...record, members }, memberId };
}

export function applyAction(record: RoomRecord, memberId: string, message: RoomAction): RoomRecord {
  const member = record.members.find((m) => m.id === memberId);
  if (!member) throw new ActionError("unknown_member", "Member not found");

  function requireHost() {
    if (!member!.isHost) throw new ActionError("forbidden", "Host-only action");
  }

  switch (message.type) {
    case "set_avatar": {
      const members = record.members.map((m) => (m.id === memberId ? { ...m, avatarId: message.avatarId } : m));
      return { ...record, members };
    }

    case "host_configure": {
      requireHost();
      const config: RoomConfig = {
        scaleType: message.scaleType as ScaleType,
        scaleValues: message.scaleValues,
        stage: message.stage as EstimationStage,
      };
      return { ...record, config };
    }

    case "host_add_story": {
      requireHost();
      const story: Story = {
        id: crypto.randomUUID(),
        title: message.title,
        description: message.description,
        sortOrder: record.stories.length,
        status: "pending",
      };
      return { ...record, stories: [...record.stories, story] };
    }

    case "host_update_story": {
      requireHost();
      const stories = record.stories.map((s) =>
        s.id === message.storyId
          ? { ...s, title: message.title ?? s.title, description: message.description ?? s.description }
          : s,
      );
      return { ...record, stories };
    }

    case "host_remove_story": {
      requireHost();
      return { ...record, stories: record.stories.filter((s) => s.id !== message.storyId) };
    }

    case "host_reorder_stories": {
      requireHost();
      const byId = new Map(record.stories.map((s) => [s.id, s]));
      const stories = message.storyIds
        .map((id, index) => {
          const story = byId.get(id);
          return story ? { ...story, sortOrder: index } : null;
        })
        .filter((s): s is Story => Boolean(s));
      return { ...record, stories };
    }

    case "host_start_story": {
      requireHost();
      const story = record.stories.find((s) => s.id === message.storyId);
      if (!story) throw new ActionError("not_found", "Story not found");
      const stories = record.stories.map((s) => (s.id === story.id ? { ...s, status: "active" as const } : s));
      return {
        ...record,
        stories,
        activeStoryId: story.id,
        round: { roundNumber: 1, phase: "factors", factorScores: {}, pointVotes: {}, results: null },
      };
    }

    case "submit_factor_scores": {
      if (!record.round || record.activeStoryId !== message.storyId || record.round.phase !== "factors") {
        return record;
      }
      if (!isValidScore(message.risk) || !isValidScore(message.complexity) || !isValidScore(message.repetition)) {
        throw new ActionError("invalid_score", "Scores must be integers 1-10");
      }
      const factorScores = {
        ...record.round.factorScores,
        [memberId]: { risk: message.risk, complexity: message.complexity, repetition: message.repetition },
      };
      return { ...record, round: { ...record.round, factorScores } };
    }

    case "submit_point": {
      if (!record.round || record.activeStoryId !== message.storyId || record.round.phase !== "factors") {
        return record;
      }
      if (!record.config.scaleValues.includes(message.value)) {
        throw new ActionError("invalid_point", "Point not in room scale");
      }
      const pointVotes = { ...record.round.pointVotes, [memberId]: message.value };
      return { ...record, round: { ...record.round, pointVotes } };
    }

    case "host_reveal": {
      requireHost();
      if (!record.round || record.activeStoryId !== message.storyId || record.round.phase !== "factors") {
        return record;
      }
      const results: RevealedResult[] = [];
      for (const [mid, point] of Object.entries(record.round.pointVotes)) {
        const factors = record.round.factorScores[mid];
        if (!factors) continue;
        results.push({ memberId: mid, point, ...factors });
      }
      return { ...record, round: { ...record.round, phase: "revealed", results } };
    }

    case "host_start_revote": {
      requireHost();
      if (!record.round || record.activeStoryId !== message.storyId || record.round.phase !== "revealed") {
        return record;
      }
      return {
        ...record,
        round: { roundNumber: record.round.roundNumber + 1, phase: "factors", factorScores: {}, pointVotes: {}, results: null },
      };
    }

    case "host_finalize_story": {
      requireHost();
      if (
        !record.round ||
        record.activeStoryId !== message.storyId ||
        record.round.phase !== "revealed" ||
        !record.round.results
      ) {
        return record;
      }
      const story = record.stories.find((s) => s.id === message.storyId);
      if (!story) return record;

      const results = record.round.results;
      const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / (values.length || 1);

      const entry: SessionHistoryEntry = {
        id: crypto.randomUUID(),
        storyId: story.id,
        storyTitle: story.title,
        stage: record.config.stage,
        finalPoint: message.finalPoint,
        avgRisk: avg(results.map((r) => r.risk)),
        avgComplexity: avg(results.map((r) => r.complexity)),
        avgRepetition: avg(results.map((r) => r.repetition)),
        roundCount: record.round.roundNumber,
        memberVotes: results,
        finalizedAt: Math.floor(Date.now() / 1000),
      };

      const stories = record.stories.map((s) => (s.id === story.id ? { ...s, status: "finalized" as const } : s));
      return { ...record, stories, activeStoryId: null, round: null, history: [...record.history, entry] };
    }

    case "leave": {
      const members = record.members.map((m) => (m.id === memberId ? { ...m, connected: false } : m));
      return { ...record, members };
    }

    default:
      return record;
  }
}
