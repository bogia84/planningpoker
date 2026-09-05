"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EstimationStage, ScaleType } from "@planningpoker/shared";
import { AvatarPicker } from "@/components/avatar/AvatarPicker";
import { ScaleConfigForm } from "@/components/setup/ScaleConfigForm";
import { StoryListEditor, type DraftStory } from "@/components/setup/StoryListEditor";
import { DEFAULT_AVATAR_ID } from "@/lib/avatars";
import { saveHostToken, saveIdentity } from "@/lib/identity";

export default function CreateRoomPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [scaleType, setScaleType] = useState<ScaleType>("modified_fibonacci");
  const [customValues, setCustomValues] = useState("");
  const [stage, setStage] = useState<EstimationStage>("rough");
  const [stories, setStories] = useState<DraftStory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && !submitting;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scaleType,
          scaleValues:
            scaleType === "custom"
              ? customValues.split(",").map((v) => v.trim()).filter(Boolean)
              : undefined,
          stage,
          stories: stories.map((s) => ({ title: s.title })),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create room");
      }

      const { roomCode, hostToken } = (await res.json()) as { roomCode: string; hostToken: string };

      saveHostToken(roomCode, hostToken);
      saveIdentity(roomCode, { memberId: crypto.randomUUID(), name: name.trim(), avatarId });

      router.push(`/room/${roomCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="pixel-heading text-xl text-(--pp-primary)">HOST A ROOM</h1>

      <section className="pixel-panel flex flex-col gap-3 p-5">
        <h2 className="pixel-heading text-sm">1. Your name &amp; avatar</h2>
        <input
          className="pixel-input"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
        />
        <AvatarPicker value={avatarId} onChange={setAvatarId} />
      </section>

      <section className="pixel-panel flex flex-col gap-3 p-5">
        <h2 className="pixel-heading text-sm">2. Point scale</h2>
        <ScaleConfigForm
          scaleType={scaleType}
          customValues={customValues}
          onScaleTypeChange={setScaleType}
          onCustomValuesChange={setCustomValues}
        />
      </section>

      <section className="pixel-panel flex flex-col gap-3 p-5">
        <h2 className="pixel-heading text-sm">3. Estimation stage</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`pixel-card p-3 text-sm ${stage === "rough" ? "bg-(--pp-primary) text-white" : ""}`}
            onClick={() => setStage("rough")}
          >
            Rough (high-level)
          </button>
          <button
            type="button"
            className={`pixel-card p-3 text-sm ${stage === "sprint" ? "bg-(--pp-primary) text-white" : ""}`}
            onClick={() => setStage("sprint")}
          >
            Sprint Plan (detailed)
          </button>
        </div>
      </section>

      <section className="pixel-panel flex flex-col gap-3 p-5">
        <h2 className="pixel-heading text-sm">4. Story queue</h2>
        <StoryListEditor stories={stories} onChange={setStories} />
      </section>

      {error ? <p className="text-sm text-(--pp-danger)">{error}</p> : null}

      <button type="button" className="pixel-btn secondary self-start" disabled={!canSubmit} onClick={handleSubmit}>
        {submitting ? "CREATING..." : "CREATE ROOM"}
      </button>
    </main>
  );
}
