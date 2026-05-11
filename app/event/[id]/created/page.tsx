"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Button from "@/components/Button";
import { storage } from "@/lib/storage";
import { SyncEvent } from "@/lib/types";

export default function CreatedPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<SyncEvent | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEvent(storage.getEvent(id));
  }, [id]);

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/event/${id}/join`
      : `/event/${id}/join`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = joinUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <PageShell>
      <div className="animate-slide-up text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 border border-accent/40">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2">イベントを作成しました！</h1>
        {event && (
          <p className="text-muted mb-8">
            <span className="text-fg font-medium">{event.name}</span>
          </p>
        )}

        <div className="rounded-2xl border border-border bg-surface p-6 text-left mb-6">
          <p className="text-sm font-medium text-fg/70 mb-3">招待URL</p>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface2 px-4 py-3">
            <p className="flex-1 text-sm text-fg/80 break-all font-mono">{joinUrl}</p>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  コピー済
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  コピー
                </>
              )}
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted">
            このURLを参加者に共有してください。参加者はプロフィールを登録してマッチングを開始できます。
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href={`/event/${id}/join`}>
            <Button size="lg" className="w-full">
              自分もプロフィールを登録する
            </Button>
          </Link>
          <Link href={`/event/${id}`}>
            <Button variant="outline" size="lg" className="w-full">
              参加者一覧を見る
            </Button>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
