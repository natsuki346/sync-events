import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "SYNC. for Events",
  description: "イベント参加者マッチングアプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="bg-bg antialiased">
        {/* Mobile container: 430px centered */}
        <div className="mx-auto w-full max-w-[430px] min-h-screen bg-bg">
          <div className="pb-[72px]">{children}</div>
        </div>
        {/* Fixed bottom nav, self-centered via CSS */}
        <BottomNav />
      </body>
    </html>
  );
}
