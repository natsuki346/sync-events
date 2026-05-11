export default function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "accent" | "outline" | "self";
}) {
  const styles = {
    default: "bg-surface2 text-fg/70 border border-border",
    accent: "bg-accent/20 text-accent border border-accent/40",
    outline: "bg-transparent text-muted border border-border",
    self: "bg-accent text-white border border-accent",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
