"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ADMIN_NAV_GROUPS } from "./nav-config";
import { Link, useRouter } from "@/lib/router";
import { ArrowRight, Hammer, Wrench } from "lucide-react";

interface AdminPlaceholderProps {
  path: string;
  /**
   * Which phase will build this screen. Defaults to `"3b"` for the CRUD
   * tables (services, projects, articles, etc.). Pass `"3a-ii"` for the
   * page-editor stub so the messaging matches the brief.
   */
  phase?: "3b" | "3a-ii" | "4";
  /**
   * Optional override label (defaults to looking the path up in the nav
   * config). Useful for `/admin/pages/:slug` where the path doesn't match
   * a nav item.
   */
  label?: string;
}

/**
 * Phase 3b/3a-ii/4 placeholder for admin screens that aren't built yet.
 * Tells the user exactly which phase is coming and offers a "Back to
 * dashboard" shortcut so no admin link is a dead end.
 */
export function AdminPlaceholder({
  path,
  phase = "3b",
  label,
}: AdminPlaceholderProps) {
  const { navigate } = useRouter();

  const meta = useMemo(() => {
    const flat = ADMIN_NAV_GROUPS.flatMap((g) => g.items);
    const matched = flat.find(
      (i) => path === i.to || path.startsWith(i.to + "/")
    );
    return matched;
  }, [path]);

  const resolvedLabel = label ?? meta?.label ?? path.split("/").pop() ?? "Section";
  const phaseBadge =
    phase === "3a-ii" ? "Built in Phase 3a-ii" : phase === "4" ? "Phase 4" : "Coming in Phase 3b";

  return (
    <div className="mx-auto max-w-3xl">
      <div
        className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-wide"
        style={{ color: "var(--text-muted)" }}
      >
        <span>{phase === "3a-ii" ? "Phase 3a-ii" : phase === "4" ? "Phase 4" : "Phase 3b"}</span>
        <span>·</span>
        <span>{path}</span>
      </div>

      <Card
        className="overflow-hidden border-dashed"
        style={{ borderColor: "var(--border-strong)" }}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge variant="outline" className="mb-2">
                {phaseBadge}
              </Badge>
              <CardTitle
                className="font-display text-xl"
                style={{ color: "var(--text-primary)" }}
              >
                {resolvedLabel}
              </CardTitle>
            </div>
            <div
              className="flex size-10 items-center justify-center rounded-md"
              style={{
                backgroundColor: "var(--surface-2)",
                color: "var(--accent-bright)",
              }}
              aria-hidden
            >
              <Hammer className="size-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {phase === "3a-ii"
              ? "The full page editor (title, slug, excerpt, body WYSIWYG, featured image, SEO, publish/unpublish flow, undo/redo) is built in Phase 3a-ii. The plumbing is already in place — the editor will mount on this same route when Phase 3a-ii lands."
              : phase === "4"
              ? "This screen lands in Phase 4 alongside the visual builder. It will persist to the same content store the rest of the admin uses."
              : (
                <>
                  This CRUD table is built in Phase 3b. It will expose the same
                  reusable <code style={{ color: "var(--accent-bright)" }}>&lt;DataTable&gt;</code>{" "}
                  wrapper (search + sort + pagination), the{" "}
                  <code style={{ color: "var(--accent-bright)" }}>&lt;StatusBadge&gt;</code>{" "}
                  status pills, the{" "}
                  <code style={{ color: "var(--accent-bright)" }}>&lt;ConfirmDialog&gt;</code>{" "}
                  for destructive actions, and the{" "}
                  <code style={{ color: "var(--accent-bright)" }}>&lt;MediaPickerDialog&gt;</code>{" "}
                  for image fields. All persisted to local storage via the content
                  store.
                </>
              )}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/admin">
                <ArrowRight className="size-3.5 rotate-180" />
                Back to dashboard
              </Link>
            </Button>
            {phase !== "3a-ii" ? (
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/pages/about">
                  <Wrench className="size-3.5" />
                  Try the page editor
                </Link>
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/admin/login", { replace: true })}
            >
              Demo flow
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
