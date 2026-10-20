"use client";

import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /** Number of skeleton text lines (default 3) */
  lines?: number;
  /** Show a hero block above the lines */
  withHero?: boolean;
  className?: string;
}

/**
 * Editorial skeleton loader matching the brand's card style.
 */
export function LoadingState({
  lines = 3,
  withHero = false,
  className = "",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn("space-y-4", className)}
    >
      <span className="sr-only">Loading…</span>
      {withHero && (
        <div
          className="h-44 w-full animate-pulse rounded-xl border"
          style={{
            backgroundColor: "var(--surface-2)",
            borderColor: "var(--border-subtle)",
          }}
        />
      )}
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded-full"
            style={{
              backgroundColor: "var(--surface-2)",
              width: `${85 - i * 12}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
