export type ScaleType = "tshirt" | "fibonacci" | "modified_fibonacci" | "custom";

export type EstimationStage = "rough" | "sprint";

export const SCALE_PRESETS: Record<Exclude<ScaleType, "custom">, string[]> = {
  tshirt: ["XS", "S", "M", "L", "XL", "XXL"],
  fibonacci: ["0", "1", "2", "3", "5", "8", "13", "21", "34"],
  modified_fibonacci: ["0", "0.5", "1", "2", "3", "5", "8", "13", "20", "40", "100"],
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
  selfMemberId: string;
}

export interface StoryHistoryEntry {
  id: string;
  storyId: string;
  roomId: string;
  storyTitle: string;
  stage: EstimationStage;
  finalPoint: string;
  avgRisk: number;
  avgComplexity: number;
  avgRepetition: number;
  roundCount: number;
  finalizedAt: number;
}
