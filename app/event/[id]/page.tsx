"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import Logo from "@/components/Logo";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import ScoreBar from "@/components/ScoreBar";
import { storage } from "@/lib/storage";
import { rankParticipants } from "@/lib/matching";
import { SyncEvent, Participant, MatchedParticipant } from "@/lib/types";

function ParticipantCard({
  p,
  isSelf,
  myId,
  eventId,
  onRequest,
}: {
  p: MatchedParticipant | Participant;
  isSelf: boolean;
  myId: string | null;
  eventId: string;
  onRequest: (toId: string) => void;
}) {
  const matched = p as MatchedParticipant;
  const hasScore = "score" in p;
  const requested =
    myId && !isSelf ? storage.hasRequested(eventId, myId, p.id) : false;
  const [sent, setSent] = useState(requested);

  function handleRequest() {
    if (!myId || isSelf || sent) return;
    onRequest(p.id);
    setSent(true);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/40 animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-sm">
            {p.displayName[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-fg">{p.displayName}</span>
              {isSelf && <Badge variant="self">自分</Badge>}
            </div>
            <span className="text-xs text-muted">{p.phase}</span>
          </div>
        </div>
        {hasScore && !isSelf && (
          <div className="text-right shrink-0">
            <div className="text-xs text-muted mb-1">マッチ度</div>
            <div className="w-28">
              <ScoreBar score={matched.score} />
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-fg/70 mb-3 leading-relaxed">{p.bio}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {p.directions.map((d) => (
          <Badge key={d} variant="accent">{d}</Badge>
        ))}
        {p.traits.map((t) => (
          <Badge key={t} variant="outline">{t}</Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {p.hashtags.map((h) => (
          <span key={h} className="text-xs text-muted">
            #{h}
          </span>
        ))}
      </div>

      {!isSelf && myId && (
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

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<SyncEvent | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [me, setMe] = useState<Participant | null>(null);
  const [ranked, setRanked] = useState<(MatchedParticipant | Participant)[]>([]);

  const load = useCallback(() => {
    const ev = storage.getEvent(id);
    setEvent(ev);
    const mid = storage.getMyId(id);
    setMyId(mid);
    const participants = storage.getParticipants(id);
    const myParticipant = mid ? participants.find((p) => p.id === mid) ?? null : null;
    setMe(myParticipant);

    if (myParticipant) {
      const others = rankParticipants(myParticipant, participants);
      setRanked([myParticipant, ...others]);
    } else {
      setRanked(participants);
    }
  }, [id]);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [load]);

  function handleRequest(toId: string) {
    if (!myId) return;
    storage.saveRequest({
      id: uuidv4(),
      eventId: id,
      fromId: myId,
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

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          {!myId && (
            <Link href={`/event/${id}/join`}>
              <Button size="sm">参加する</Button>
            </Link>
          )}
          {myId && (
            <Link href={`/event/${id}/me`}>
              <Button variant="outline" size="sm">マイページ</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-muted uppercase tracking-wider font-medium">Event</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">{event.name}</h1>
        <p className="text-sm text-muted mb-1">
          {new Date(event.date).toLocaleString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-sm text-fg/60 mb-6">{event.description}</p>

        {ranked.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="text-muted mb-4">まだ参加者がいません。</p>
            <Link href={`/event/${id}/join`}>
              <Button>最初に参加する</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-fg/70">
                参加者 <span className="text-accent">{ranked.length}</span> 人
              </h2>
              {me && <span className="text-xs text-muted">マッチ度スコア順</span>}
            </div>
            <div className="space-y-4">
              {ranked.map((p) => (
                <ParticipantCard
                  key={p.id}
                  p={p}
                  isSelf={p.id === myId}
                  myId={myId}
                  eventId={id}
                  onRequest={handleRequest}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
