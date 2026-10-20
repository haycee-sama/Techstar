"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { InquiryStatus, PageStatus } from "@/lib/types";

type AnyStatus =
  | PageStatus
  | InquiryStatus
  | "active"
  | "inactive"
  | "pending"
  | "resolved"
  | "coming-soon"
  | "retired";

const STATUS_META: Record<
  AnyStatus,
  { label: string; className: string }
> = {
  // Page statuses
  draft: {
    label: "Draft",
    className:
      "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  published: {
    label: "Published",
    className:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  archived: {
    label: "Archived",
    className:
      "border-transparent bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
  },
  // Inquiry statuses
  new: {
    label: "New",
    className:
      "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-300",
  },
  "in-review": {
    label: "In review",
    className:
      "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  qualified: {
    label: "Qualified",
    className:
      "border-transparent bg-violet-500/15 text-violet-700 dark:text-violet-300",
  },
  won: {
    label: "Won",
    className:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  lost: {
    label: "Lost",
    className:
      "border-transparent bg-rose-500/15 text-rose-700 dark:text-rose-300",
  },
  // Generic
  pending: {
    label: "Pending",
    className:
      "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  resolved: {
    label: "Resolved",
    className:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  active: {
    label: "Active",
    className:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  inactive: {
    label: "Inactive",
    className:
      "border-transparent bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
  },
  "coming-soon": {
    label: "Coming soon",
    className:
      "border-transparent bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
  },
  retired: {
    label: "Retired",
    className:
      "border-transparent bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
  },
};

interface StatusBadgeProps {
  status: AnyStatus | string;
  className?: string;
  /** Optional override for the visible label. */
  label?: string;
}

/**
 * Small colored pill that renders a status label consistently across
 * the admin tables, editor, and dashboard. Unknown status strings fall
 * back to a neutral pill with the raw label.
 */
export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const meta = (STATUS_META as Record<string, { label: string; className: string }>)[status];
  if (!meta) {
    return (
      <Badge variant="outline" className={cn(className)}>
        {label ?? status}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={cn(meta.className, className)}>
      {label ?? meta.label}
    </Badge>
  );
}
