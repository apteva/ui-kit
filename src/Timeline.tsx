// Timeline — vertical event list with date grouping and a per-event
// color bar. Used by activity-feed (HubSpot engagements), and any
// future Slack/Linear/Stripe activity surfaces.
//
// Events arrive flat with an ISO timestamp; the component groups by
// local date, renders a sticky-ish day header, then each event as a
// row with leading icon + title + subtitle + relative time.

import type { ReactNode } from "react";

export type TimelineTone = "neutral" | "info" | "success" | "warn" | "error" | "accent";

export interface TimelineEvent {
  id: string;
  /** ISO timestamp. */
  timestamp: string;
  /** Short tone tag — drives the color bar. */
  tone?: TimelineTone;
  /** Optional leading icon / avatar. */
  icon?: ReactNode;
  /** Primary line. */
  title: ReactNode;
  /** Secondary line. */
  subtitle?: ReactNode;
  /** Optional click-through URL. */
  href?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  /** Limit rendered events; show "+N more" footer when exceeded. */
  max?: number;
  emptyLabel?: string;
}

const barClass: Record<TimelineTone, string> = {
  neutral: "bg-text-dim",
  info: "bg-info",
  success: "bg-success",
  warn: "bg-warn",
  error: "bg-error",
  accent: "bg-accent",
};

function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

function dayLabel(key: string): string {
  const d = new Date(key + "T00:00:00");
  if (Number.isNaN(d.getTime())) return key;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return d.toLocaleDateString("en-US", { weekday: "long" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function Timeline({ events, max, emptyLabel = "No activity yet." }: TimelineProps) {
  if (events.length === 0) {
    return <div className="px-3 py-3 text-[11px] text-text-dim">{emptyLabel}</div>;
  }

  const limited = typeof max === "number" ? events.slice(0, max) : events;
  const overflow = events.length - limited.length;

  // Group by local day, preserving order of first occurrence.
  const groups: { key: string; events: TimelineEvent[] }[] = [];
  for (const ev of limited) {
    const k = dayKey(ev.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.key === k) last.events.push(ev);
    else groups.push({ key: k, events: [ev] });
  }

  return (
    <div className="flex flex-col">
      {groups.map((g) => (
        <div key={g.key} className="flex flex-col">
          <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-text-dim">
            {dayLabel(g.key)}
          </div>
          {g.events.map((ev) => {
            const tone: TimelineTone = ev.tone ?? "neutral";
            const inner = (
              <>
                <span className={`w-0.5 self-stretch flex-shrink-0 rounded-full ${barClass[tone]}`} />
                {ev.icon !== undefined && (
                  <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-text-muted">
                    {ev.icon}
                  </span>
                )}
                <div className="min-w-0 flex-1 flex flex-col">
                  <div className="text-text text-xs truncate">{ev.title}</div>
                  {ev.subtitle !== undefined && (
                    <div className="text-text-dim text-[10px] truncate">{ev.subtitle}</div>
                  )}
                </div>
                <span className="flex-shrink-0 text-[10px] text-text-dim tabular-nums">
                  {timeLabel(ev.timestamp)}
                </span>
              </>
            );
            const cls = "flex items-center gap-2 px-3 py-1.5 hover:bg-bg-input/40 transition-colors";
            return ev.href ? (
              <a key={ev.id} href={ev.href} target="_blank" rel="noopener" className={cls} onClick={(e) => e.stopPropagation()}>
                {inner}
              </a>
            ) : (
              <div key={ev.id} className={cls}>{inner}</div>
            );
          })}
        </div>
      ))}
      {overflow > 0 && (
        <div className="px-3 py-1.5 text-[10px] text-text-dim border-t border-border">
          +{overflow} more
        </div>
      )}
    </div>
  );
}
