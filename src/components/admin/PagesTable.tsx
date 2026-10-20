"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Pencil, Copy, Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type DataTableRowAction, type DataTableBulkAction } from "./DataTable";
import { StatusBadge } from "./StatusBadge";
import { AdminTableHeader } from "./AdminTableHeader";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter, Link } from "@/lib/router";
import {
  useContentStore,
  usePages,
} from "@/lib/content-store";
import { formatDate, makeId } from "@/lib/utils";
import type { PageContent, PageStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export function PagesTable() {
  const pages = usePages();
  const { updatePage, upsertPage, deletePage } = useContentStore();
  const { navigate } = useRouter();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<PageContent | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<PageContent | null>(null);
  const [bulkAction, setBulkAction] = useState<
    | { kind: "delete"; rows: PageContent[] }
    | { kind: "archive"; rows: PageContent[] }
    | null
  >(null);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return pages;
    return pages.filter((p) => p.status === statusFilter);
  }, [pages, statusFilter]);

  const columns = useMemo<ColumnDef<PageContent>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <Link
            to={`/admin/pages/${row.original.slug}`}
            className="font-medium hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => (
          <code
            className="font-mono text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            /{row.original.slug}
          </code>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {formatDate(row.original.updatedAt, "short")}
          </span>
        ),
      },
    ],
    []
  );

  const rowActions: DataTableRowAction<PageContent>[] = [
    {
      label: "Edit",
      icon: <Pencil className="size-3.5" />,
      onSelect: (row) => navigate(`/admin/pages/${row.slug}`),
    },
    {
      label: "Duplicate",
      icon: <Copy className="size-3.5" />,
      onSelect: (row) => {
        const newSlug = `${row.slug}-copy-${Math.random().toString(36).slice(2, 6)}`;
        const copy: PageContent = {
          ...row,
          slug: newSlug,
          title: `${row.title} (copy)`,
          status: "draft" as PageStatus,
          updatedAt: new Date().toISOString(),
          sections: [],
        };
        upsertPage(copy);
        toast.success("Page duplicated as draft.");
      },
    },
    {
      label: "Archive",
      icon: <Archive className="size-3.5" />,
      onSelect: (row) => setArchiveTarget(row),
    },
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onSelect: (row) => setDeleteTarget(row),
      destructive: true,
    },
  ];

  const bulkActions: DataTableBulkAction<PageContent>[] = [
    {
      label: "Archive",
      icon: <Archive className="size-3.5" />,
      onRun: (rows) => setBulkAction({ kind: "archive", rows }),
    },
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onRun: (rows) => setBulkAction({ kind: "delete", rows }),
      destructive: true,
    },
  ];

  function handleCreate() {
    const slug = makeId("page");
    const fresh: PageContent = {
      slug,
      title: "Untitled page",
      status: "draft" as PageStatus,
      sections: [],
      seo: { title: "Untitled page" },
      updatedAt: new Date().toISOString(),
    };
    upsertPage(fresh);
    toast.success("New page created.");
    navigate(`/admin/pages/${slug}`);
  }

  return (
    <div>
      <AdminTableHeader
        title="Pages"
        description="Edit the site's evergreen pages. Changes persist to local storage."
        icon={<FileText className="size-4" />}
        createLabel="New page"
        onCreate={handleCreate}
        actions={
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
        }
      />
      <DataTable
        ariaLabel="Pages"
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by title or slug…"
        getSearchValue={(p) => `${p.title} ${p.slug}`}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onRowClick={(row) => navigate(`/admin/pages/${row.slug}`)}
        emptyTitle="No pages"
        emptyDescription="Create your first page to start editing."
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            New page
          </Button>
        }
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete page?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be removed permanently. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          deletePage(deleteTarget.slug);
          toast.success("Page deleted.");
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title="Archive page?"
        description={
          archiveTarget
            ? `"${archiveTarget.title}" will be set to archived. You can restore it later by editing its status.`
            : ""
        }
        confirmLabel="Archive"
        variant="destructive"
        onConfirm={() => {
          if (!archiveTarget) return;
          updatePage(archiveTarget.slug, { status: "archived" as PageStatus });
          toast.success("Page archived.");
          setArchiveTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!bulkAction}
        onOpenChange={(open) => !open && setBulkAction(null)}
        title={bulkAction?.kind === "delete" ? "Delete selected pages?" : "Archive selected pages?"}
        description={
          bulkAction
            ? `${bulkAction.rows.length} page(s) will be ${bulkAction.kind === "delete" ? "permanently deleted" : "archived"}.`
            : ""
        }
        confirmLabel={bulkAction?.kind === "delete" ? "Delete" : "Archive"}
        variant="destructive"
        onConfirm={() => {
          if (!bulkAction) return;
          for (const r of bulkAction.rows) {
            if (bulkAction.kind === "delete") {
              deletePage(r.slug);
            } else {
              updatePage(r.slug, { status: "archived" as PageStatus });
            }
          }
          toast.success(
            bulkAction.kind === "delete"
              ? `${bulkAction.rows.length} page(s) deleted.`
              : `${bulkAction.rows.length} page(s) archived.`
          );
          setBulkAction(null);
        }}
      />
    </div>
  );
}

// Reusable filter-select used by multiple admin tables.
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  width = "160px",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  width?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className="h-8"
        style={{ width }}
        aria-label={`Filter by ${label.toLowerCase()}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Re-export so other tables can use the same shared header.
export { AdminTableHeader };
export type { ReactNode };
