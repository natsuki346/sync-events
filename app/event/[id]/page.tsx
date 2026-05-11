"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import NavBar from "@/components/NavBar";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import ScoreBar from "@/components/ScoreBar";
import { storage } from "@/lib/storage";
import { rankParticipants } from "@/lib/matching";
import { getEventGradient, formatEventDate } from "@/lib/utils";
import {
  SyncEvent,
  Participant,
  MatchedParticipant,
  MyProfile,
} from "@/lib/types";

// ─── Participant Card ──────────────────────────────────────────────────────────

function ParticipantCard({
  participant,
  isSelf,
  myProfile,
  eventId,
  showScore,
  score,
  onRequest,
}: {
  participant: Participant;
  isSelf: boolean;
  myProfile: MyProfile | null;
  eventId: string;
  showScore: boolean;
  score?: number;
  onRequest: (toId: string) => void;
}) {
  const [sent, setSent] = useState(() =>
    myProfile
      ? storage.hasRequested(eventId, myProfile.id, participant.id)
      : false
  );

  function handleRequest() {
    if (!myProfile || isSelf || sent) return;
    onRequest(participant.id);
    setSent(true);
  }

  return (
    <div
      className={`rounded-2xl border bg-surface p-5 transition-all animate-fade-in ${
        isSelf
          ? "border-accent/40 ring-1 ring-accent/20"
          : "border-border hover:border-accent/30"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-sm">
            {participant.displayName[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-fg">{participant.displayName}</span>
              {isSelf && (
                <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                  自分
                </span>
              )}
            </div>
            <span className="text-xs text-muted">{participant.phase}</span>
          </div>
        </div>

        {/* Score */}
        <div className="shrink-0 text-right">
          <div className="text-[10px] text-muted mb-1">マッチ度</div>
          <div className="w-24">
            <ScoreBar score={score} unknown={!showScore} />
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-fg/65 leading-relaxed mb-3 line-clamp-2">
        {participant.bio}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {participant.directions.map((d) => (
          <Badge key={d} variant="accent">{d}</Badge>
        ))}
        {participant.traits.map((t) => (
          <Badge key={t} variant="outline">{t}</Badge>
        ))}
      </div>

      {/* Hashtags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {participant.hashtags.map((h) => (
          <span key={h} className="text-xs text-muted/70">
            #{h}
          </span>
        ))}
      </div>

      {/* Action */}
      {!isSelf && myProfile && (
        <Button
          variant={sent ? "ghost" : "outline"}
          size="sm"
          disabled={sent}
          onClick={handleRequest}
          className="w-full"
        >
          {sent ? "リクエスト送信済み ✓" : "話したい！"}
        </Button>
      )}
    </div>
  );
}

// ─── Event Page ───────────────────────────────────────────────────────────────

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<SyncEvent | null>(null);
  const [myProfile, setMyProfile] = useState<MyProfile | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [ranked, setRanked] = useState<(MatchedParticipant | Participant)[]>([]);

  const load = useCallback(() => {
    const ev = storage.getEvent(id);
    setEvent(ev);

    const profile = storage.getMyProfile();
    setMyProfile(profile);

    const joined = storage.hasJoined(id);
    setHasJoined(joined);

    const all = storage.getParticipants(id);
    setParticipants(all);

    if (profile && joined) {
      const me = all.find((p) => p.id === profile.id) ?? null;
      if (me) {
        const others = rankParticipants(me, all);
        setRanked([me, ...others]);
      } else {
        setRanked(all);
      }
    } else {
      setRanked([...all].sort(
        (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
      ));
    }
  }, [id]);

  useEffect(() => {
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, [load]);

  function handleRequest(toId: string) {
    if (!myProfile) return;
    storage.saveRequest({
      id: uuidv4(),
      eventId: id,
      fromId: myProfile.id,
      toId,
      createdAt: new Date().toISOString(),
    });
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center">
        <p className="text-muted">イベントが見つかりませんでした。</p>
      </div>
    );
  }

  const scoreFor = (p: Participant): number | undefined => {
    if (!hasJoined) return undefined;
    return (ranked as MatchedParticipant[]).find((r) => r.id === p.id)?.score;
  };

  return (
    <div className="min-h-screen bg-bg text-fg">
      <NavBar />

      {/* Banner */}
      <div
        className="relative h-48 w-full"
        style={{ background: getEventGradient(id) }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
          <h1 className="text-2xl font-bold text-white drop-shadow">{event.name}</h1>
          <p className="text-sm text-white/70 mt-0.5">{formatEventDate(event.date)}</p>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Event meta */}
        <div className="rounded-2xl border border-border bg-surface p-5 mb-6">
          <p className="text-sm text-fg/70 leading-relaxed mb-4">
            {event.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">
              <span className="text-accent font-semibold">{participants.length}</span>
              {" "}人参加中
            </span>

            {!hasJoined && (
              <Link href={`/event/${id}/join`}>
                <Button size="sm">参加登録する</Button>
              </Link>
            )}
            {hasJoined && (
              <span className="inline-flex items-center gap-1.5 text-sm text-accent font-medium">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="2 7 5.5 10.5 12 4" />
                </svg>
                参加済み
              </span>
            )}
          </div>
        </div>

        {/* Participants */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg/70">参加者一覧</h2>
          {hasJoined && (
            <span className="text-xs text-muted">マッチ度スコア順</span>
          )}
          {!hasJoined && participants.length > 0 && (
            <span className="text-xs text-muted">
              参加登録するとマッチ度が表示されます
            </span>
          )}
        </div>

        {ranked.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center">
            <p className="text-muted text-sm mb-4">まだ参加者がいません。</p>
            <Link href={`/event/${id}/join`}>
              <Button>最初に参加登録する</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ranked.map((p) => (
              <ParticipantCard
                key={p.id}
                participant={p}
                isSelf={p.id === myProfile?.id}
                myProfile={myProfile}
                eventId={id}
                showScore={hasJoined && p.id !== myProfile?.id}
                score={scoreFor(p)}
                onRequest={handleRequest}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
