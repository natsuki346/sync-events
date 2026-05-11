"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import PageShell from "@/components/PageShell";
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
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    const id = uuidv4();
    storage.saveEvent({
      id,
      name: form.name.trim(),
      date: form.date,
      description: form.description.trim(),
      createdAt: new Date().toISOString(),
    });
    router.push(`/event/${id}/created`);
  }

  const field = (name: keyof typeof form, label: string, type = "text", rest?: object) => (
    <div>
      <label className="block text-sm font-medium text-fg/80 mb-1.5">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={form[name]}
          onChange={(e) => {
            setForm((f) => ({ ...f, [name]: e.target.value }));
            setErrors((er) => ({ ...er, [name]: "" }));
          }}
          rows={4}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none transition"
          {...rest}
        />
      ) : (
        <input
          type={type}
          value={form[name]}
          onChange={(e) => {
            setForm((f) => ({ ...f, [name]: e.target.value }));
            setErrors((er) => ({ ...er, [name]: "" }));
          }}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
          {...rest}
        />
      )}
      {errors[name] && <p className="mt-1 text-xs text-red-400">{errors[name]}</p>}
    </div>
  );

  return (
    <PageShell>
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold mb-1">イベントを作成</h1>
        <p className="text-muted text-sm mb-8">参加者が繋がれるイベントを設定しましょう。</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {field("name", "イベント名", "text", { placeholder: "例: スタートアップナイト Vol.3" })}
          {field("date", "開催日時", "datetime-local")}
          {field("description", "イベントの説明", "textarea", {
            placeholder: "どんな目的・テーマのイベントですか？",
          })}

          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "作成中..." : "イベントを作成する"}
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
