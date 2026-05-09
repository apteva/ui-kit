// DataList — key/value grid for the metadata block of cards
// (DealCard's company/owner/close date, IssueCard's labels/assignees).
// Two-column dt/dd grid: muted label on the left, regular-weight
// value on the right. Compact density so it fits inside a chat
// bubble while still being skimmable.

import type { ReactNode } from "react";

interface DataListProps {
 items: { label: string; value: ReactNode }[];
}

export function DataList({ items }: DataListProps) {
 return (
 <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
 {items.map((it) => (
 <div key={it.label} className="contents">
 <dt className="text-text-dim text-xs font-medium pt-0.5">{it.label}</dt>
 <dd className="text-text min-w-0 truncate">{it.value}</dd>
 </div>
 ))}
 </dl>
 );
}
