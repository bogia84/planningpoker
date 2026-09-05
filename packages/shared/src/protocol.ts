import type {
  EstimationStage,
  Member,
  RevealedResult,
  RoomConfig,
  RoomStateSnapshot,
  ScaleType,
  Story,
} from "./types";

// ---------- Client -> Server ----------

export interface JoinMessage {
  type: "join";
  name: string;
  avatarId: string;
  memberId?: string;
  hostToken?: string;
}

export interface SetAvatarMessage {
  type: "set_avatar";
  avatarId: string;
}

export interface HostConfigureMessage {
  type: "host_configure";
  scaleType: ScaleType;
  scaleValues: string[];
  stage: EstimationStage;
}

export interface HostAddStoryMessage {
  type: "host_add_story";
  title: string;
  description?: string;
}

export interface HostUpdateStoryMessage {
  type: "host_update_story";
  storyId: string;
  title?: string;
  description?: string;
}

export interface HostRemoveStoryMessage {
  type: "host_remove_story";
  storyId: string;
}

export interface HostReorderStoriesMessage {
  type: "host_reorder_stories";
  storyIds: string[];
}

export interface HostStartStoryMessage {
  type: "host_start_story";
  storyId: string;
}

export interface SubmitFactorScoresMessage {
  type: "submit_factor_scores";
  storyId: string;
  risk: number;
  complexity: number;
  repetition: number;
}

export interface SubmitPointMessage {
  type: "submit_point";
  storyId: string;
  value: string;
}

export interface HostRevealMessage {
  type: "host_reveal";
  storyId: string;
}

export interface HostStartRevoteMessage {
  type: "host_start_revote";
  storyId: string;
}

export interface HostFinalizeStoryMessage {
  type: "host_finalize_story";
  storyId: string;
  finalPoint: string;
}

export interface LeaveMessage {
  type: "leave";
}

export type ClientMessage =
  | JoinMessage
  | SetAvatarMessage
  | HostConfigureMessage
  | HostAddStoryMessage
  | HostUpdateStoryMessage
  | HostRemoveStoryMessage
  | HostReorderStoriesMessage
  | HostStartStoryMessage
  | SubmitFactorScoresMessage
  | SubmitPointMessage
  | HostRevealMessage
  | HostStartRevoteMessage
  | HostFinalizeStoryMessage
  | LeaveMessage;

// ---------- Server -> Client ----------

export interface RoomStateServerMessage {
  type: "room_state";
  state: RoomStateSnapshot;
}

export interface MemberJoinedMessage {
  type: "member_joined";
  member: Member;
}

export interface MemberLeftMessage {
  type: "member_left";
  memberId: string;
}

export interface MemberUpdatedMessage {
  type: "member_updated";
  member: Member;
}

export interface StoryListUpdatedMessage {
  type: "story_list_updated";
  stories: Story[];
}

export interface StoryStartedMessage {
  type: "story_started";
  storyId: string;
  phase: "factors" | "voting";
}

export interface SubmissionProgressMessage {
  type: "submission_progress";
  storyId: string;
  roundNumber: number;
  submittedFactorMemberIds: string[];
  submittedPointMemberIds: string[];
}

export interface RevealedMessage {
  type: "revealed";
  storyId: string;
  roundNumber: number;
  results: RevealedResult[];
}

export interface RevoteStartedMessage {
  type: "revote_started";
  storyId: string;
  roundNumber: number;
}

export interface StoryFinalizedMessage {
  type: "story_finalized";
  storyId: string;
  finalPoint: string;
  historyId: string;
}

export interface ErrorMessage {
  type: "error";
  code: string;
  message: string;
}

export type ServerMessage =
  | RoomStateServerMessage
  | MemberJoinedMessage
  | MemberLeftMessage
  | MemberUpdatedMessage
  | StoryListUpdatedMessage
  | StoryStartedMessage
  | SubmissionProgressMessage
  | RevealedMessage
  | RevoteStartedMessage
  | StoryFinalizedMessage
  | ErrorMessage;

export type { RoomConfig };
