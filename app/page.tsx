"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import EventCard from "@/components/EventCard";
import Button from "@/components/Button";
import { storage } from "@/lib/storage";
import { SyncEvent } from "@/lib/types";

export default function HomePage() {
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [joinedIds, setJoinedIds] = useState<string[]>([]);

  useEffect(() => {
    const evs = storage
      .getEvents()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEvents(evs);

    const c: Record<string, number> = {};
    for (const e of evs) {
      c[e.id] = storage.getParticipants(e.id).length;
    }
    setCounts(c);
    setJoinedIds(storage.getJoinedEventIds());
  }, []);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <NavBar />

      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Header row */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              イベント<span className="text-accent">.</span>
            </h1>
            <p className="text-sm text-muted">
              参加者と事前につながれるイベント一覧
            </p>
          </div>
          <Link href="/create">
            <Button size="md">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="7" y1="1" x2="7" y2="13" />
                <line x1="1" y1="7" x2="13" y2="7" />
              </svg>
              イベントを作成
            </Button>
          </Link>
        </div>

        {/* Event grid */}
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-16 text-center animate-fade-in">
            <div className="mb-3 text-3xl opacity-30">📅</div>
            <p className="text-muted text-sm mb-5">
              まだイベントがありません。最初のイベントを作りましょう。
            </p>
            <Link href="/create">
              <Button>イベントを作成する</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                participantCount={counts[event.id] ?? 0}
                hasJoined={joinedIds.includes(event.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
