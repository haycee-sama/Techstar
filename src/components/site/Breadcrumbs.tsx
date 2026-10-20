"use client";

import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "@/lib/router";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Optional last item label override (defaults to last item.name) */
  currentLabel?: string;
  className?: string;
  /** Hide on small screens (default: false) */
  hideOnMobile?: boolean;
}

/**
 * Editorial breadcrumb matching the brand's technical grid feel.
 * Uses small uppercase labels with accent dot separators.
 */
export function Breadcrumbs({
  items,
  currentLabel,
  className = "",
  hideOnMobile = false,
}: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;
  const visible = items;
  const lastIdx = visible.length - 1;
  const finalLabel = currentLabel ?? visible[lastIdx].name;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`${hideOnMobile ? "hidden sm:flex" : "flex"} items-center gap-1.5 text-xs ${className}`}
      style={{ color: "var(--text-muted)" }}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {visible.map((item, i) => {
          const isLast = i === lastIdx;
          const label = isLast ? finalLabel : item.name;
          return (
            <Fragment key={`${item.path}-${i}`}>
              <li>
                {isLast ? (
                  <span
                    aria-current="page"
                    className="font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="uppercase tracking-[0.16em] transition-colors hover:text-[var(--accent-bright)]"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li aria-hidden className="flex items-center">
                  <ChevronRight
                    className="size-3"
                    style={{ color: "var(--border-strong)" }}
                  />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
