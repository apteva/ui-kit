// Card — the base container for every dashboard tile and chat
// attachment in the platform.
//
// Design principles:
// - One source of chrome. We use a solid 1px border, no shadow.
// Shadows look weak in dark mode and double-up with borders to
// read as"noise". A clean border is enough to define the card.
// - Hover only when interactive. If `href` is set the border lifts
// to accent on hover. Static cards stay still — no pointer event
// should fire feedback that doesn't lead anywhere.
// - Width cap by default (max-w-2xl ≈ 672px) so chat-attachment
// cards don't sprawl in wide chat bubbles. Dashboard tiles opt
// out via `fullWidth`.
//
// Component authors add CardHeader + body inside; they don't touch
// border, radius, or background — those are owned here.

import type { ReactNode } from "react";

interface CardProps {
 children: ReactNode;
 /** When provided, the whole card becomes a link. Common case for
 *"click to open in the upstream app". */
 href?: string;
 /** Render as a compact one-line affordance — used for inline
 * references in chat where a full card is overkill. */
 compact?: boolean;
 /** Drop the default max-w-2xl cap so the card fills its parent.
 * Use for dashboard tiles like PipelineStrip / ActivityFeed where
 * the card is the only thing in its row. */
 fullWidth?: boolean;
 className?: string;
}

export function Card({ children, href, compact, fullWidth, className }: CardProps) {
 const widthCap = fullWidth ? "w-full" :"max-w-2xl w-full";
 const interactive = href ? "hover:border-border-strong transition-colors cursor-pointer" :"";
 const surface = "bg-bg-card border border-border";

 const base = compact
 ? `flex items-center gap-2.5 px-3 py-2 rounded-lg ${surface} ${interactive} max-w-md`
 : `flex flex-col gap-0 rounded-xl overflow-hidden ${surface} ${interactive} ${widthCap}`;
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
