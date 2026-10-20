"use client";

import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface AdminTableHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Create button label. */
  createLabel?: string;
  onCreate?: () => void;
  /** Optional extra actions rendered on the right. */
  actions?: ReactNode;
}

/**
 * Standard page header for every admin CRUD table. Title + description +
 * optional icon on the left; "Create" button + extra actions on the right.
 */
export function AdminTableHeader({
  title,
  description,
  icon,
  createLabel,
  onCreate,
  actions,
}: AdminTableHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {icon ? (
          <div
            className="mt-0.5 flex size-9 items-center justify-center rounded-md"
            style={{
              backgroundColor: "var(--surface-2)",
              color: "var(--accent-bright)",
            }}
            aria-hidden
          >
            {icon}
          </div>
        ) : null}
        <div>
          <h1
            className="font-display text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {createLabel && onCreate ? (
          <Button onClick={onCreate} size="sm">
            {createLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
