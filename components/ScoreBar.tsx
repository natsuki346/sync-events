export default function ScoreBar({
  score,
  max = 20,
  unknown = false,
}: {
  score?: number;
  max?: number;
  unknown?: boolean;
}) {
  if (unknown) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-border" />
        <span className="text-xs font-semibold text-muted w-5 text-right">?</span>
      </div>
    );
  }

  const pct = Math.min(100, Math.round(((score ?? 0) / max) * 100));
  const color =
    pct >= 70
      ? "from-accent to-purple-400"
      : pct >= 40
      ? "from-blue-500 to-accent"
      : "from-muted to-border";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums text-accent w-5 text-right">
        {score}
      </span>
    </div>
  );
}
