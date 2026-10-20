"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Newspaper, Pencil, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DataTable,
  type DataTableRowAction,
  type DataTableBulkAction,
} from "./DataTable";
import { StatusBadge } from "./StatusBadge";
import { AdminTableHeader } from "./AdminTableHeader";
import { ConfirmDialog } from "./ConfirmDialog";
import { FilterSelect } from "./PagesTable";
import { Button } from "@/components/ui/button";
import { useRouter, Link } from "@/lib/router";
import {
  useContentStore,
  useArticles,
  useServiceCategories,
} from "@/lib/content-store";
import { formatDate, makeId, readingTime } from "@/lib/utils";
import type { Article } from "@/lib/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

export function ArticlesTable() {
  const articles = useArticles();
  const categories = useServiceCategories();
  const { upsertArticle, deleteArticle } = useContentStore();
  const { navigate } = useRouter();

  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [bulkDelete, setBulkDelete] = useState<Article[] | null>(null);

  const categoryName = useCallback(
    (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug,
    [categories]
  );

  const filtered = useMemo(() => {
    if (statusFilter === "all") return articles;
    return articles.filter((a) => a.status === statusFilter);
  }, [articles, statusFilter]);

  const columns = useMemo<ColumnDef<Article>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Article",
        cell: ({ row }) => (
          <Link
            to={`/admin/articles/${row.original.slug}`}
            className="font-medium hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        id: "author",
        header: "Author",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {row.original.authorId}
          </span>
        ),
      },
      {
        accessorKey: "categorySlug",
        header: "Category",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {categoryName(row.original.categorySlug)}
          </span>
        ),
      },
      {
        accessorKey: "publishedAt",
        header: "Published",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {row.original.publishedAt
              ? formatDate(row.original.publishedAt, "short")
              : "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "readingMinutes",
        header: "Read",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {row.original.readingMinutes || readingTime(row.original.body ?? "")} min
          </span>
        ),
      },
    ],
    [categoryName]
  );

  const rowActions: DataTableRowAction<Article>[] = [
    {
      label: "Edit",
      icon: <Pencil className="size-3.5" />,
      onSelect: (row) => navigate(`/admin/articles/${row.slug}`),
    },
    {
      label: "Duplicate",
      icon: <Copy className="size-3.5" />,
      onSelect: (row) => {
        const newSlug = `${row.slug}-copy`;
        const copy: Article = {
          ...row,
          slug: newSlug,
          title: `${row.title} (copy)`,
          status: "draft",
          publishedAt: undefined,
        };
        upsertArticle(copy);
        toast.success("Article duplicated as draft.");
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onSelect: (row) => setDeleteTarget(row),
      destructive: true,
    },
  ];

  const bulkActions: DataTableBulkAction<Article>[] = [
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onRun: (rows) => setBulkDelete(rows),
      destructive: true,
    },
  ];

  function handleCreate() {
    const slug = `article-${makeId("a").replace("a-", "")}`;
    const fresh: Article = {
      slug,
      title: "Untitled article",
      excerpt: "",
      body: "",
      authorId: "author-1",
      publishedAt: new Date().toISOString(),
      readingMinutes: 1,
      tags: [],
      categorySlug: categories[0]?.slug ?? "general",
      seo: { title: "Untitled article" },
      status: "draft",
    };
    upsertArticle(fresh);
    toast.success("New article created.");
    navigate(`/admin/articles/${slug}`);
  }

  return (
    <div>
      <AdminTableHeader
        title="Articles"
        description="Editorial insights. Each article publishes to /insights/:slug."
        icon={<Newspaper className="size-4" />}
        createLabel="New article"
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
        ariaLabel="Articles"
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by title or slug…"
        getSearchValue={(a) => `${a.title} ${a.slug} ${a.authorId}`}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onRowClick={(row) => navigate(`/admin/articles/${row.slug}`)}
        emptyTitle="No articles"
        emptyDescription="Draft your first insight."
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            New article
          </Button>
        }
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete article?"
        description={deleteTarget ? `"${deleteTarget.title}" will be permanently deleted.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteArticle(deleteTarget.slug);
          toast.success("Article deleted.");
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!bulkDelete}
        onOpenChange={(open) => !open && setBulkDelete(null)}
        title="Delete selected articles?"
        description={bulkDelete ? `${bulkDelete.length} article(s) will be deleted.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!bulkDelete) return;
          for (const r of bulkDelete) deleteArticle(r.slug);
          toast.success(`${bulkDelete.length} article(s) deleted.`);
          setBulkDelete(null);
        }}
      />
    </div>
  );
}
