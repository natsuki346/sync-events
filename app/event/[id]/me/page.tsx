"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import { storage } from "@/lib/storage";
import { Participant, SyncEvent } from "@/lib/types";

export default function MyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<SyncEvent | null>(null);
  const [me, setMe] = useState<Participant | null>(null);
  const [requesters, setRequesters] = useState<Participant[]>([]);

  useEffect(() => {
    const ev = storage.getEvent(id);
    setEvent(ev);

    const myId = storage.getMyId(id);
    if (!myId) {
      router.push(`/event/${id}/join`);
      return;
    }

    const myProfile = storage.getParticipant(id, myId);
    setMe(myProfile);

    const requests = storage.getRequestsTo(id, myId);
    const participants = storage.getParticipants(id);
    const fromPeople = requests
      .map((r) => participants.find((p) => p.id === r.fromId))
      .filter((p): p is Participant => !!p);
    setRequesters(fromPeople);
  }, [id, router]);

  if (!me || !event) {
    return (
      <PageShell>
        <p className="text-muted">読み込み中...</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-muted mb-1 uppercase tracking-wider font-medium">
              {event.name}
            </div>
            <h1 className="text-2xl font-bold">マイページ</h1>
          </div>
          <Link href={`/event/${id}`}>
            <Button variant="outline" size="sm">← 一覧へ</Button>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent font-bold">
              {me.displayName[0].toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-lg text-fg">{me.displayName}</div>
              <div className="text-sm text-muted">{me.phase}</div>
            </div>
          </div>

          <p className="text-sm text-fg/70 mb-4 leading-relaxed">{me.bio}</p>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium text-muted uppercase tracking-wider block mb-1.5">
                向かっている方向
              </span>
              <div className="flex flex-wrap gap-1.5">
                {me.directions.map((d) => (
                  <Badge key={d} variant="accent">{d}</Badge>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted uppercase tracking-wider block mb-1.5">
                特性
              </span>
              <div className="flex flex-wrap gap-1.5">
                {me.traits.map((t) => (
                  <Badge key={t} variant="outline">{t}</Badge>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted uppercase tracking-wider block mb-1.5">
                ハッシュタグ
              </span>
              <div className="flex flex-wrap gap-2">
                {me.hashtags.map((h) => (
                  <span key={h} className="text-sm text-accent">#{h}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Talk Requests */}
        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            「話したい」をもらった人
            {requesters.length > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">
                {requesters.length}
              </span>
            )}
          </h2>

          {requesters.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <p className="text-muted text-sm">まだリクエストはありません。</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requesters.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-accent/30 bg-accent/5 p-4 flex items-start gap-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-sm">
                    {p.displayName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-fg">{p.displayName}</div>
                    <div className="text-xs text-muted mb-1">{p.phase}</div>
                    <p className="text-sm text-fg/70 truncate">{p.bio}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.directions.map((d) => (
                        <Badge key={d} variant="accent">{d}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
