// KPI — single-stat tile. Atomic unit of every dashboard strip
// (pipeline, MRR, stars-this-week, …). Big tabular numerals as the
// headline, label above, optional delta + caption below.
//
// Composes left-to-right inside a flex container; the consumer picks
// gap and divider styling. min-width on the tile keeps narrow values
// (single-digit counts) from looking awkwardly small next to dense
// ones.

import type { ReactNode } from "react";

export type KPITone = "neutral" |"positive" |"negative" |"accent";

interface KPIProps {
 /** Short label above the value — e.g."Pipeline" or"Open deals". */
 label: ReactNode;
 /** The headline number/string. Pre-formatted by the caller. */
 value: ReactNode;
 /** Optional secondary line under the value — typically a delta
 * ("+3 this week"). */
 delta?: ReactNode;
 /** Color for the delta line. Default neutral. */
 tone?: KPITone;
 /** Optional caption below delta — currency, scope, etc. */
 caption?: ReactNode;
}

const toneClass: Record<KPITone, string> = {
 neutral: "text-text-dim",
 positive: "text-green-600 dark:text-success",
 negative: "text-red-600 dark:text-error",
 accent: "text-blue-600 dark:text-accent",
};

export function KPI({ label, value, delta, tone = "neutral", caption }: KPIProps) {
 return (
 <div className="flex flex-col gap-1 min-w-[72px]">
 <span className="text-[11px] uppercase tracking-wider font-medium text-text-dim truncate">
 {label}
 </span>
 <span className="text-xl font-semibold text-text tabular-nums leading-none">
 {value}
 </span>
 {delta !== undefined && (
 <span className={`text-xs font-medium tabular-nums ${toneClass[tone]} truncate`}>{delta}</span>
 )}
 {caption !== undefined && (
 <span className="text-xs text-text-dim tabular-nums truncate">{caption}</span>
 )}
 </div>
 );
}
