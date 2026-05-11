"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import { storage } from "@/lib/storage";
import {
  MyProfile,
  SyncEvent,
  Participant,
  TalkRequest,
  Phase,
  Direction,
  Trait,
} from "@/lib/types";

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
      className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all active:scale-95 ${
        selected
          ? "border-accent bg-accent/20 text-accent"
          : "border-border bg-surface text-fg/60"
      }`}
    >
      {value}
    </button>
  );
}

interface ReceivedRequest {
  request: TalkRequest;
  event: SyncEvent;
  from: Participant;
}

export default function MyPage() {
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [received, setReceived] = useState<ReceivedRequest[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [displayName, setDisplayName] = useState("");
  const [phase, setPhase] = useState<Phase | "">("");
  const [directions, setDirections] = useState<Direction[]>([]);
  const [traits, setTraits] = useState<Trait[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function loadData() {
    const p = storage.getMyProfile();
    setProfile(p);

    if (p) {
      const eventIds = storage.getJoinedEventIds();
      const allReceived: ReceivedRequest[] = [];
      for (const eid of eventIds) {
        const ev = storage.getEvent(eid);
        if (!ev) continue;
        const reqs = storage.getRequestsTo(eid, p.id);
        for (const req of reqs) {
          const from = storage.getParticipant(eid, req.fromId);
          if (from) allReceived.push({ request: req, event: ev, from });
        }
      }
      allReceived.sort(
        (a, b) =>
          new Date(b.request.createdAt).getTime() -
          new Date(a.request.createdAt).getTime()
      );
      setReceived(allReceived);
    }
  }

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function startEditing() {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setPhase(profile.phase);
    setDirections(profile.directions);
    setTraits(profile.traits);
    setHashtags(profile.hashtags);
    setBio(profile.bio);
    setErrors({});
    setIsEditing(true);
  }

  function addHashtag() {
    const tag = hashtagInput.replace(/^#/, "").trim();
    if (!tag) return;
    if (hashtags.length >= 5) { setErrors((e) => ({ ...e, hashtags: "最大5個です" })); return; }
    if (hashtags.includes(tag)) return;
    setHashtags((p) => [...p, tag]);
    setHashtagInput("");
    setErrors((e) => ({ ...e, hashtags: "" }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!displayName.trim()) errs.displayName = "表示名を入力してください";
    if (!phase) errs.phase = "フェーズを選択してください";
    if (directions.length === 0) errs.directions = "1つ以上選択してください";
    if (traits.length === 0) errs.traits = "1つ以上選択してください";
    if (hashtags.length < 3) errs.hashtags = "3〜5個入力してください";
    if (!bio.trim()) errs.bio = "自己紹介を入力してください";
    if (bio.length > 100) errs.bio = "100文字以内で入力してください";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const updated: MyProfile = {
      id: profile!.id,
      displayName: displayName.trim(),
      phase: phase as Phase,
      directions,
      traits,
      hashtags,
      bio: bio.trim(),
    };
    storage.saveMyProfile(updated);
    setProfile(updated);
    setIsEditing(false);
  }

  return (
    <div className="min-h-screen text-fg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md px-4 py-4 border-b border-border/50 flex items-center justify-between">
        <h1 className="text-[17px] font-bold">マイページ</h1>
        {profile && !isEditing && (
          <Button variant="outline" size="sm" onClick={startEditing}>
            編集
          </Button>
        )}
      </header>

      <main className="px-4 py-5 space-y-6">
        {!profile ? (
          /* No profile state */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface border border-border">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b6b80" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-base font-semibold mb-1.5">プロフィール未登録</h2>
            <p className="text-sm text-muted mb-6 max-w-[220px] leading-relaxed">
              イベントに参加登録するとプロフィールが作成されます。
            </p>
            <Link href="/explore">
              <Button>イベントを探す</Button>
            </Link>
          </div>
        ) : !isEditing ? (
          /* Profile view */
          <>
            <section>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-lg">
                    {profile.displayName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-[16px] text-fg">{profile.displayName}</div>
                    <div className="text-sm text-muted">{profile.phase}</div>
                  </div>
                </div>
                <p className="text-sm text-fg/70 mb-4 leading-relaxed">{profile.bio}</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] text-muted uppercase tracking-wider font-medium mb-1.5">
                      向かっている方向
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.directions.map((d) => <Badge key={d} variant="accent">{d}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted uppercase tracking-wider font-medium mb-1.5">
                      特性
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.traits.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted uppercase tracking-wider font-medium mb-1.5">
                      ハッシュタグ
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.hashtags.map((h) => (
                        <span key={h} className="text-sm text-accent">#{h}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Received requests */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[13px] font-semibold text-fg/60 uppercase tracking-wider">
                  もらった「話したい」
                </h2>
                {received.length > 0 && (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold">
                    {received.length}
                  </span>
                )}
              </div>

              {received.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                  <p className="text-muted text-sm">まだリクエストはありません。</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {received.map(({ request, event: ev, from }) => (
                    <div key={request.id} className="rounded-2xl border border-accent/25 bg-accent/5 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-sm">
                          {from.displayName[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="font-semibold text-[15px] text-fg truncate">
                              {from.displayName}
                            </span>
                          </div>
                          <div className="text-xs text-muted mb-1">{from.phase} · {ev.name}</div>
                          <p className="text-sm text-fg/60 line-clamp-2 mb-2">{from.bio}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {from.directions.map((d) => <Badge key={d} variant="accent">{d}</Badge>)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          /* Edit form */
          <form onSubmit={handleSave} className="space-y-6 animate-slide-up">
            <div>
              <label className="block text-sm font-medium text-fg/80 mb-1.5">表示名</label>
              <input
                type="text" value={displayName}
                onChange={(e) => { setDisplayName(e.target.value); setErrors((er) => ({ ...er, displayName: "" })); }}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-[15px] text-fg focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
              />
              {errors.displayName && <p className="mt-1 text-xs text-red-400">{errors.displayName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-fg/80 mb-2">フェーズ</label>
              <div className="flex flex-wrap gap-2">
                {PHASES.map((p) => <Chip key={p} value={p} selected={phase === p}
                  onClick={() => { setPhase(p); setErrors((er) => ({ ...er, phase: "" })); }} />)}
              </div>
              {errors.phase && <p className="mt-1 text-xs text-red-400">{errors.phase}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-fg/80 mb-2">向かっている方向</label>
              <div className="flex flex-wrap gap-2">
                {DIRECTIONS.map((d) => <Chip key={d} value={d} selected={directions.includes(d)}
                  onClick={() => { setDirections((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]); setErrors((er) => ({ ...er, directions: "" })); }} />)}
              </div>
              {errors.directions && <p className="mt-1 text-xs text-red-400">{errors.directions}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-fg/80 mb-2">特性</label>
              <div className="flex flex-wrap gap-2">
                {TRAITS.map((t) => <Chip key={t} value={t} selected={traits.includes(t)}
                  onClick={() => { setTraits((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]); setErrors((er) => ({ ...er, traits: "" })); }} />)}
              </div>
              {errors.traits && <p className="mt-1 text-xs text-red-400">{errors.traits}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-fg/80 mb-2">ハッシュタグ（3〜5個）</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text" value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHashtag(); } }}
                  placeholder="#キーワード"
                  className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-[14px] text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
                />
                <Button type="button" variant="outline" size="sm" onClick={addHashtag}>追加</Button>
              </div>
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-sm text-accent">
                      #{tag}
                      <button type="button" onClick={() => setHashtags((p) => p.filter((t) => t !== tag))} className="ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              )}
              {errors.hashtags && <p className="mt-1 text-xs text-red-400">{errors.hashtags}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-fg/80 mb-1.5">
                一言自己紹介
                <span className={`ml-2 text-xs font-normal ${bio.length > 100 ? "text-red-400" : "text-muted"}`}>
                  {bio.length}/100
                </span>
              </label>
              <textarea
                value={bio} onChange={(e) => { setBio(e.target.value); setErrors((er) => ({ ...er, bio: "" })); }}
                rows={3}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-[15px] text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none transition"
              />
              {errors.bio && <p className="mt-1 text-xs text-red-400">{errors.bio}</p>}
            </div>

            <div className="flex gap-3">
              <Button type="submit" size="md" className="flex-1">保存する</Button>
              <Button type="button" variant="outline" size="md" onClick={() => setIsEditing(false)}>
                キャンセル
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
