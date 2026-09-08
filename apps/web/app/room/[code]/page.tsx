"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FactorScores } from "@planningpoker/shared";
import { AvatarPicker } from "@/components/avatar/AvatarPicker";
import { HistoryTable } from "@/components/history/HistoryTable";
import { MemberList } from "@/components/room/MemberList";
import { StoryQueue } from "@/components/room/StoryQueue";
import { FactorSliders } from "@/components/room/FactorSliders";
import { PointCardDeck } from "@/components/room/PointCardDeck";
import { RevealBoard } from "@/components/room/RevealBoard";
import { DEFAULT_AVATAR_ID } from "@/lib/avatars";
import { BASE_PATH } from "@/lib/basePath";
import { loadHostToken, loadIdentity, saveIdentity } from "@/lib/identity";
import { useRoomConnection, type JoinInfo } from "@/lib/useRoomConnection";

const NUDGE_LINES = [
  "VOTE OR GET PUNCHED!",
  "WAKE UP AND VOTE!",
  "EVERYONE'S WAITING, HERO!",
  "STOP STALLING, PICK A CARD!",
  "SPRINT WON'T START WITHOUT YOU!",
  "TICK TOCK, DROP A CARD!",
  "OI, PICK A CARD!",
  "THE KING IS WAITING!",
  "DAYDREAMING? VOTE!",
  "NO CARD, NO GLORY!",
  "PICK ONE, ANY ONE!",
  "YOUR TEAM IS JUDGING YOU!",
];

// Deals a different (non-repeating until exhausted) taunt to each member id.
function dealNudgeTexts(memberIds: string[]): Record<string, string> {
  const shuffled = [...NUDGE_LINES].sort(() => Math.random() - 0.5);
  return Object.fromEntries(memberIds.map((id, i) => [id, shuffled[i % shuffled.length]]));
}

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const roomCode = code.toUpperCase();
  const router = useRouter();

  const [joinInfo, setJoinInfo] = useState<JoinInfo | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [avatarDraft, setAvatarDraft] = useState(DEFAULT_AVATAR_ID);

  useEffect(() => {
    // localStorage is only available client-side, so this must run post-mount
    // rather than as derived/initial state (which would mismatch SSR output).
    const identity = loadIdentity(roomCode);
    if (identity) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setJoinInfo({ ...identity, hostToken: loadHostToken(roomCode) ?? undefined });
    }
  }, [roomCode]);

  const { state, status, send, lastError } = useRoomConnection(roomCode, joinInfo);

  const selfId = state?.selfMemberId;
  const selfMember = useMemo(() => state?.members.find((m) => m.id === selfId), [state, selfId]);
  const isHost = Boolean(selfMember?.isHost);
  const activeStory = useMemo(
    () => state?.stories.find((s) => s.id === state.activeStoryId) ?? null,
    [state],
  );

  const [nudgeMemberIds, setNudgeMemberIds] = useState<string[]>([]);
  const [nudgeTexts, setNudgeTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    // A new round (fresh start or re-vote) clears any leftover nudge from the last one.
    setNudgeMemberIds([]);
  }, [activeStory?.id, state?.round?.roundNumber]);

  const [voteScores, setVoteScores] = useState<FactorScores>({ risk: 5, complexity: 5, repetition: 5 });
  const [votePoint, setVotePoint] = useState<string | null>(null);

  useEffect(() => {
    // A new round starts every vote fresh, rather than carrying over the last pick.
    setVoteScores({ risk: 5, complexity: 5, repetition: 5 });
    setVotePoint(null);
  }, [activeStory?.id, state?.round?.roundNumber]);

  function handleRevealClick() {
    if (!activeStory || !state?.round) return;
    const missing = state.members
      .filter((m) => m.connected && !state.round!.submittedPointMemberIds.includes(m.id))
      .map((m) => m.id);
    if (missing.length > 0) {
      setNudgeMemberIds(missing);
      setNudgeTexts(dealNudgeTexts(missing));
      return;
    }
    setNudgeMemberIds([]);
    send({ type: "host_reveal", storyId: activeStory.id });
  }

  function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    const identity = { memberId: crypto.randomUUID(), name: trimmed, avatarId: avatarDraft };
    saveIdentity(roomCode, identity);
    setJoinInfo({ ...identity, hostToken: loadHostToken(roomCode) ?? undefined });
  }

  if (!joinInfo) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-10">
        <h1 className="pixel-heading text-lg text-[--pp-primary]">JOIN ROOM {roomCode}</h1>
        <form onSubmit={handleJoinSubmit} className="pixel-panel flex flex-col gap-4 p-5">
          <input
            className="pixel-input"
            placeholder="Your name"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            maxLength={24}
            autoFocus
          />
          <AvatarPicker value={avatarDraft} onChange={setAvatarDraft} />
          <button type="submit" className="pixel-btn secondary" disabled={!nameDraft.trim()}>
            JOIN
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="pixel-heading text-lg text-[--pp-primary]">ROOM {roomCode}</h1>
          <p className="text-xs opacity-60">
            {status === "open" ? "Connected" : status === "connecting" ? "Connecting..." : "Disconnected — retrying"}
            {state ? ` · ${state.config.stage === "rough" ? "Rough estimation" : "Sprint plan estimation"}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="pixel-btn ghost"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
          >
            COPY LINK
          </button>
          <button type="button" className="pixel-btn ghost" onClick={() => router.push("/")}>
            LEAVE
          </button>
        </div>
      </header>

      {lastError ? <p className="pixel-card bg-[--pp-danger] p-2 text-sm text-white">{lastError}</p> : null}

      {!state ? (
        <p className="text-sm opacity-60">Loading room...</p>
      ) : (
        <>
          <section className="pixel-panel p-4">
            <h2 className="pixel-heading mb-3 text-xs">STORY QUEUE</h2>
            <StoryQueue
              stories={state.stories}
              isHost={isHost}
              activeStoryId={state.activeStoryId}
              onAddStory={(title) => send({ type: "host_add_story", title })}
              onStartStory={(storyId) => send({ type: "host_start_story", storyId })}
            />
          </section>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <section className="pixel-panel min-w-0 flex-1 p-4">
              <h2 className="pixel-heading mb-3 text-xs">TEAM</h2>
              <MemberList
                members={state.members}
                phase={state.round?.phase}
                submittedFactorIds={state.round?.submittedFactorMemberIds}
                submittedPointIds={state.round?.submittedPointMemberIds}
                results={state.round?.results}
                nudgeMemberIds={nudgeMemberIds.filter(
                  (id) => !state.round?.submittedPointMemberIds.includes(id),
                )}
                nudgeTexts={nudgeTexts}
              />
            </section>

            {activeStory && state.round ? (
              <section className="flex flex-col gap-4 lg:w-96 lg:shrink-0">
                <h2 className="pixel-heading text-sm">
                  ESTIMATING: {activeStory.title} (round {state.round.roundNumber})
                </h2>

                {state.round.phase === "revealed" && state.round.results ? (
                  <RevealBoard
                    results={state.round.results}
                    members={state.members}
                    isHost={isHost}
                    scaleValues={state.config.scaleValues}
                    onRevote={() => send({ type: "host_start_revote", storyId: activeStory.id })}
                    onFinalize={(finalPoint) =>
                      send({ type: "host_finalize_story", storyId: activeStory.id, finalPoint })
                    }
                  />
                ) : (
                  <>
                    {selfId &&
                    state.round.submittedFactorMemberIds.includes(selfId) &&
                    state.round.submittedPointMemberIds.includes(selfId) ? (
                      <div className="pixel-card p-4 text-sm">Vote submitted — waiting for others.</div>
                    ) : (
                      <div className="pixel-panel flex flex-col gap-4 p-4">
                        <FactorSliders scores={voteScores} onChange={setVoteScores} />
                        <PointCardDeck
                          scaleValues={state.config.scaleValues}
                          selected={votePoint}
                          onSelect={setVotePoint}
                        />
                        <button
                          type="button"
                          className="pixel-btn secondary self-start"
                          disabled={!votePoint}
                          onClick={() => {
                            send({ type: "submit_factor_scores", storyId: activeStory.id, ...voteScores });
                            send({ type: "submit_point", storyId: activeStory.id, value: votePoint! });
                          }}
                        >
                          SUBMIT VOTE
                        </button>
                      </div>
                    )}

                    {isHost ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" className="pixel-btn self-start" onClick={handleRevealClick}>
                          REVEAL CARDS
                        </button>
                        {nudgeMemberIds.filter((id) => !state.round!.submittedPointMemberIds.includes(id))
                          .length > 0 ? (
                          <>
                            <span className="text-xs opacity-60">Still waiting on some votes.</span>
                            <button
                              type="button"
                              className="pixel-btn danger self-start text-xs"
                              onClick={() => send({ type: "host_reveal", storyId: activeStory.id })}
                            >
                              REVEAL ANYWAY
                            </button>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                )}
              </section>
            ) : (
              <section className="flex lg:w-96 lg:shrink-0">
                <p className="pixel-card p-4 text-sm">
                  {isHost ? "Start a story from the queue above." : "Waiting for the host to start a story."}
                </p>
              </section>
            )}
          </div>

          {state.history.length > 0 ? (
            <section className="pixel-panel p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="pixel-heading text-xs">SESSION HISTORY</h2>
                <a
                  href={`${BASE_PATH}/api/rooms/${roomCode}/export`}
                  className="pixel-btn ghost text-xs"
                >
                  DOWNLOAD CSV
                </a>
              </div>
              <HistoryTable entries={state.history} />
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
