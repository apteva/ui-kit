// KPI — single-stat tile. The atomic unit of every dashboard strip
// (pipeline-strip, MRR, stars-this-week, etc.). Big tabular-nums
// value, muted label above, optional delta below the value.
//
// Composes left-to-right inside a flex container; the consumer picks
// gap and divider styling.

import type { ReactNode } from "react";

export type KPITone = "neutral" | "positive" | "negative" | "accent";

interface KPIProps {
  /** Short label above the value, e.g. "Pipeline" or "Open deals". */
  label: ReactNode;
  /** The headline number/string. Pre-formatted by the caller. */
  value: ReactNode;
  /** Optional secondary line under the value — typically a delta
   *  ("+3 this week"). */
  delta?: ReactNode;
  /** Color for the delta line. Default neutral. */
  tone?: KPITone;
  /** Optional caption below delta — currency, scope, etc. */
  caption?: ReactNode;
}

const toneClass: Record<KPITone, string> = {
  neutral: "text-text-dim",
  positive: "text-success",
  negative: "text-error",
  accent: "text-accent",
};

export function KPI({ label, value, delta, tone = "neutral", caption }: KPIProps) {
  return (
    <div className="flex flex-col gap-0.5 min-w-[64px]">
      <span className="text-[10px] uppercase tracking-wide text-text-dim truncate">{label}</span>
      <span className="text-base font-semibold text-text tabular-nums leading-tight">{value}</span>
      {delta !== undefined && (
        <span className={`text-[11px] ${toneClass[tone]} truncate`}>{delta}</span>
      )}
      {caption !== undefined && (
        <span className="text-[10px] text-text-dim truncate">{caption}</span>
      )}
    </div>
  );
}
