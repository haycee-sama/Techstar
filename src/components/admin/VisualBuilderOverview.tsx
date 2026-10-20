"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "./StatusBadge";
import {
  Plus,
  Search,
  PencilRuler,
  Eye,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  useContentStore,
  usePages,
} from "@/lib/content-store";
import { useRouter, Link } from "@/lib/router";
import type { PageContent, PageStatus } from "@/lib/types";
import { formatDate, makeId } from "@/lib/utils";

/**
 * Visual builder overview — landing page for `#/admin/builder` (no
 * slug). Lists all builder-editable pages (every PageContent record)
 * with their status + last edited timestamp, plus a quick search.
 * Click a page to open the editor at `#/admin/builder/:slug`.
 */
export function VisualBuilderOverview() {
  const pages = usePages();
  const { upsertPage } = useContentStore();
  const { navigate } = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) => `${p.title} ${p.slug}`.toLowerCase().includes(q)
    );
  }, [pages, query]);

  function handleCreate() {
    const slug = `new-page-${Math.random().toString(36).slice(2, 6)}`;
    const fresh: PageContent = {
      slug,
      title: "Untitled page",
      status: "draft" as PageStatus,
      sections: [],
      seo: { title: "Untitled page" },
      updatedAt: new Date().toISOString(),
    };
    upsertPage(fresh);
    toast.success("New page created — opening the builder.");
    navigate(`/admin/builder/${slug}`);
  }

  const totalSections = pages.reduce((sum, p) => sum + (p.sections?.length ?? 0), 0);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            <PencilRuler className="size-3.5" aria-hidden />
            Phase 4 · Visual builder
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Pages
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Compose landing pages from typed sections. Builder edits
            the <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 text-xs">sections</code> array;
            the <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 text-xs">#/preview/&lt;slug&gt;</code>{" "}
            route renders it via SectionRenderer.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-1.5">
          <Plus className="size-4" />
          New page
        </Button>
      </div>

      <Card className="mb-4 border-dashed">
        <CardContent className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
          <Stat label="Pages" value={pages.length} />
          <Stat label="Sections" value={totalSections} />
          <Stat label="Published" value={pages.filter((p) => p.status === "published").length} />
          <Stat label="Drafts" value={pages.filter((p) => p.status === "draft").length} />
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or slug…"
            className="h-9 pl-8 text-sm"
            aria-label="Search pages"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No pages match &ldquo;{query}&rdquo;.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((page) => (
            <PageCard key={page.slug} page={page} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
    </div>
  );
}

function PageCard({ page }: { page: PageContent }) {
  const sectionCount = page.sections?.length ?? 0;
  return (
    <Card className="group transition-all hover:border-[var(--accent-bright)]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate font-display text-base" style={{ color: "var(--text-primary)" }}>
              {page.title}
            </CardTitle>
            <CardDescription className="mt-0.5 font-mono text-[11px]">
              /{page.slug}
            </CardDescription>
          </div>
          <StatusBadge status={page.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--text-muted)" }}>
          <span>
            {sectionCount} {sectionCount === 1 ? "section" : "sections"}
          </span>
          <span>Updated {formatDate(page.updatedAt, "short")}</span>
        </div>
        <div className="mt-3 flex gap-2">
          <Button asChild size="sm" className="gap-1.5">
            <Link to={`/admin/builder/${page.slug}`}>
              <Eye className="size-3.5" />
              Open builder
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to={`/preview/${page.slug}`}>
              <ExternalLink className="size-3.5" />
              Preview
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
