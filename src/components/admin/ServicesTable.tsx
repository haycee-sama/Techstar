"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Wrench, Pencil, Copy, Archive, Trash2 } from "lucide-react";
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
  useServices,
  useServiceCategories,
} from "@/lib/content-store";
import { formatDate, makeId } from "@/lib/utils";
import type { Service } from "@/lib/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "coming-soon", label: "Coming soon" },
  { value: "retired", label: "Retired" },
];

export function ServicesTable() {
  const services = useServices();
  const categories = useServiceCategories();
  const { upsertService, deleteService } = useContentStore();
  const { navigate } = useRouter();

  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Service | null>(null);
  const [bulkAction, setBulkAction] = useState<
    | { kind: "delete"; rows: Service[] }
    | null
  >(null);

  const categoryName = useCallback(
    (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug,
    [categories]
  );

  const filtered = useMemo(() => {
    if (statusFilter === "all") return services;
    return services.filter((s) => (s.status ?? "active") === statusFilter);
  }, [services, statusFilter]);

  const columns = useMemo<ColumnDef<Service>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Service",
        cell: ({ row }) => (
          <Link
            to={`/admin/services/${row.original.slug}`}
            className="font-medium hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            {row.original.title}
          </Link>
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status ?? "active"} />
        ),
      },
      {
        accessorKey: "tagline",
        header: "Tagline",
        cell: ({ row }) => (
          <span
            className="line-clamp-1 max-w-[280px] text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {row.original.tagline}
          </span>
        ),
      },
      {
        id: "updatedAt",
        header: "Updated",
        cell: ({ row }) => {
          const ts = (row.original as Service & { updatedAt?: string }).updatedAt;
          return ts ? (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {formatDate(ts, "short")}
            </span>
          ) : (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              —
            </span>
          );
        },
      },
    ],
    [categoryName]
  );

  const rowActions: DataTableRowAction<Service>[] = [
    {
      label: "Edit",
      icon: <Pencil className="size-3.5" />,
      onSelect: (row) => navigate(`/admin/services/${row.slug}`),
    },
    {
      label: "Duplicate",
      icon: <Copy className="size-3.5" />,
      onSelect: (row) => {
        const newSlug = `${row.slug}-copy`;
        const copy: Service = {
          ...row,
          slug: newSlug,
          title: `${row.title} (copy)`,
          status: "coming-soon",
        };
        upsertService(copy);
        toast.success("Service duplicated.");
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

  const bulkActions: DataTableBulkAction<Service>[] = [
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onRun: (rows) => setBulkAction({ kind: "delete", rows }),
      destructive: true,
    },
  ];

  function handleCreate() {
    const slug = `service-${makeId("s").replace("s-", "")}`;
    const fresh: Service = {
      slug,
      categorySlug: categories[0]?.slug ?? "general",
      title: "Untitled service",
      tagline: "",
      overview: "",
      benefits: [],
      capabilities: [],
      process: { discover: "", design: "", deploy: "", support: "" },
      useCases: [],
      faqs: [],
      relatedServiceSlugs: [],
      seo: { title: "Untitled service" },
      status: "coming-soon",
    };
    upsertService(fresh);
    toast.success("New service created.");
    navigate(`/admin/services/${slug}`);
  }

  return (
    <div>
      <AdminTableHeader
        title="Services"
        description="Manage the eight service-domain pages. Each row opens the rich editor."
        icon={<Wrench className="size-4" />}
        createLabel="New service"
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
        ariaLabel="Services"
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by title or tagline…"
        getSearchValue={(s) => `${s.title} ${s.tagline} ${s.slug}`}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onRowClick={(row) => navigate(`/admin/services/${row.slug}`)}
        emptyTitle="No services"
        emptyDescription="Create your first service to start building."
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            New service
          </Button>
        }
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete service?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be removed from the catalog. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteService(deleteTarget.slug);
          toast.success("Service deleted.");
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title="Retire service?"
        description={
          archiveTarget
            ? `"${archiveTarget.title}" will be marked as retired. It will still appear in admin but hidden on the public catalog.`
            : ""
        }
        confirmLabel="Retire"
        variant="destructive"
        onConfirm={() => {
          if (!archiveTarget) return;
          upsertService({ ...archiveTarget, status: "retired" });
          toast.success("Service retired.");
          setArchiveTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!bulkAction}
        onOpenChange={(open) => !open && setBulkAction(null)}
        title="Delete selected services?"
        description={
          bulkAction ? `${bulkAction.rows.length} service(s) will be permanently deleted.` : ""
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!bulkAction) return;
          for (const r of bulkAction.rows) {
            deleteService(r.slug);
          }
          toast.success(`${bulkAction.rows.length} service(s) deleted.`);
          setBulkAction(null);
        }}
      />
    </div>
  );
}
