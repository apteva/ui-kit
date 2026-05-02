// StatusPill — bordered/tinted label used next to entities that have
// a discrete state. Mirrors the Published / Scheduled / In review /
// Draft pills in the screenshot's content-queue card. Distinct from
// StatusDot (header strip) — pills sit inline with content rows.

import type { ReactNode } from "react";

export type StatusPillVariant =
  | "success"    // green — published, merged, completed
  | "info"       // blue — scheduled, in-review
  | "warn"       // yellow — needs attention
  | "error"      // red — failed, closed
  | "neutral";   // gray — draft, archived

interface StatusPillProps {
  children: ReactNode;
  variant?: StatusPillVariant;
}

const variantClass: Record<StatusPillVariant, string> = {
  success: "bg-success/15 text-success",
  info: "bg-info/15 text-info",
  warn: "bg-warn/15 text-warn",
  error: "bg-error/15 text-error",
  neutral: "bg-bg-input text-text-muted",
};

export function StatusPill({ children, variant = "neutral" }: StatusPillProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${variantClass[variant]}`}>
      {children}
    </span>
  );
}
