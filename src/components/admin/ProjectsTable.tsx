"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Pencil, Copy, Trash2 } from "lucide-react";
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
  useProjects,
} from "@/lib/content-store";
import { formatDate, makeId } from "@/lib/utils";
import type { Project } from "@/lib/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "ongoing", label: "Ongoing" },
  { value: "planned", label: "Planned" },
];

export function ProjectsTable() {
  const projects = useProjects();
  const { upsertProject, deleteProject } = useContentStore();
  const { navigate } = useRouter();

  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [bulkDelete, setBulkDelete] = useState<Project[] | null>(null);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Project",
        cell: ({ row }) => (
          <Link
            to={`/admin/projects/${row.original.slug}`}
            className="font-medium hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "client",
        header: "Client",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {row.original.client}
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Illustrative
            </span>
          </div>
        ),
      },
      {
        accessorKey: "year",
        header: "Year",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {row.original.year}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} />
        ),
      },
      {
        accessorKey: "featured",
        header: "Featured",
        cell: ({ row }) =>
          row.original.featured ? (
            <span className="text-[10px] uppercase" style={{ color: "var(--accent-bright)" }}>
              Featured
            </span>
          ) : (
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              —
            </span>
          ),
      },
    ],
    []
  );

  const rowActions: DataTableRowAction<Project>[] = [
    {
      label: "Edit",
      icon: <Pencil className="size-3.5" />,
      onSelect: (row) => navigate(`/admin/projects/${row.slug}`),
    },
    {
      label: "Duplicate",
      icon: <Copy className="size-3.5" />,
      onSelect: (row) => {
        const newSlug = `${row.slug}-copy`;
        const copy: Project = {
          ...row,
          slug: newSlug,
          title: `${row.title} (copy)`,
          status: "planned",
          featured: false,
        };
        upsertProject(copy);
        toast.success("Project duplicated.");
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onSelect: (row) => setDeleteTarget(row),
      destructive: true,
    },
  ];

  const bulkActions: DataTableBulkAction<Project>[] = [
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onRun: (rows) => setBulkDelete(rows),
      destructive: true,
    },
  ];

  function handleCreate() {
    const slug = `project-${makeId("p").replace("p-", "")}`;
    const fresh: Project = {
      slug,
      title: "Untitled project",
      client: "Sample client (Illustrative)",
      location: "",
      year: new Date().getFullYear(),
      categories: [],
      challenge: "",
      solution: "",
      implementation: "",
      outcomes: [],
      gallery: [],
      relatedProjectSlugs: [],
      status: "planned",
      illustrative: true,
    };
    upsertProject(fresh);
    toast.success("New project created.");
    navigate(`/admin/projects/${slug}`);
  }

  return (
    <div>
      <AdminTableHeader
        title="Projects"
        description="Illustrative case studies. All sample content clearly labeled."
        icon={<Building2 className="size-4" />}
        createLabel="New project"
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
        ariaLabel="Projects"
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by title or client…"
        getSearchValue={(p) => `${p.title} ${p.client} ${p.slug}`}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onRowClick={(row) => navigate(`/admin/projects/${row.slug}`)}
        emptyTitle="No projects"
        emptyDescription="Add your first illustrative case study."
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            New project
          </Button>
        }
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete project?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently deleted.`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteProject(deleteTarget.slug);
          toast.success("Project deleted.");
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!bulkDelete}
        onOpenChange={(open) => !open && setBulkDelete(null)}
        title="Delete selected projects?"
        description={bulkDelete ? `${bulkDelete.length} project(s) will be deleted.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!bulkDelete) return;
          for (const r of bulkDelete) deleteProject(r.slug);
          toast.success(`${bulkDelete.length} project(s) deleted.`);
          setBulkDelete(null);
        }}
      />
    </div>
  );
}
