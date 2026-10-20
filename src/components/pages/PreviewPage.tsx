"use client";

import { useState } from "react";
import { useRouter, Link } from "@/lib/router";
import { usePage } from "@/lib/content-store";
import { SectionRenderer } from "@/components/builder/SectionRenderer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, X, AlertTriangle } from "lucide-react";
import type { Section } from "@/lib/types";

/**
 * Public preview route — renders a PageContent's sections via the
 * shared `<SectionRenderer>`.
 *
 * Reads the `?preview=true` query to choose between draft and
 * published sections:
 *   - `?preview=true` → render the working `sections` (draft)
 *   - otherwise      → render the captured `publishedSections`
 *
 * Shows a dismissible top banner in preview mode. Shows an
 * "archived" notice when the page status is `archived` and no
 * published sections exist.
 */
export function PreviewPage({ slug }: { slug: string }) {
  const page = usePage(slug);
  const { parsed } = useRouter();
  const [bannerOpen, setBannerOpen] = useState(true);

  // Synchronously read the `?preview=true` flag from the hash.
  const isPreviewMode = readPreviewFlag();

  if (!page) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <AlertTriangle className="mx-auto size-8" style={{ color: "var(--text-muted)" }} aria-hidden />
        <h1 className="mt-3 font-display text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Page not found
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          No page exists with slug <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-xs">{slug}</code>.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4 gap-1.5">
          <Link to="/admin/builder">
            <ArrowLeft className="size-3.5" />
            Back to builder
          </Link>
        </Button>
      </div>
    );
  }

  void parsed;

  const sections: Section[] = isPreviewMode
    ? (page.sections ?? [])
    : (page.publishedSections ?? page.sections ?? []);

  const isArchived = page.status === "archived";
  const hasPublished = !isPreviewMode && (page.publishedSections?.length ?? 0) > 0;

  return (
    <div>
      {isPreviewMode && bannerOpen ? (
        <div
          className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-2 text-xs"
          style={{
            backgroundColor: "var(--warning, #f59e0b)",
            color: "#0A0F1F",
            borderColor: "rgba(0,0,0,0.1)",
          }}
        >
          <div className="flex items-center gap-2">
            <Eye className="size-3.5" aria-hidden />
            <strong>Preview</strong>
            <span>— not the published version. Edits to the draft are live here.</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerOpen(false)}
            className="rounded p-1 transition-colors hover:bg-black/10"
            aria-label="Dismiss preview banner"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}

      {!isPreviewMode && isArchived ? (
        <div className="mx-auto max-w-md py-24 text-center">
          <AlertTriangle className="mx-auto size-8" style={{ color: "var(--text-muted)" }} aria-hidden />
          <h1 className="mt-3 font-display text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            This page is archived
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            The published snapshot has been removed. Re-publish from the visual builder to make it visible again.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 gap-1.5">
            <Link to={`/admin/builder/${slug}`}>
              <ArrowLeft className="size-3.5" />
              Open in builder
            </Link>
          </Button>
        </div>
      ) : null}

      {!isPreviewMode && !isArchived && !hasPublished ? (
        <div className="mx-auto max-w-md py-24 text-center">
          <AlertTriangle className="mx-auto size-8" style={{ color: "var(--text-muted)" }} aria-hidden />
          <h1 className="mt-3 font-display text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            No published snapshot yet
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Open the visual builder and click <strong>Publish</strong> to capture a published snapshot for this page.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 gap-1.5">
            <Link to={`/admin/builder/${slug}`}>
              <ArrowLeft className="size-3.5" />
              Open in builder
            </Link>
          </Button>
        </div>
      ) : null}

      {isPreviewMode || hasPublished ? (
        <SectionRenderer sections={sections} />
      ) : null}
    </div>
  );
}

function readPreviewFlag(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash || "";
  const queryIndex = hash.indexOf("?");
  if (queryIndex < 0) return false;
  const query = hash.slice(queryIndex + 1);
  const params = new URLSearchParams(query);
  return params.get("preview") === "true";
}
