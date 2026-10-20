"use client";

import { Inbox } from "lucide-react";

interface EmptyTableStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

/**
 * Consistent "no rows" empty state used by every admin data table.
 * Card-on-mobile / table-on-desktop patterns share this fallback.
 */
export function EmptyTableState({
  title,
  description,
  action,
  icon,
}: EmptyTableStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div
        className="flex size-12 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--surface-2)", color: "var(--text-muted)" }}
        aria-hidden
      >
        {icon ?? <Inbox className="size-5" />}
      </div>
      <div className="space-y-1">
        <p className="font-display text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </p>
        {description ? (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
