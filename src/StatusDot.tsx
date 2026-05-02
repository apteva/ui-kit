// StatusDot — a small ● + label pair used in card headers to convey
// "live", "draft", "open", etc. Variants map to the existing palette
// tokens (--success, --warn, --error, --info, --text-dim) so a
// status's color shifts naturally between light and dark themes.

import type { ReactNode } from "react";

export type StatusDotVariant =
  | "live"     // success / green — running, online, healthy
  | "active"   // accent / brand — in-progress, currently selected
  | "warn"     // warn / yellow — needs attention
  | "error"    // error / red — failed, blocked
  | "muted";   // dim — idle, neutral, draft

interface StatusDotProps {
  children: ReactNode;
  variant?: StatusDotVariant;
}

const dotClass: Record<StatusDotVariant, string> = {
  live: "bg-success",
  active: "bg-accent",
  warn: "bg-warn",
  error: "bg-error",
  muted: "bg-text-dim",
};

const textClass: Record<StatusDotVariant, string> = {
  live: "text-success",
  active: "text-accent",
  warn: "text-warn",
  error: "text-error",
  muted: "text-text-dim",
};

export function StatusDot({ children, variant = "muted" }: StatusDotProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide ${textClass[variant]}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotClass[variant]}`} />
      {children}
    </span>
  );
}
