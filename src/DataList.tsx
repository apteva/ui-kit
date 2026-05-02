// DataList — a key/value table for the metadata-heavy block of cards
// (FileCard's content_type/size/folder, IssueCard's labels/assignees).
// Two-column dt/dd-style grid with the label muted and the value at
// regular weight. Compact density to fit inside a chat bubble.

import type { ReactNode } from "react";

interface DataListProps {
  items: { label: string; value: ReactNode }[];
}

export function DataList({ items }: DataListProps) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
      {items.map((it) => (
        <div key={it.label} className="contents">
          <dt className="text-text-dim">{it.label}</dt>
          <dd className="text-text min-w-0 truncate">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
