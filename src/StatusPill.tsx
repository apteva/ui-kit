// StatusPill — inline tinted label used next to entities that have a
// discrete state. Sits in card bodies and rows where StatusDot would
// be visually overpowered. The five variants map to a fixed semantic
// palette: success (green), info (blue), warn (amber), error (red),
// neutral (zinc). Same scale (8% tinted bg + 600/dark-500 text) so a
// row of mixed states reads as a coherent group.

import type { ReactNode } from "react";

export type StatusPillVariant =
 |"success" // green — published, merged, completed
 |"info" // blue — scheduled, in-review
 |"warn" // amber — needs attention
 |"error" // red — failed, closed
 |"neutral"; // zinc — draft, archived

interface StatusPillProps {
 children: ReactNode;
 variant?: StatusPillVariant;
}

const variantClass: Record<StatusPillVariant, string> = {
 success: "bg-success/10 text-green-700 dark:bg-success/15 dark:text-green-400",
 info: "bg-accent/10 text-blue-700 dark:bg-accent/15 dark:text-blue-400",
 warn: "bg-warn/10 text-amber-700 dark:bg-warn/15 dark:text-amber-400",
 error: "bg-error/10 text-red-700 dark:bg-error/15 dark:text-red-400",
 neutral: "bg-zinc-100 text-text dark:bg-bg-hover dark:text-zinc-300",
};

export function StatusPill({ children, variant = "neutral" }: StatusPillProps) {
 return (
 <span
 className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap ${variantClass[variant]}`}
 >
 {children}
 </span>
 );
}
