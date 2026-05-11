import NavBar from "./NavBar";

export default function PageShell({
  children,
  maxWidth = "max-w-2xl",
}: {
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <NavBar />
      <main className={`mx-auto ${maxWidth} px-4 py-10`}>{children}</main>
    </div>
  );
}
