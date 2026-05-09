// StatusDot — small ● + uppercase-tracked label used in card headers
// to communicate"live","draft","open", etc. Five variants:
// live green — running, online, healthy
// active blue — in progress, focus
// warn amber — needs attention
// error red — failed, blocked
// muted zinc — idle, neutral, draft
//
// Distinct from StatusPill — StatusDot is for the header (high
// chrome, low ink) while StatusPill is for inline content rows
// (mid chrome, mid ink).

import type { ReactNode } from "react";

export type StatusDotVariant = "live" |"active" |"warn" |"error" |"muted";

interface StatusDotProps {
 children: ReactNode;
 variant?: StatusDotVariant;
}

const dotClass: Record<StatusDotVariant, string> = {
 live: "bg-success",
 active: "bg-accent",
 warn: "bg-warn",
 error: "bg-error",
 muted: "bg-zinc-400 dark:bg-zinc-500",
};

const textClass: Record<StatusDotVariant, string> = {
 live: "text-success",
 active: "text-blue-700 dark:text-blue-400",
 warn: "text-warn",
 error: "text-error",
 muted: "text-text-dim",
};

export function StatusDot({ children, variant = "muted" }: StatusDotProps) {
 return (
 <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider ${textClass[variant]}`}>
 <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotClass[variant]}`} />
 {children}
 </span>
 );
}
