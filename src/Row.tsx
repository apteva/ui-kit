// Row — compact list row used by every list-shaped card (deal-list,
// ticket-list, contact-list, inbox-strip). Three slots:
//
//   [leading]  title              [trailing]
//              subtitle
//
// Leading is typically an avatar, favicon, priority pill, or icon.
// Trailing is typically a timestamp, status pill, or amount.
//
// Rows stack with a thin border-top; first row has no border. When
// `href` is provided the whole row becomes a link.

import type { ReactNode } from "react";

interface RowProps {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  /** Hide the top divider — set on the first row of a stack. */
  flush?: boolean;
  onClick?: () => void;
}

export function Row({ leading, title, subtitle, trailing, href, flush, onClick }: RowProps) {
  const cls = `flex items-center gap-2 px-3 py-2 ${flush ? "" : "border-t border-border"} ${
    href || onClick ? "hover:bg-bg-input/40 transition-colors" : ""
  }`;
  const inner = (
    <>
      {leading !== undefined && (
        <span className="flex-shrink-0 flex items-center justify-center">{leading}</span>
      )}
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="text-text text-xs font-medium truncate">{title}</div>
        {subtitle !== undefined && (
          <div className="text-text-dim text-[10px] truncate">{subtitle}</div>
        )}
      </div>
      {trailing !== undefined && (
        <span className="flex-shrink-0 text-[11px] text-text-muted">{trailing}</span>
      )}
    </>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener" className={cls} onClick={(e) => e.stopPropagation()}>
        {inner}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" className={`${cls} text-left w-full`} onClick={onClick}>
        {inner}
      </button>
    );
  }
  return <div className={cls}>{inner}</div>;
}
