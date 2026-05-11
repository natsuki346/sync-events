"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import { storage } from "@/lib/storage";
import { MyProfile, SyncEvent, Participant, TalkRequest, Phase, Direction, Trait } from "@/lib/types";

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
          : "border-border bg-surface text-fg/60 hover:border-accent/50"
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
  const [joinedEvents, setJoinedEvents] = useState<SyncEvent[]>([]);
  const [received, setReceived] = useState<ReceivedRequest[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Edit state
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

    const eventIds = storage.getJoinedEventIds();
    const evs = eventIds
      .map((id) => storage.getEvent(id))
      .filter((e): e is SyncEvent => !!e)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setJoinedEvents(evs);

    if (p) {
      const allReceived: ReceivedRequest[] = [];
      for (const ev of evs) {
        const reqs = storage.getRequestsTo(ev.id, p.id);
        for (const req of reqs) {
          const from = storage.getParticipant(ev.id, req.fromId);
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

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    setHashtags((prev) => [...prev, tag]);
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

  if (!profile) {
    return (
      <PageShell>
        <div className="text-center py-16 animate-fade-in">
          <div className="mb-4 text-3xl opacity-30">👤</div>
          <h1 className="text-xl font-bold mb-2">プロフィール未登録</h1>
          <p className="text-muted text-sm mb-6">
            イベントに参加登録するとプロフィールが作成されます。
          </p>
          <Link href="/">
            <Button>イベントを探す</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="animate-slide-up space-y-8">
        {/* ─── Profile ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">マイプロフィール</h1>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={startEditing}>
                編集
              </Button>
            )}
          </div>

          {!isEditing ? (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-lg">
                  {profile.displayName[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-lg text-fg">{profile.displayName}</div>
                  <div className="text-sm text-muted">{profile.phase}</div>
                </div>
              </div>
              <p className="text-sm text-fg/70 mb-4 leading-relaxed">{profile.bio}</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider font-medium mb-1.5">向かっている方向</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.directions.map((d) => <Badge key={d} variant="accent">{d}</Badge>)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider font-medium mb-1.5">特性</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.traits.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider font-medium mb-1.5">ハッシュタグ</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.hashtags.map((h) => (
                      <span key={h} className="text-sm text-accent">#{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="rounded-2xl border border-accent/30 bg-surface p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-fg/80 mb-1.5">表示名</label>
                <input type="text" value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); setErrors((er) => ({ ...er, displayName: "" })); }}
                  className="w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
                />
                {errors.displayName && <p className="mt-1 text-xs text-red-400">{errors.displayName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-fg/80 mb-2">フェーズ</label>
                <div className="flex flex-wrap gap-2">
                  {PHASES.map((p) => <Chip key={p} value={p} selected={phase === p} onClick={() => { setPhase(p); setErrors((er) => ({ ...er, phase: "" })); }} />)}
                </div>
                {errors.phase && <p className="mt-1 text-xs text-red-400">{errors.phase}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-fg/80 mb-2">向かっている方向</label>
                <div className="flex flex-wrap gap-2">
                  {DIRECTIONS.map((d) => <Chip key={d} value={d} selected={directions.includes(d)}
                    onClick={() => { setDirections((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]); setErrors((er) => ({ ...er, directions: "" })); }} />)}
                </div>
                {errors.directions && <p className="mt-1 text-xs text-red-400">{errors.directions}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-fg/80 mb-2">特性</label>
                <div className="flex flex-wrap gap-2">
                  {TRAITS.map((t) => <Chip key={t} value={t} selected={traits.includes(t)}
                    onClick={() => { setTraits((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]); setErrors((er) => ({ ...er, traits: "" })); }} />)}
                </div>
                {errors.traits && <p className="mt-1 text-xs text-red-400">{errors.traits}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-fg/80 mb-2">ハッシュタグ（3〜5個）</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHashtag(); } }}
                    placeholder="#キーワード"
                    className="flex-1 rounded-xl border border-border bg-surface2 px-4 py-2.5 text-sm text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
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

              <div>
                <label className="block text-sm font-medium text-fg/80 mb-1.5">
                  一言自己紹介
                  <span className={`ml-2 text-xs font-normal ${bio.length > 100 ? "text-red-400" : "text-muted"}`}>{bio.length}/100</span>
                </label>
                <textarea value={bio} onChange={(e) => { setBio(e.target.value); setErrors((er) => ({ ...er, bio: "" })); }}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-fg placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none transition"
                />
                {errors.bio && <p className="mt-1 text-xs text-red-400">{errors.bio}</p>}
              </div>

              <div className="flex gap-3">
                <Button type="submit" size="md" className="flex-1">保存する</Button>
                <Button type="button" variant="outline" size="md" onClick={() => setIsEditing(false)}>キャンセル</Button>
              </div>
            </form>
          )}
        </section>

        {/* ─── Joined Events ── */}
        <section>
          <h2 className="text-base font-semibold mb-3">
            参加中のイベント
            <span className="ml-2 text-sm font-normal text-muted">
              {joinedEvents.length}件
            </span>
          </h2>
          {joinedEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
              <p className="text-muted text-sm mb-3">まだ参加したイベントがありません。</p>
              <Link href="/"><Button variant="outline" size="sm">イベントを探す</Button></Link>
            </div>
          ) : (
            <div className="space-y-2">
              {joinedEvents.map((ev) => (
                <Link key={ev.id} href={`/event/${ev.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 hover:border-accent/40 transition-all group">
                  <div>
                    <div className="text-sm font-medium text-fg group-hover:text-accent transition-colors">{ev.name}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {new Date(ev.date).toLocaleString("ja-JP", { month: "short", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted group-hover:text-accent transition-colors">
                    <polyline points="5 1 11 7 5 13" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ─── Received Requests ── */}
        <section>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            もらった「話したい」
            {received.length > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-[11px] font-bold">
                {received.length}
              </span>
            )}
          </h2>
          {received.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
              <p className="text-muted text-sm">まだリクエストはありません。</p>
            </div>
          ) : (
            <div className="space-y-3">
              {received.map(({ request, event: ev, from }) => (
                <div key={request.id} className="rounded-2xl border border-accent/25 bg-accent/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-sm">
                      {from.displayName[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-medium text-fg">{from.displayName}</span>
                        <span className="text-xs text-muted">{ev.name}</span>
                      </div>
                      <div className="text-xs text-muted mb-1.5">{from.phase}</div>
                      <p className="text-sm text-fg/65 line-clamp-2">{from.bio}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {from.directions.map((d) => <Badge key={d} variant="accent">{d}</Badge>)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
