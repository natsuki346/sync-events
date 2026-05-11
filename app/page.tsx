import Link from "next/link";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col">
      <header className="border-b border-border/50 px-6 py-4">
        <Logo />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="animate-slide-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            イベント参加者マッチング
          </div>

          <h1 className="mb-4 text-5xl font-bold tracking-tight">
            SYNC<span className="text-accent">.</span>
            <br />
            <span className="text-fg/60 text-3xl font-medium">for Events</span>
          </h1>

          <p className="mb-10 max-w-md text-lg text-muted leading-relaxed">
            イベントで出会うべき人と、つながる。
            <br />
            プロフィールをもとに最適な参加者をマッチング。
          </p>

          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-accent-hover hover:scale-105 active:scale-100"
          >
            イベントを作成する
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm7.75-4.25a.75.75 0 0 0-1.5 0V7h-3.5a.75.75 0 0 0 0 1.5h3.5v3.25a.75.75 0 0 0 1.5 0V8.5h3.25a.75.75 0 0 0 0-1.5H8.75V3.75z"
              />
            </svg>
          </Link>
        </div>
      </main>

      <footer className="border-t border-border/30 px-6 py-4 text-center text-xs text-muted">
        SYNC. for Events — powered by localStorage
      </footer>
    </div>
  );
}
