export default function ScoreBar({ score, max = 20 }: { score: number; max?: number }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  const color =
    pct >= 70
      ? "from-accent to-purple-400"
      : pct >= 40
      ? "from-blue-500 to-accent"
      : "from-muted to-border";

  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums text-accent w-6 text-right">
        {score}
      </span>
    </div>
  );
}
