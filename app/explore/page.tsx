"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { storage } from "@/lib/storage";
import { SyncEvent } from "@/lib/types";
import { getEventGradient, formatShortDate } from "@/lib/utils";
import Button from "@/components/Button";

export default function ExplorePage() {
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [joinedIds, setJoinedIds] = useState<string[]>([]);

  useEffect(() => {
    const evs = storage
      .getEvents()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEvents(evs);

    const c: Record<string, number> = {};
    for (const e of evs) c[e.id] = storage.getParticipants(e.id).length;
    setCounts(c);
    setJoinedIds(storage.getJoinedEventIds());
  }, []);

  return (
    <div className="min-h-screen text-fg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-border/50">
        <h1 className="text-[17px] font-bold">イベントを探す</h1>
        <Link href="/create">
          <Button size="sm" variant="outline">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="6" y1="1" x2="6" y2="11" />
              <line x1="1" y1="6" x2="11" y2="6" />
            </svg>
            作成
          </Button>
        </Link>
      </header>

      <main className="px-4 py-5">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-muted text-sm mb-5">まだイベントがありません。</p>
            <Link href="/create">
              <Button>最初のイベントを作成する</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const joined = joinedIds.includes(event.id);
              const isUpcoming = new Date(event.date) >= new Date();

              return (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  className="block active:scale-[0.98] transition-transform duration-150"
                >
                  <article className="rounded-2xl border border-border bg-surface overflow-hidden">
                    {/* Banner */}
                    <div
                      className="h-[72px] relative"
                      style={{ background: getEventGradient(event.id) }}
                    >
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        {joined && (
                          <span className="text-[10px] font-semibold text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                            参加済み ✓
                          </span>
                        )}
                        {!isUpcoming && (
                          <span className="text-[10px] font-medium text-white/70 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                            終了
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-4 py-3.5">
                      <h3 className="font-semibold text-[15px] text-fg mb-0.5 line-clamp-1">
                        {event.name}
                      </h3>
                      <p className="text-xs text-muted mb-2">{formatShortDate(event.date)}</p>
                      <p className="text-xs text-fg/50 line-clamp-2 leading-relaxed mb-2.5">
                        {event.description}
                      </p>
                      <span className="text-xs text-muted">
                        <span className="text-accent font-medium">{counts[event.id] ?? 0}</span>
                        {" "}人参加中
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
