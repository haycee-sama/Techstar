"use client";

import { Fragment, useMemo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, useRouter } from "@/lib/router";
import { ADMIN_NAV_GROUPS } from "./nav-config";

// Detail editor routes — render "Editor" as the final breadcrumb segment.
const EDITOR_PATTERNS: { pattern: RegExp; parent: string; parentTo: string }[] = [
  { pattern: /^\/admin\/pages\/[^/]+$/, parent: "Pages", parentTo: "/admin/pages" },
  { pattern: /^\/admin\/services\/[^/]+$/, parent: "Services", parentTo: "/admin/services" },
  { pattern: /^\/admin\/projects\/[^/]+$/, parent: "Projects", parentTo: "/admin/projects" },
  { pattern: /^\/admin\/articles\/[^/]+$/, parent: "Articles", parentTo: "/admin/articles" },
  { pattern: /^\/admin\/legal\/[^/]+$/, parent: "Legal", parentTo: "/admin/legal" },
];

/**
 * Top-of-page breadcrumbs for the admin area. Produces a path like:
 *   Home / Admin / [Section]
 * where [Section] is matched against the current admin route. Detail editor
 * routes (e.g. /admin/services/:slug) render an extra "Editor" segment.
 */
export function AdminBreadcrumbs() {
  const { parsed } = useRouter();
  const currentPath = parsed.path;

  const crumbs = useMemo(() => {
    // Two-pass lookup so a more-specific nav item wins over a parent that
    // happens to prefix-match. Previously, `/admin/media` matched the
    // `/admin` (Dashboard) item first because `find` is order-sensitive
    // and Dashboard is the first item. Now we try exact equality across
    // every item before falling back to a longest-prefix match.
    const flat = ADMIN_NAV_GROUPS.flatMap((g) => g.items);
    const exact = flat.find((i) => currentPath === i.to);
    const matchedItem =
      exact ??
      flat
        .filter((i) => currentPath.startsWith(i.to + "/"))
        .sort((a, b) => b.to.length - a.to.length)[0];

    // Detail editor routes get an extra "Editor" segment.
    const editorMatch = EDITOR_PATTERNS.find((p) => p.pattern.test(currentPath));

    return [
      { label: "Home", to: "/" },
      { label: "Admin", to: "/admin" },
      matchedItem && !editorMatch
        ? { label: matchedItem.label, to: matchedItem.to }
        : null,
      editorMatch
        ? { label: editorMatch.parent, to: editorMatch.parentTo }
        : null,
      editorMatch
        ? { label: "Editor", to: currentPath }
        : null,
    ].filter(Boolean) as { label: string; to: string }[];
  }, [currentPath]);

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <Fragment key={c.to + i}>
              <BreadcrumbItem>
                {last ? (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={c.to}>{c.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!last ? <BreadcrumbSeparator /> : null}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
