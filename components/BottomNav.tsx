"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 12L12 4L21 12V20C21 20.552 20.552 21 20 21H15V16C15 15.448 14.552 15 14 15H10C9.448 15 9 15.448 9 16V21H4C3.448 21 3 20.552 3 20V12Z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.6}
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
    </svg>
  );
}

function ExploreIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle
        cx="11" cy="11" r="7.5"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.6}
      />
      <path
        d="M17 17L21 21"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

function MeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12" cy="8" r="4"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.6}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
      <path
        d="M4 20C4 17 7.58 15 12 15C16.42 15 20 17 20 20"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

type Tab = "home" | "explore" | "me";

function getTab(path: string): Tab {
  if (path === "/") return "home";
  if (path === "/me") return "me";
  return "explore";
}

export default function BottomNav() {
  const path = usePathname();
  const active = getTab(path);

  const cls = (tab: Tab) =>
    `flex flex-1 flex-col items-center justify-center gap-[3px] py-2 text-[10px] font-medium tracking-wide transition-colors ${
      active === tab ? "text-accent" : "text-muted"
    }`;

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 border-t border-border bg-bg/95 backdrop-blur-md"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex h-14">
        <Link href="/" className={cls("home")}>
          <HomeIcon active={active === "home"} />
          ホーム
        </Link>
        <Link href="/explore" className={cls("explore")}>
          <ExploreIcon active={active === "explore"} />
          探す
        </Link>
        <Link href="/me" className={cls("me")}>
          <MeIcon active={active === "me"} />
          マイページ
        </Link>
      </div>
    </nav>
  );
}
