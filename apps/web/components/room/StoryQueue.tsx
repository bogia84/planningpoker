"use client";

import { useState } from "react";
import type { Story } from "@planningpoker/shared";

const STATUS_LABEL: Record<Story["status"], string> = {
  pending: "PENDING",
  active: "ESTIMATING",
  finalized: "DONE",
  skipped: "SKIPPED",
};

export function StoryQueue({
  stories,
  isHost,
  activeStoryId,
  onAddStory,
  onStartStory,
}: {
  stories: Story[];
  isHost: boolean;
  activeStoryId: string | null;
  onAddStory: (title: string) => void;
  onStartStory: (storyId: string) => void;
}) {
  const [title, setTitle] = useState("");
  const sorted = [...stories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-col gap-3">
      {isHost ? (
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
      ) : null}

      <ul className="flex flex-col gap-2">
        {sorted.map((story) => (
          <li
            key={story.id}
            className={`pixel-card flex items-center justify-between gap-3 px-3 py-2 text-sm ${
              story.id === activeStoryId ? "border-(--pp-primary)" : ""
            }`}
          >
            <span className="truncate">{story.title}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-60">{STATUS_LABEL[story.status]}</span>
              {isHost && story.status === "pending" && !activeStoryId ? (
                <button type="button" className="pixel-btn" onClick={() => onStartStory(story.id)}>
                  START
                </button>
              ) : null}
            </div>
          </li>
        ))}
        {sorted.length === 0 ? <p className="text-sm opacity-60">No stories in the queue yet.</p> : null}
      </ul>
    </div>
  );
}
