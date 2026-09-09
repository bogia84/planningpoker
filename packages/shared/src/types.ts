export type ScaleType = "tshirt" | "fibonacci" | "modified_fibonacci" | "custom";

export type EstimationStage = "rough" | "sprint";

// Fun break cards included by default on every preset scale: coffee (cafe break),
// pizza (food break), and banana (going bananas / too big to size).
export const SPECIAL_CARDS = ["☕", "🍕", "🍌"];

export const SCALE_PRESETS: Record<Exclude<ScaleType, "custom">, string[]> = {
  tshirt: ["XS", "S", "M", "L", "XL", "XXL", ...SPECIAL_CARDS],
  fibonacci: ["0", "1", "2", "3", "5", "8", "13", "21", "34", ...SPECIAL_CARDS],
  modified_fibonacci: ["0", "0.5", "1", "2", "3", "5", "8", "13", "20", "40", "100", ...SPECIAL_CARDS],
};

export interface RoomConfig {
  scaleType: ScaleType;
  scaleValues: string[];
  stage: EstimationStage;
}

export type StoryStatus = "pending" | "active" | "finalized" | "skipped";

export interface Story {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  status: StoryStatus;
  finalPoint?: string;
}

export interface Member {
  id: string;
  name: string;
  avatarId: string;
  isHost: boolean;
  connected: boolean;
}

export interface FactorScores {
  risk: number; // 1-10
  complexity: number; // 1-10
  repetition: number; // 1-10
}

export type RoundPhase = "factors" | "voting" | "revealed";

export interface RevealedResult {
  memberId: string;
  point: string;
  risk: number;
  complexity: number;
  repetition: number;
}

export interface SessionHistoryEntry {
  id: string;
  storyId: string;
  storyTitle: string;
  stage: EstimationStage;
  finalPoint: string;
  avgRisk: number;
  avgComplexity: number;
  avgRepetition: number;
  roundCount: number;
  memberVotes: RevealedResult[];
  finalizedAt: number;
}

export interface RoomStateSnapshot {
  roomCode: string;
  config: RoomConfig;
  stories: Story[];
  members: Member[];
  activeStoryId: string | null;
  round: {
    roundNumber: number;
    phase: RoundPhase;
    submittedFactorMemberIds: string[];
    submittedPointMemberIds: string[];
    results: RevealedResult[] | null;
  } | null;
  history: SessionHistoryEntry[];
  selfMemberId: string;
}
