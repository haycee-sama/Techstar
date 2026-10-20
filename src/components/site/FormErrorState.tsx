"use client";

import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

interface FieldError {
  field: string;
  message: string;
}

interface FormErrorStateProps {
  errors: FieldError[];
  /** Optional override title */
  title?: string;
  /** Optional override description */
  description?: string;
  /** Optional CTA (e.g. retry button) */
  action?: ReactNode;
}

/**
 * Inline form error summary, shown above the form.
 * Uses ARIA live region so screen readers announce updates.
 */
export function FormErrorState({
  errors,
  title = "Please correct the highlighted fields",
  description = "Some required information is missing or invalid.",
  action,
}: FormErrorStateProps) {
  if (!errors || errors.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-lg border p-4"
      style={{
        backgroundColor: "color-mix(in srgb, var(--danger) 8%, var(--surface-1))",
        borderColor: "color-mix(in srgb, var(--danger) 35%, transparent)",
      }}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 size-5 shrink-0"
          style={{ color: "var(--danger)" }}
          aria-hidden
        />
        <div className="flex-1">
          <p
            className="font-display text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </p>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
          {errors.length > 0 && (
            <ul
              className="mt-2 list-disc space-y-0.5 pl-5 text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {errors.map((err, i) => (
                <li key={`${err.field}-${i}`}>
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {err.field}:
                  </span>{" "}
                  {err.message}
                </li>
              ))}
            </ul>
          )}
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}
