// Card — the basic container every chat-attachment / app card composes
// into. Owns the border, radius, overflow-clip, and hover affordance.
// Component authors add CardHeader + body inside it; they don't pick
// border colors or padding.

import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  /** When provided, the whole card becomes a link. Common case for
   *  "click to open in the upstream app". */
  href?: string;
  /** Render as a compact one-line affordance instead of a full
   *  bordered block. Mirrors FileCard's `compact` prop. */
  compact?: boolean;
  className?: string;
}

export function Card({ children, href, compact, className }: CardProps) {
  const base = compact
    ? "flex items-center gap-2 p-2 border border-border rounded-md hover:border-accent transition-colors max-w-md"
    : "flex flex-col gap-0 border border-border rounded-md overflow-hidden hover:border-accent transition-colors max-w-2xl w-full bg-bg-card";
  const cls = className ? `${base} ${className}` : base;
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener" className={cls}>
        {children}
      </a>
    );
  }
  return <div className={cls}>{children}</div>;
}
