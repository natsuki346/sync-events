"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

export default function NavBar() {
  const path = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-bg/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <Logo />
      <nav className="flex items-center gap-1">
        <Link
          href="/"
          className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
            path === "/"
              ? "text-fg font-medium bg-surface2"
              : "text-muted hover:text-fg hover:bg-surface2"
          }`}
        >
          イベント
        </Link>
        <Link
          href="/me"
          className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
            path === "/me"
              ? "text-fg font-medium bg-surface2"
              : "text-muted hover:text-fg hover:bg-surface2"
          }`}
        >
          マイページ
        </Link>
      </nav>
    </header>
  );
}
