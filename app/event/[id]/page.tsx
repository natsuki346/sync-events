"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import { storage } from "@/lib/storage";
import { rankParticipants } from "@/lib/matching";
import { getEventGradient, formatEventDate } from "@/lib/utils";
import { SyncEvent, Participant, MatchedParticipant, MyProfile } from "@/lib/types";

// ─── Participant Card (mobile) ─────────────────────────────────────────────────

function ParticipantCard({
  participant,
  isSelf,
  myProfile,
  eventId,
  score,
  showScore,
  onRequest,
}: {
  participant: Participant;
  isSelf: boolean;
  myProfile: MyProfile | null;
  eventId: string;
  score?: number;
  showScore: boolean;
  onRequest: (toId: string) => void;
}) {
  const [sent, setSent] = useState(() =>
    myProfile ? storage.hasRequested(eventId, myProfile.id, participant.id) : false
  );

  function handleRequest() {
    if (!myProfile || isSelf || sent) return;
    onRequest(participant.id);
    setSent(true);
  }

  return (
    <div
      className={`rounded-2xl border bg-surface p-4 ${
        isSelf ? "border-accent/40 ring-1 ring-accent/10" : "border-border"
      }`}
    >
      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-sm">
          {participant.displayName[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-[15px] text-fg truncate">
                {participant.displayName}
              </span>
              {isSelf && (
                <span className="shrink-0 inline-flex items-center rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                  自分
                </span>
              )}
            </div>
            {/* Score indicator */}
            {!isSelf && showScore && (
              <span className="shrink-0 text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                {score}pt
              </span>
            )}
            {!isSelf && !showScore && myProfile && (
              <span className="shrink-0 text-xs font-medium text-muted bg-surface2 px-2 py-0.5 rounded-full">
                ? pt
              </span>
            )}
          </div>
          <span className="text-xs text-muted">{participant.phase}</span>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-fg/60 leading-relaxed mb-3 line-clamp-2">
        {participant.bio}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {participant.directions.map((d) => (
          <Badge key={d} variant="accent">{d}</Badge>
        ))}
        {participant.traits.map((t) => (
          <Badge key={t} variant="outline">{t}</Badge>
        ))}
      </div>

      {/* Hashtags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {participant.hashtags.map((h) => (
          <span key={h} className="text-[11px] text-muted/70">#{h}</span>
        ))}
      </div>

      {/* Action */}
      {!isSelf && myProfile && (
        <Button
          variant={sent ? "ghost" : "primary"}
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

// ─── Event Page ────────────────────────────────────────────────────────────────

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

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
      const me = all.find((p) => p.id === profile.id);
      if (me) {
        setRanked([me, ...rankParticipants(me, all)]);
      } else {
        setRanked(all);
      }
    } else {
      setRanked(
        [...all].sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())
      );
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

  const scoreFor = (p: Participant): number | undefined => {
    if (!hasJoined) return undefined;
    return (ranked as MatchedParticipant[]).find((r) => r.id === p.id)?.score;
  };

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted text-sm">イベントが見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-fg">
      {/* Banner with back button */}
      <div
        className="relative h-52 w-full"
        style={{ background: getEventGradient(id) }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-black/30 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white active:bg-black/50 transition"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="10 3 5 8 10 13" />
          </svg>
        </button>

        {/* Event info overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-xl font-bold text-white drop-shadow-sm leading-snug mb-1">
            {event.name}
          </h1>
          <p className="text-sm text-white/70">{formatEventDate(event.date)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5 space-y-4">
        {/* Description + CTA */}
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm text-fg/70 leading-relaxed mb-4">
            {event.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">
              <span className="text-accent font-semibold">{participants.length}</span>
              {" "}人参加中
            </span>

            {!hasJoined ? (
              <Link href={`/event/${id}/join`}>
                <Button size="sm">このイベントに参加する</Button>
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-accent font-medium">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="1.5 6.5 5 10 11.5 3.5" />
                </svg>
                参加済み
              </span>
            )}
          </div>
        </div>

        {/* Participant list header */}
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-[13px] font-semibold text-fg/60 uppercase tracking-wider">
            参加者一覧
          </h2>
          {hasJoined && ranked.length > 1 && (
            <span className="text-[11px] text-muted">マッチ度スコア順</span>
          )}
          {!hasJoined && participants.length > 0 && (
            <span className="text-[11px] text-muted">参加するとスコアが表示されます</span>
          )}
        </div>

        {/* Participants */}
        {ranked.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-muted text-sm mb-4">まだ参加者がいません。</p>
            <Link href={`/event/${id}/join`}>
              <Button size="sm">最初に参加登録する</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {ranked.map((p) => (
              <ParticipantCard
                key={p.id}
                participant={p}
                isSelf={p.id === myProfile?.id}
                myProfile={myProfile}
                eventId={id}
                score={scoreFor(p)}
                showScore={hasJoined && p.id !== myProfile?.id}
                onRequest={handleRequest}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
