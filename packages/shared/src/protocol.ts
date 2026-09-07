import type { EstimationStage, ScaleType } from "./types";

// Room actions — sent from the client to the /api/rooms/[code]/action endpoint.

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

export type RoomAction = Exclude<ClientMessage, JoinMessage>;
