"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Icon to display prominently */
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties; "aria-hidden"?: boolean }>;
  /** Primary CTA (typically a Button asChild with Link) */
  action?: ReactNode;
  /** Secondary CTA */
  secondaryAction?: ReactNode;
  /** Optional eyebrow label above the title */
  eyebrow?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  secondaryAction,
  eyebrow,
  className = "",
}: EmptyStateProps) {
  const reduce = useReducedMotion();
  const headingId = useId();
  const descId = useId();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      role="status"
      aria-labelledby={headingId}
      aria-describedby={description ? descId : undefined}
      className={`relative overflow-hidden rounded-xl border px-6 py-16 text-center sm:py-20 ${className}`}
      style={{
        backgroundColor: "var(--surface-1)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="absolute inset-0 grid-bg-fine opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-md">
        {Icon && (
          <div
            className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full border"
            style={{
              borderColor: "var(--border-strong)",
              backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)",
            }}
          >
            <Icon
              className="size-6"
              style={{ color: "var(--accent-bright)" }}
              aria-hidden
            />
          </div>
        )}
        {eyebrow && (
          <div className="eyebrow mb-2">{eyebrow}</div>
        )}
        <h2
          id={headingId}
          className="font-display text-xl font-semibold tracking-tight sm:text-2xl"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>
        {description && (
          <p
            id={descId}
            className="mt-3 text-sm leading-relaxed sm:text-base"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
        )}
        {(action || secondaryAction) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {action}
            {secondaryAction}
          </div>
        )}
      </div>
    </motion.div>
  );
}
