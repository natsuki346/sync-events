"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { storage } from "@/lib/storage";
import { rankParticipants } from "@/lib/matching";
import { SyncEvent, MatchedParticipant } from "@/lib/types";
import { getEventGradient, formatShortDate } from "@/lib/utils";
import Button from "@/components/Button";

interface HomeEventData {
  event: SyncEvent;
  participantCount: number;
  topMatches: MatchedParticipant[];
  isUpcoming: boolean;
}

function HomeEventCard({ data }: { data: HomeEventData }) {
  const { event, participantCount, topMatches, isUpcoming } = data;

  return (
    <Link href={`/event/${event.id}`} className="block active:scale-[0.98] transition-transform duration-150">
      <article className="rounded-2xl border border-border bg-surface overflow-hidden">
        {/* Gradient banner */}
        <div
          className="h-[72px] w-full relative"
          style={{ background: getEventGradient(event.id) }}
        >
          {!isUpcoming && (
            <span className="absolute top-2 right-2 text-[10px] font-medium text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
              終了
            </span>
          )}
        </div>

        <div className="px-4 py-3.5">
          <h3 className="font-semibold text-[15px] text-fg leading-snug mb-0.5 line-clamp-1">
            {event.name}
          </h3>
          <p className="text-xs text-muted mb-3">{formatShortDate(event.date)}</p>

          <div className="flex items-center justify-between">
            {/* Match avatars + count */}
            <div className="flex items-center gap-2">
              {topMatches.length > 0 && (
                <div className="flex -space-x-2">
                  {topMatches.map((p, i) => (
                    <div
                      key={p.id}
                      style={{ zIndex: 3 - i }}
                      className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/25 text-accent text-[9px] font-bold border-2 border-surface"
                    >
                      {p.displayName[0].toUpperCase()}
                    </div>
                  ))}
                </div>
              )}
              <span className="text-xs text-muted">{participantCount}人参加</span>
            </div>

            {/* Top match score */}
            {topMatches.length > 0 && (
              <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                ベスト {topMatches[0].score}pt
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function HomePage() {
  const [eventData, setEventData] = useState<HomeEventData[]>([]);

  useEffect(() => {
    const p = storage.getMyProfile();

    const joinedIds = storage.getJoinedEventIds();
    const now = new Date();
    const data: HomeEventData[] = [];

    for (const eventId of joinedIds) {
      const event = storage.getEvent(eventId);
      if (!event) continue;
      const participants = storage.getParticipants(eventId);
      const me = p ? participants.find((x) => x.id === p.id) : null;
      const topMatches = me ? rankParticipants(me, participants).slice(0, 3) : [];
      data.push({
        event,
        participantCount: participants.length,
        topMatches,
        isUpcoming: new Date(event.date) >= now,
      });
    }

    const upcoming = data
      .filter((d) => d.isUpcoming)
      .sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());
    const past = data
      .filter((d) => !d.isUpcoming)
      .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());

    setEventData([...upcoming, ...past]);
  }, []);

  return (
    <div className="min-h-screen text-fg">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-border/50">
        <span className="text-[22px] font-bold tracking-tight leading-none">
          SYNC<span className="text-accent">.</span>
        </span>
        <Link
          href="/explore"
          className="flex items-center gap-1.5 text-sm font-medium text-accent"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="7.5" y1="1" x2="7.5" y2="14" />
            <line x1="1" y1="7.5" x2="14" y2="7.5" />
          </svg>
          イベントを追加
        </Link>
      </header>

      <main className="px-4 py-5">
        {eventData.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div
              className="mb-5 flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-fg mb-1.5">
              参加中のイベントがありません
            </h2>
            <p className="text-sm text-muted mb-6 max-w-[220px] leading-relaxed">
              イベントを探して参加登録しましょう。
            </p>
            <Link href="/explore">
              <Button size="md">イベントを探す</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Upcoming section */}
            {eventData.filter((d) => d.isUpcoming).length > 0 && (
              <>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider px-0.5 mb-2">
                  直近の予定
                </p>
                {eventData
                  .filter((d) => d.isUpcoming)
                  .map((d) => <HomeEventCard key={d.event.id} data={d} />)}
              </>
            )}

            {/* Past section */}
            {eventData.filter((d) => !d.isUpcoming).length > 0 && (
              <>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider px-0.5 mt-5 mb-2">
                  過去のイベント
                </p>
                {eventData
                  .filter((d) => !d.isUpcoming)
                  .map((d) => <HomeEventCard key={d.event.id} data={d} />)}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
