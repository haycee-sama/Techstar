"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Mail, Trash2, Archive, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  DataTable,
  type DataTableBulkAction,
} from "./DataTable";
import { StatusBadge } from "./StatusBadge";
import { AdminTableHeader } from "./AdminTableHeader";
import { FilterSelect } from "./PagesTable";
import { ConfirmDialog } from "./ConfirmDialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useContentStore,
  useInquiries,
  useServices,
} from "@/lib/content-store";
import { formatDate } from "@/lib/utils";
import type { Inquiry, InquiryStatus } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "in-review", label: "In review" },
  { value: "qualified", label: "Qualified" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "archived", label: "Archived" },
];

export function InquiriesTable() {
  const inquiries = useInquiries();
  const services = useServices();
  const { updateInquiryStatus, deleteInquiry } = useContentStore();

  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [detailTarget, setDetailTarget] = useState<Inquiry | null>(null);
  const [bulkDelete, setBulkDelete] = useState<Inquiry[] | null>(null);
  const [bulkResolve, setBulkResolve] = useState<Inquiry[] | null>(null);

  const serviceName = useCallback(
    (slug?: string) =>
      slug ? services.find((s) => s.slug === slug)?.title ?? slug : "—",
    [services]
  );

  const filtered = useMemo(() => {
    return inquiries.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (serviceFilter !== "all" && i.serviceSlug !== serviceFilter) return false;
      return true;
    });
  }, [inquiries, statusFilter, serviceFilter]);

  const columns = useMemo<ColumnDef<Inquiry>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {row.original.name}
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {row.original.email}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {row.original.company ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "serviceSlug",
        header: "Service",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {serviceName(row.original.serviceSlug)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: "Received",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {formatDate(row.original.createdAt, "short")}
          </span>
        ),
      },
    ],
    [serviceName]
  );

  const bulkActions: DataTableBulkAction<Inquiry>[] = [
    {
      label: "Mark resolved",
      icon: <CheckCircle2 className="size-3.5" />,
      onRun: (rows) => setBulkResolve(rows),
    },
    {
      label: "Archive",
      icon: <Archive className="size-3.5" />,
      onRun: (rows) => setBulkResolve(rows.map((r) => ({ ...r, status: "archived" as InquiryStatus }))),
    },
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onRun: (rows) => setBulkDelete(rows),
      destructive: true,
    },
  ];

  function reply(inquiry: Inquiry) {
    const subject = `Re: Your Techstar inquiry — ${inquiry.name}`;
    const body = `Hi ${inquiry.name},\n\nThank you for reaching out. We received your inquiry and would love to discuss next steps.\n\n— Sample reply — Techstar`;
    window.location.href = `mailto:${inquiry.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    toast.success("Opening email client…", { description: "Demo — replace with real reply flow." });
  }

  return (
    <div>
      <AdminTableHeader
        title="Inquiries"
        description="Consultation requests submitted via the public contact form. All sample data is illustrative."
        icon={<Mail className="size-4" />}
        actions={
          <>
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              width="140px"
            />
            <FilterSelect
              label="Service"
              value={serviceFilter}
              onChange={setServiceFilter}
              options={[
                { value: "all", label: "All services" },
                ...services.map((s) => ({ value: s.slug, label: s.title })),
              ]}
              width="180px"
            />
          </>
        }
      />
      <DataTable
        ariaLabel="Inquiries"
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by name, company, email…"
        getSearchValue={(i) => `${i.name} ${i.company ?? ""} ${i.email}`}
        bulkActions={bulkActions}
        onRowClick={(row) => setDetailTarget({ ...row })}
        emptyTitle="No inquiries"
        emptyDescription="Submit one via the public contact form to see it here."
      />

      <Sheet
        open={!!detailTarget}
        onOpenChange={(open) => !open && setDetailTarget(null)}
      >
        <SheetContent className="w-full sm:max-w-[560px] overflow-y-auto">
          {detailTarget ? (
            <>
              <SheetHeader>
                <SheetTitle>{detailTarget.name}</SheetTitle>
                <SheetDescription>
                  Received {formatDate(detailTarget.createdAt, "long")}
                </SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-4 space-y-3 text-sm">
                <DetailRow label="Status">
                  <StatusBadge status={detailTarget.status} />
                </DetailRow>
                <DetailRow label="Email">
                  <a
                    href={`mailto:${detailTarget.email}`}
                    className="text-[var(--accent-bright)] hover:underline"
                  >
                    {detailTarget.email}
                  </a>
                </DetailRow>
                <DetailRow label="Phone">
                  {detailTarget.phone ?? "—"}
                </DetailRow>
                <DetailRow label="Company">
                  {detailTarget.company ?? "—"}
                </DetailRow>
                <DetailRow label="Location">
                  {detailTarget.location ?? "—"}
                </DetailRow>
                <DetailRow label="Service">
                  {serviceName(detailTarget.serviceSlug)}
                </DetailRow>
                <DetailRow label="Project type">
                  {detailTarget.projectType ?? "—"}
                </DetailRow>
                <DetailRow label="Budget">
                  {detailTarget.budget ?? "—"}
                </DetailRow>
                <DetailRow label="Preferred contact">
                  {detailTarget.preferredContact ?? "—"}
                </DetailRow>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    Message
                  </p>
                  <p style={{ color: "var(--text-primary)" }} className="rounded-md border p-3 text-xs leading-relaxed" >
                    {detailTarget.message}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    Update status
                  </p>
                  <Select
                    value={detailTarget.status}
                    onValueChange={(v: InquiryStatus) => {
                      updateInquiryStatus(detailTarget.id, v);
                      setDetailTarget({ ...detailTarget, status: v });
                      toast.success("Status updated.");
                    }}
                  >
                    <SelectTrigger className="h-9" aria-label="Update inquiry status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.filter((o) => o.value !== "all").map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => reply(detailTarget)}
                >
                  <Mail className="size-3.5" />
                  Reply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--danger)]"
                  onClick={() => {
                    deleteInquiry(detailTarget.id);
                    toast.success("Inquiry deleted.");
                    setDetailTarget(null);
                  }}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!bulkDelete}
        onOpenChange={(o) => !o && setBulkDelete(null)}
        title="Delete selected inquiries?"
        description={bulkDelete ? `${bulkDelete.length} inquiry(s) will be deleted.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!bulkDelete) return;
          for (const r of bulkDelete) deleteInquiry(r.id);
          toast.success(`${bulkDelete.length} inquiry(s) deleted.`);
          setBulkDelete(null);
        }}
      />

      <ConfirmDialog
        open={!!bulkResolve}
        onOpenChange={(o) => !o && setBulkResolve(null)}
        title="Update selected inquiries?"
        description={bulkResolve ? `${bulkResolve.length} inquiry(s) will be updated to ${bulkResolve[0]?.status}.` : ""}
        confirmLabel="Update"
        onConfirm={() => {
          if (!bulkResolve) return;
          for (const r of bulkResolve) {
            updateInquiryStatus(r.id, r.status);
          }
          toast.success(`${bulkResolve.length} inquiry(s) updated.`);
          setBulkResolve(null);
        }}
      />
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <div className="text-right text-xs" style={{ color: "var(--text-secondary)" }}>
        {children}
      </div>
    </div>
  );
}
