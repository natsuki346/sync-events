import Logo from "./Logo";

export default function PageShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border/50 px-6 py-4">
        <Logo />
      </header>
      <main className={`mx-auto max-w-2xl px-4 py-10 ${className}`}>
        {children}
      </main>
    </div>
  );
}
