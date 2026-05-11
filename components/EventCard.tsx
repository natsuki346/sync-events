import Link from "next/link";
import { SyncEvent } from "@/lib/types";
import { getEventGradient, formatShortDate } from "@/lib/utils";

interface EventCardProps {
  event: SyncEvent;
  participantCount: number;
  hasJoined?: boolean;
}

export default function EventCard({
  event,
  participantCount,
  hasJoined = false,
}: EventCardProps) {
  return (
    <Link href={`/event/${event.id}`} className="block group">
      <article className="rounded-2xl border border-border bg-surface overflow-hidden transition-all duration-200 hover:border-accent/50 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30">
        {/* Gradient banner */}
        <div
          className="h-28 w-full"
          style={{ background: getEventGradient(event.id) }}
        />

        <div className="p-5">
          <h3 className="font-semibold text-base text-fg line-clamp-1 mb-1 group-hover:text-accent transition-colors">
            {event.name}
          </h3>
          <p className="text-xs text-muted mb-2">{formatShortDate(event.date)}</p>
          <p className="text-sm text-fg/55 line-clamp-2 leading-relaxed mb-4">
            {event.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/20 text-accent text-[10px] font-bold">
                {participantCount}
              </span>
              <span>人参加中</span>
            </div>
            {hasJoined && (
              <span className="text-xs text-accent font-medium">参加済み ✓</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
