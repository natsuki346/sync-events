"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Button from "@/components/Button";
import { storage } from "@/lib/storage";

export default function CreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", date: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "イベント名を入力してください";
    if (!form.date) e.date = "開催日時を入力してください";
    if (!form.description.trim()) e.description = "説明文を入力してください";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    const id = uuidv4();
    storage.saveEvent({
      id,
      name: form.name.trim(),
      date: form.date,
      description: form.description.trim(),
      createdAt: new Date().toISOString(),
    });
    router.push("/explore");
  }

  return (
    <div className="min-h-screen text-fg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-muted active:bg-surface2 transition"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 1 3 7 9 13" />
            </svg>
          </button>
          <h1 className="text-[17px] font-bold">イベントを作成</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* イベント名 */}
          <div>
            <label className="block text-sm font-medium text-fg/80 mb-1.5">
              イベント名
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: "" })); }}
              placeholder="例: スタートアップナイト Vol.3"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition text-[15px]"
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          {/* 開催日時 */}
          <div>
            <label className="block text-sm font-medium text-fg/80 mb-1.5">
              開催日時
            </label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => { setForm((f) => ({ ...f, date: e.target.value })); setErrors((er) => ({ ...er, date: "" })); }}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-fg focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition [color-scheme:dark] text-[15px]"
            />
            {errors.date && <p className="mt-1 text-xs text-red-400">{errors.date}</p>}
          </div>

          {/* 説明文 */}
          <div>
            <label className="block text-sm font-medium text-fg/80 mb-1.5">
              イベントの説明
            </label>
            <textarea
              value={form.description}
              onChange={(e) => { setForm((f) => ({ ...f, description: e.target.value })); setErrors((er) => ({ ...er, description: "" })); }}
              rows={4}
              placeholder="どんな目的・テーマのイベントですか？"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none transition text-[15px]"
            />
            {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description}</p>}
          </div>

          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "作成中..." : "イベントを作成する"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
