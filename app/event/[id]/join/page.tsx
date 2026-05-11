"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import { storage } from "@/lib/storage";
import { SyncEvent, MyProfile, Phase, Direction, Trait } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

const PHASES: Phase[] = ["学生", "休学中", "起業準備中", "起業中", "会社員", "フリーランス"];
const DIRECTIONS: Direction[] = ["起業", "副業", "転職", "スキルアップ", "投資", "その他"];
const TRAITS: Trait[] = ["クリエイティブ", "論理思考", "行動力", "探究心", "コミュニケーション", "リーダーシップ"];

function Chip<T extends string>({
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

// ─── Full Profile Form ─────────────────────────────────────────────────────────

function ProfileForm({
  initialValues,
  onSubmit,
  submitLabel,
  loading,
}: {
  initialValues: Partial<MyProfile>;
  onSubmit: (values: Omit<MyProfile, "id">) => void;
  submitLabel: string;
  loading: boolean;
}) {
  const [displayName, setDisplayName] = useState(initialValues.displayName ?? "");
  const [phase, setPhase] = useState<Phase | "">(initialValues.phase ?? "");
  const [directions, setDirections] = useState<Direction[]>(initialValues.directions ?? []);
  const [traits, setTraits] = useState<Trait[]>(initialValues.traits ?? []);
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>(initialValues.hashtags ?? []);
  const [bio, setBio] = useState(initialValues.bio ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function addHashtag() {
    const tag = hashtagInput.replace(/^#/, "").trim();
    if (!tag) return;
    if (hashtags.length >= 5) {
      setErrors((e) => ({ ...e, hashtags: "最大5個です" }));
      return;
    }
    if (hashtags.includes(tag)) return;
    setHashtags((prev) => [...prev, tag]);
    setHashtagInput("");
    setErrors((e) => ({ ...e, hashtags: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = "表示名を入力してください";
    if (!phase) e.phase = "フェーズを選択してください";
    if (directions.length === 0) e.directions = "1つ以上選択してください";
    if (traits.length === 0) e.traits = "1つ以上選択してください";
    if (hashtags.length < 3) e.hashtags = "3〜5個入力してください";
    if (!bio.trim()) e.bio = "自己紹介を入力してください";
    if (bio.length > 100) e.bio = "100文字以内で入力してください";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({ displayName: displayName.trim(), phase: phase as Phase, directions, traits, hashtags, bio: bio.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 表示名 */}
      <div>
        <label className="block text-sm font-medium text-fg/80 mb-1.5">表示名</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => { setDisplayName(e.target.value); setErrors((er) => ({ ...er, displayName: "" })); }}
          placeholder="例: 田中 太郎"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
        />
        {errors.displayName && <p className="mt-1 text-xs text-red-400">{errors.displayName}</p>}
      </div>

      {/* フェーズ */}
      <div>
        <label className="block text-sm font-medium text-fg/80 mb-2">
          今のフェーズ <span className="text-muted font-normal">（1つ）</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PHASES.map((p) => (
            <Chip key={p} value={p} selected={phase === p}
              onClick={() => { setPhase(p); setErrors((er) => ({ ...er, phase: "" })); }} />
          ))}
        </div>
        {errors.phase && <p className="mt-1 text-xs text-red-400">{errors.phase}</p>}
      </div>

      {/* 方向 */}
      <div>
        <label className="block text-sm font-medium text-fg/80 mb-2">
          向かっている方向 <span className="text-muted font-normal">（複数可）</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {DIRECTIONS.map((d) => (
            <Chip key={d} value={d} selected={directions.includes(d)}
              onClick={() => {
                setDirections((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
                setErrors((er) => ({ ...er, directions: "" }));
              }} />
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
            <Chip key={t} value={t} selected={traits.includes(t)}
              onClick={() => {
                setTraits((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
                setErrors((er) => ({ ...er, traits: "" }));
              }} />
          ))}
        </div>
        {errors.traits && <p className="mt-1 text-xs text-red-400">{errors.traits}</p>}
      </div>

      {/* ハッシュタグ */}
      <div>
        <label className="block text-sm font-medium text-fg/80 mb-2">
          ハッシュタグ <span className="text-muted font-normal">（3〜5個）</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text" value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHashtag(); } }}
            placeholder="#キーワードを入力してEnter"
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
          />
          <Button type="button" variant="outline" size="sm" onClick={addHashtag}>追加</Button>
        </div>
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-sm text-accent">
                #{tag}
                <button type="button" onClick={() => setHashtags((prev) => prev.filter((t) => t !== tag))} className="hover:text-white ml-0.5">×</button>
              </span>
            ))}
          </div>
        )}
        {errors.hashtags && <p className="mt-1 text-xs text-red-400">{errors.hashtags}</p>}
      </div>

      {/* 自己紹介 */}
      <div>
        <label className="block text-sm font-medium text-fg/80 mb-1.5">
          一言自己紹介
          <span className={`ml-2 text-xs font-normal ${bio.length > 100 ? "text-red-400" : "text-muted"}`}>
            {bio.length}/100
          </span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => { setBio(e.target.value); setErrors((er) => ({ ...er, bio: "" })); }}
          rows={3}
          placeholder="どんな人か、何を求めているかを教えてください。"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none transition"
        />
        {errors.bio && <p className="mt-1 text-xs text-red-400">{errors.bio}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "登録中..." : submitLabel}
      </Button>
    </form>
  );
}

// ─── Join Page ────────────────────────────────────────────────────────────────

export default function JoinPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<SyncEvent | null>(null);
  const [existingProfile, setExistingProfile] = useState<MyProfile | null>(null);
  const [mode, setMode] = useState<"quick" | "form">("quick");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ev = storage.getEvent(id);
    setEvent(ev);
    if (storage.hasJoined(id)) { router.replace(`/event/${id}`); return; }
    const profile = storage.getMyProfile();
    setExistingProfile(profile);
    if (!profile) setMode("form");
  }, [id, router]);

  function doJoin(values: Omit<MyProfile, "id">) {
    setLoading(true);
    const profileId = existingProfile?.id ?? uuidv4();
    const profile: MyProfile = { id: profileId, ...values };
    storage.saveMyProfile(profile);
    storage.saveParticipant({
      id: profileId,
      eventId: id,
      ...values,
      joinedAt: new Date().toISOString(),
    });
    storage.addJoinedEventId(id);
    router.push(`/event/${id}`);
  }

  if (!event) {
    return (
      <PageShell>
        <p className="text-muted">イベントが見つかりませんでした。</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="animate-slide-up">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-fg mb-6 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 1 3 7 9 13" />
          </svg>
          戻る
        </button>

        <div className="text-xs text-muted font-medium uppercase tracking-wider mb-2">
          {event.name}
        </div>
        <h1 className="text-2xl font-bold mb-1">参加登録</h1>
        <p className="text-sm text-muted mb-8">
          プロフィールをもとに参加者とマッチングします。
        </p>

        {/* Quick join (existing profile) */}
        {existingProfile && mode === "quick" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs text-muted font-medium uppercase tracking-wider mb-3">
                登録済みプロフィール
              </p>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent font-bold">
                  {existingProfile.displayName[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-fg">{existingProfile.displayName}</div>
                  <div className="text-xs text-muted">{existingProfile.phase}</div>
                </div>
              </div>
              <p className="text-sm text-fg/65 mb-3">{existingProfile.bio}</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {existingProfile.directions.map((d) => <Badge key={d} variant="accent">{d}</Badge>)}
                {existingProfile.traits.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
              </div>
              <div className="flex flex-wrap gap-2">
                {existingProfile.hashtags.map((h) => (
                  <span key={h} className="text-xs text-muted">#{h}</span>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={loading}
              onClick={() => doJoin({
                displayName: existingProfile.displayName,
                phase: existingProfile.phase,
                directions: existingProfile.directions,
                traits: existingProfile.traits,
                hashtags: existingProfile.hashtags,
                bio: existingProfile.bio,
              })}
            >
              {loading ? "登録中..." : "このプロフィールで参加する"}
            </Button>

            <button
              type="button"
              onClick={() => setMode("form")}
              className="w-full text-sm text-muted hover:text-fg text-center py-1 transition-colors"
            >
              プロフィールを編集して参加 →
            </button>
          </div>
        )}

        {/* Full form */}
        {mode === "form" && (
          <ProfileForm
            initialValues={existingProfile ?? {}}
            onSubmit={doJoin}
            submitLabel={
              existingProfile
                ? "プロフィールを更新して参加する"
                : "プロフィールを登録してマッチングへ"
            }
            loading={loading}
          />
        )}
      </div>
    </PageShell>
  );
}
