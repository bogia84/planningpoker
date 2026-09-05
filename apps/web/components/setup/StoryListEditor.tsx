"use client";

import { useState } from "react";

export interface DraftStory {
  id: string;
  title: string;
}

export function StoryListEditor({
  stories,
  onChange,
}: {
  stories: DraftStory[];
  onChange: (stories: DraftStory[]) => void;
}) {
  const [title, setTitle] = useState("");

  function addStory() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onChange([...stories, { id: crypto.randomUUID(), title: trimmed }]);
    setTitle("");
  }

  function removeStory(id: string) {
    onChange(stories.filter((s) => s.id !== id));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          className="pixel-input flex-1"
          placeholder="Story title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addStory();
            }
          }}
        />
        <button type="button" className="pixel-btn" onClick={addStory}>
          ADD
        </button>
      </div>

      {stories.length === 0 ? (
        <p className="text-sm opacity-60">No stories yet — you can also add them from the room later.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {stories.map((story, index) => (
            <li key={story.id} className="pixel-card flex items-center justify-between gap-2 px-3 py-2 text-sm">
              <span>
                {index + 1}. {story.title}
              </span>
              <button
                type="button"
                className="opacity-60 hover:opacity-100"
                onClick={() => removeStory(story.id)}
                aria-label="Remove story"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
