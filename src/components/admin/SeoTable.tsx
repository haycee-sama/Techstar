"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Search, Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
  DataTable,
  type DataTableBulkAction,
} from "./DataTable";
import { AdminTableHeader } from "./AdminTableHeader";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useContentStore, useContent } from "@/lib/content-store";
import type { SeoMeta } from "@/lib/types";
import { SeoEditor } from "./SeoEditor";

type Entity = {
  id: string;
  kind: "page" | "service" | "project" | "article";
  slug: string;
  title: string;
  seo: SeoMeta;
};

export function SeoTable() {
  const content = useContent();
  const { updatePage, upsertService, upsertProject, upsertArticle, getGlobalSettings, updateGlobalSettings } = useContentStore();
  const [editTarget, setEditTarget] = useState<Entity | null>(null);
  const [bulkApply, setBulkApply] = useState<Entity[] | null>(null);

  const entities = useMemo<Entity[]>(() => {
    const out: Entity[] = [];
    for (const p of content.pages) {
      out.push({ id: p.slug, kind: "page", slug: p.slug, title: p.title, seo: p.seo });
    }
    for (const s of content.services) {
      out.push({ id: s.slug, kind: "service", slug: s.slug, title: s.title, seo: s.seo });
    }
    for (const p of content.projects) {
      out.push({
        id: p.slug,
        kind: "project",
        slug: p.slug,
        title: p.title,
        seo: (p as { seo?: SeoMeta }).seo ?? {},
      });
    }
    for (const a of content.articles) {
      out.push({ id: a.slug, kind: "article", slug: a.slug, title: a.title, seo: a.seo });
    }
    return out;
  }, [content]);

  const columns = useMemo<ColumnDef<Entity>[]>(
    () => [
      {
        accessorKey: "kind",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-[10px] uppercase">
            {row.original.kind}
          </Badge>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>
            {row.original.title}
          </span>
        ),
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => (
          <code className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
            /{row.original.slug}
          </code>
        ),
      },
      {
        id: "seoTitle",
        header: "SEO title",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-[220px] text-xs" style={{ color: "var(--text-secondary)" }}>
            {row.original.seo?.title ?? "—"}
          </span>
        ),
      },
      {
        id: "seoDesc",
        header: "Meta description",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-[260px] text-xs" style={{ color: "var(--text-muted)" }}>
            {row.original.seo?.description ?? "—"}
          </span>
        ),
      },
      {
        id: "canonical",
        header: "Canonical",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-[180px] text-xs" style={{ color: "var(--text-muted)" }}>
            {row.original.seo?.canonical ?? "—"}
          </span>
        ),
      },
    ],
    []
  );

  const bulkActions: DataTableBulkAction<Entity>[] = [
    {
      label: "Apply default SEO",
      icon: <Wand2 className="size-3.5" />,
      onRun: (rows) => setBulkApply(rows),
    },
  ];

  function saveEntity(entity: Entity, seo: SeoMeta) {
    if (entity.kind === "page") {
      updatePage(entity.slug, { seo });
    } else if (entity.kind === "service") {
      const s = content.services.find((x) => x.slug === entity.slug);
      if (s) upsertService({ ...s, seo });
    } else if (entity.kind === "project") {
      const p = content.projects.find((x) => x.slug === entity.slug);
      if (p) upsertProject({ ...p, seo });
    } else if (entity.kind === "article") {
      const a = content.articles.find((x) => x.slug === entity.slug);
      if (a) upsertArticle({ ...a, seo });
    }
    toast.success("SEO saved.", { description: entity.title });
  }

  function applyDefaultSeo(rows: Entity[]) {
    const defaults = getGlobalSettings().defaultSeo;
    for (const r of rows) {
      saveEntity(r, {
        ...defaults,
        title: r.seo.title ?? defaults.title ?? r.title,
        description: r.seo.description ?? defaults.description,
      });
    }
    toast.success(`${rows.length} record(s) updated with default SEO.`);
  }

  return (
    <div>
      <AdminTableHeader
        title="SEO"
        description="Search and social metadata across pages, services, projects, and articles. Click a row to edit; bulk-apply default SEO from global settings."
        icon={<Search className="size-4" />}
      />
      <DataTable
        ariaLabel="SEO records"
        columns={columns}
        data={entities}
        searchPlaceholder="Search by title or slug…"
        getSearchValue={(e) => `${e.title} ${e.slug} ${e.kind}`}
        bulkActions={bulkActions}
        onRowClick={(row) => setEditTarget({ ...row })}
        emptyTitle="No records"
        emptyDescription="Add content first to see SEO records here."
      />

      <Sheet
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <SheetContent className="w-full sm:max-w-[560px] overflow-y-auto">
          {editTarget ? (
            <>
              <SheetHeader>
                <SheetTitle>SEO · {editTarget.title}</SheetTitle>
                <SheetDescription>
                  {editTarget.kind} · /{editTarget.slug}
                </SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-4">
                <SeoEditor
                  value={editTarget.seo}
                  onChange={(seo) => setEditTarget({ ...editTarget, seo })}
                  fallbackTitle={editTarget.title}
                />
              </div>
              <SheetFooter>
                <Button
                  size="sm"
                  onClick={() => {
                    saveEntity(editTarget, editTarget.seo);
                    setEditTarget(null);
                  }}
                >
                  Save
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Bulk apply: this is a confirm + run inline (no separate dialog) */}
      {bulkApply ? (
        <BulkApplyBanner
          rows={bulkApply}
          onConfirm={() => {
            applyDefaultSeo(bulkApply);
            setBulkApply(null);
          }}
          onCancel={() => setBulkApply(null)}
        />
      ) : null}
    </div>
  );
}

function BulkApplyBanner({
  rows,
  onConfirm,
  onCancel,
}: {
  rows: Entity[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg border p-4"
        style={{
          backgroundColor: "var(--background)",
          borderColor: "var(--border-subtle)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-display text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Apply default SEO to {rows.length} record(s)?
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          Fills empty SEO title and description with the global default. Existing values are preserved.
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={onConfirm}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
