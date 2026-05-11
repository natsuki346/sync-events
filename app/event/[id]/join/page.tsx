"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import PageShell from "@/components/PageShell";
import Button from "@/components/Button";
import { storage } from "@/lib/storage";
import { SyncEvent, Phase, Direction, Trait } from "@/lib/types";

const PHASES: Phase[] = ["学生", "休学中", "起業準備中", "起業中", "会社員", "フリーランス"];
const DIRECTIONS: Direction[] = ["起業", "副業", "転職", "スキルアップ", "投資", "その他"];
const TRAITS: Trait[] = ["クリエイティブ", "論理思考", "行動力", "探究心", "コミュニケーション", "リーダーシップ"];

function ToggleChip<T extends string>({
  value,
  selected,
  onClick,
}: {
  value: T;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
        selected
          ? "border-accent bg-accent/20 text-accent"
          : "border-border bg-surface text-fg/60 hover:border-accent/50 hover:text-fg/80"
      }`}
    >
      {value}
    </button>
  );
}

export default function JoinPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<SyncEvent | null>(null);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [phase, setPhase] = useState<Phase | "">("");
  const [directions, setDirections] = useState<Direction[]>([]);
  const [traits, setTraits] = useState<Trait[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ev = storage.getEvent(id);
    setEvent(ev);
    const myId = storage.getMyId(id);
    if (myId) setAlreadyJoined(true);
  }, [id]);

  function toggleDirection(d: Direction) {
    setDirections((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function toggleTrait(t: Trait) {
    setTraits((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function addHashtag() {
    const tag = hashtagInput.replace(/^#/, "").trim();
    if (!tag) return;
    if (hashtags.length >= 5) {
      setErrors((e) => ({ ...e, hashtags: "ハッシュタグは最大5個です" }));
      return;
    }
    if (hashtags.includes(tag)) return;
    setHashtags((prev) => [...prev, tag]);
    setHashtagInput("");
    setErrors((e) => ({ ...e, hashtags: "" }));
  }

  function removeHashtag(tag: string) {
    setHashtags((prev) => prev.filter((t) => t !== tag));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = "表示名を入力してください";
    if (!phase) e.phase = "フェーズを選択してください";
    if (directions.length === 0) e.directions = "1つ以上選択してください";
    if (traits.length === 0) e.traits = "1つ以上選択してください";
    if (hashtags.length < 3) e.hashtags = "ハッシュタグを3〜5個入力してください";
    if (!bio.trim()) e.bio = "自己紹介を入力してください";
    if (bio.length > 100) e.bio = "100文字以内で入力してください";
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
    const participantId = uuidv4();
    storage.saveParticipant({
      id: participantId,
      eventId: id,
      displayName: displayName.trim(),
      phase: phase as Phase,
      directions,
      traits,
      hashtags,
      bio: bio.trim(),
      joinedAt: new Date().toISOString(),
    });
    storage.setMyId(id, participantId);
    router.push(`/event/${id}`);
  }

  if (!event) {
    return (
      <PageShell>
        <p className="text-muted">イベントが見つかりませんでした。</p>
      </PageShell>
    );
  }

  if (alreadyJoined) {
    return (
      <PageShell>
        <div className="text-center">
          <p className="text-fg mb-4">すでにプロフィールを登録済みです。</p>
          <Button onClick={() => router.push(`/event/${id}`)}>参加者一覧へ</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="animate-slide-up">
        <div className="mb-2 text-xs text-muted font-medium uppercase tracking-wider">
          {event.name}
        </div>
        <h1 className="text-2xl font-bold mb-1">プロフィールを登録</h1>
        <p className="text-muted text-sm mb-8">
          あなたの情報をもとに最適な参加者とマッチングします。
        </p>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* 表示名 */}
          <div>
            <label className="block text-sm font-medium text-fg/80 mb-1.5">表示名</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setErrors((er) => ({ ...er, displayName: "" }));
              }}
              placeholder="例: 田中 太郎"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
            />
            {errors.displayName && <p className="mt-1 text-xs text-red-400">{errors.displayName}</p>}
          </div>

          {/* フェーズ */}
          <div>
            <label className="block text-sm font-medium text-fg/80 mb-2">
              今のフェーズ <span className="text-muted font-normal">（1つ選択）</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PHASES.map((p) => (
                <ToggleChip
                  key={p}
                  value={p}
                  selected={phase === p}
                  onClick={() => {
                    setPhase(p);
                    setErrors((er) => ({ ...er, phase: "" }));
                  }}
                />
              ))}
            </div>
            {errors.phase && <p className="mt-1 text-xs text-red-400">{errors.phase}</p>}
          </div>

          {/* 向かっている方向 */}
          <div>
            <label className="block text-sm font-medium text-fg/80 mb-2">
              向かっている方向 <span className="text-muted font-normal">（複数可）</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DIRECTIONS.map((d) => (
                <ToggleChip
                  key={d}
                  value={d}
                  selected={directions.includes(d)}
                  onClick={() => {
                    toggleDirection(d);
                    setErrors((er) => ({ ...er, directions: "" }));
                  }}
                />
              ))}
            </div>
            {errors.directions && <p className="mt-1 text-xs text-red-400">{errors.directions}</p>}
          </div>

          {/* 特性 */}
          <div>
            <label className="block text-sm font-medium text-fg/80 mb-2">
              自分の特性 <span className="text-muted font-normal">（複数可）</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TRAITS.map((t) => (
                <ToggleChip
                  key={t}
                  value={t}
                  selected={traits.includes(t)}
                  onClick={() => {
                    toggleTrait(t);
                    setErrors((er) => ({ ...er, traits: "" }));
                  }}
                />
              ))}
            </div>
            {errors.traits && <p className="mt-1 text-xs text-red-400">{errors.traits}</p>}
          </div>

          {/* ハッシュタグ */}
          <div>
            <label className="block text-sm font-medium text-fg/80 mb-2">
              自由ハッシュタグ <span className="text-muted font-normal">（3〜5個）</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHashtag();
                  }
                }}
                placeholder="#キーワードを入力してEnter"
                className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={addHashtag}>
                追加
              </Button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-sm text-accent"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="ml-0.5 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.hashtags && <p className="mt-1 text-xs text-red-400">{errors.hashtags}</p>}
          </div>

          {/* 一言自己紹介 */}
          <div>
            <label className="block text-sm font-medium text-fg/80 mb-1.5">
              一言自己紹介
              <span className={`ml-2 text-xs font-normal ${bio.length > 100 ? "text-red-400" : "text-muted"}`}>
                {bio.length}/100
              </span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                setErrors((er) => ({ ...er, bio: "" }));
              }}
              rows={3}
              placeholder="どんな人か、何を求めているかを教えてください。"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none transition"
            />
            {errors.bio && <p className="mt-1 text-xs text-red-400">{errors.bio}</p>}
          </div>

          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "登録中..." : "プロフィールを登録してマッチングへ"}
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
