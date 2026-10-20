"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  DataTable,
  type DataTableRowAction,
} from "./DataTable";
import { AdminTableHeader } from "./AdminTableHeader";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/router";
import {
  useLegalPages,
} from "@/lib/content-store";
import { formatDate } from "@/lib/utils";
import type { LegalPage } from "@/lib/types";

export function LegalTable() {
  const legalPages = useLegalPages();
  const { navigate } = useRouter();

  const columns = useMemo<ColumnDef<LegalPage>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Document",
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
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {formatDate(row.original.updatedAt, "short")}
          </span>
        ),
      },
      {
        id: "length",
        header: "Length",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {row.original.body.length} chars
          </span>
        ),
      },
    ],
    []
  );

  const rowActions: DataTableRowAction<LegalPage>[] = [
    {
      label: "Edit",
      icon: <Pencil className="size-3.5" />,
      onSelect: (row) => navigate(`/admin/legal/${row.slug}`),
    },
    {
      label: "Preview",
      onSelect: (row) => {
        const publicSlug = row.slug === "cookie" ? "cookie-preferences" : row.slug;
        window.open(`#/${publicSlug}`, "_blank");
        toast.info("Opening public page…");
      },
    },
  ];

  return (
    <div>
      <AdminTableHeader
        title="Legal documents"
        description="Privacy Policy, Terms of Service, and Cookie Policy. Sample content clearly labeled."
        icon={<FileText className="size-4" />}
      />
      <DataTable
        ariaLabel="Legal documents"
        columns={columns}
        data={legalPages}
        searchPlaceholder="Search by title or slug…"
        getSearchValue={(p) => `${p.title} ${p.slug}`}
        rowActions={rowActions}
        onRowClick={(row) => navigate(`/admin/legal/${row.slug}`)}
        emptyTitle="No legal documents"
        emptyDescription="Privacy, Terms, and Cookie pages are seeded by default."
      />
    </div>
  );
}
