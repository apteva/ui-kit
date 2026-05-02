// CardHeader — the strip at the top of every Card. Three visual slots:
//
//   [logo] title   ● status      action →
//
// Designed for the screenshot's PR card and the Storage FileCard alike.
// The logo + status + action are all optional, so the same header
// works for "GitHub PR live · view on GitHub" and "vacation-shot.jpg".

import type { ReactNode } from "react";
import { StatusDot, type StatusDotVariant } from "./StatusDot";

interface CardHeaderProps {
  /** App / integration logo. Pass an <img> or any inline node. */
  logo?: ReactNode;
  /** Primary line — usually the entity name or repo path. */
  title: ReactNode;
  /** Secondary line under the title (e.g. PR title, file folder). */
  subtitle?: ReactNode;
  /** Right-side status dot + label, e.g. "live", "open", "merged". */
  status?: { label: string; variant?: StatusDotVariant };
  /** Right-side trailing affordance, e.g. "View on GitHub →". */
  action?: { label: string; href: string };
}

export function CardHeader({ logo, title, subtitle, status, action }: CardHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-bg-input/30">
      {logo && (
        <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-text-muted">
          {logo}
        </span>
      )}
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="text-text text-xs font-medium truncate">{title}</div>
        {subtitle && (
          <div className="text-text-dim text-[10px] truncate">{subtitle}</div>
        )}
      </div>
      {status && <StatusDot variant={status.variant}>{status.label}</StatusDot>}
      {action && (
        <a
          href={action.href}
          target="_blank"
          rel="noopener"
          className="flex-shrink-0 text-accent text-[11px] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {action.label} ↗
        </a>
      )}
    </div>
  );
}
