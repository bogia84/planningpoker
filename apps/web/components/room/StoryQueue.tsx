"use client";

import { useState } from "react";
import type { Story } from "@planningpoker/shared";

const STATUS_LABEL: Record<Story["status"], string> = {
  pending: "PENDING",
  active: "ESTIMATING",
  finalized: "DONE",
  skipped: "SKIPPED",
};

const SCROLL_THRESHOLD = 5;

export function StoryQueue({
  stories,
  isHost,
  activeStoryId,
  onAddStory,
  onRemoveStory,
  onStartStory,
}: {
  stories: Story[];
  isHost: boolean;
  activeStoryId: string | null;
  onAddStory: (title: string) => void;
  onRemoveStory: (storyId: string) => void;
  onStartStory: (storyId: string) => void;
}) {
  const [title, setTitle] = useState("");
  const sorted = [...stories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          className="pixel-input flex-1"
          placeholder="Add a story..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && title.trim()) {
              onAddStory(title.trim());
              setTitle("");
            }
          }}
        />
        <button
          type="button"
          className="pixel-btn"
          onClick={() => {
            if (title.trim()) {
              onAddStory(title.trim());
              setTitle("");
            }
          }}
        >
          ADD
        </button>
      </div>

      <ul
        className={`flex flex-col gap-2 ${
          sorted.length > SCROLL_THRESHOLD ? "max-h-80 overflow-y-auto pr-1" : ""
        }`}
      >
        {sorted.map((story) => {
          const isFinalized = story.status === "finalized";
          return (
            <li
              key={story.id}
              className={`pixel-card flex items-center justify-between gap-3 px-3 py-2 ${
                isFinalized
                  ? "border-(--pp-success) bg-(--pp-success)/20"
                  : story.id === activeStoryId
                    ? "border-(--pp-primary)"
                    : ""
              }`}
            >
              <span className="truncate text-lg font-bold">{story.title}</span>
              <div className="flex shrink-0 items-center gap-2">
                {isFinalized && story.finalPoint !== undefined ? (
                  <span className="pixel-card bg-(--pp-success) px-2 py-0.5 text-sm font-bold text-white">
                    {story.finalPoint}
                  </span>
                ) : (
                  <span className="text-xs opacity-60">{STATUS_LABEL[story.status]}</span>
                )}
                {isHost && story.status === "pending" && !activeStoryId ? (
                  <button type="button" className="pixel-btn" onClick={() => onStartStory(story.id)}>
                    START
                  </button>
                ) : null}
                {story.id !== activeStoryId ? (
                  <button
                    type="button"
                    className="pixel-btn danger px-2 py-1 text-xs"
                    title="Remove story"
                    onClick={() => onRemoveStory(story.id)}
                  >
                    ✕
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
        {sorted.length === 0 ? <p className="text-sm opacity-60">No stories in the queue yet.</p> : null}
      </ul>
    </div>
  );
}
