"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Copy, Trash2, MessageSquareQuote } from "lucide-react";
import { toast } from "sonner";
import {
  DataTable,
  type DataTableRowAction,
  type DataTableBulkAction,
} from "./DataTable";
import { AdminTableHeader } from "./AdminTableHeader";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useContentStore,
  useTestimonials,
} from "@/lib/content-store";
import { makeId } from "@/lib/utils";
import type { Testimonial } from "@/lib/types";

export function TestimonialsTable() {
  const testimonials = useTestimonials();
  const { upsertTestimonial, deleteTestimonial } = useContentStore();

  const [editTarget, setEditTarget] = useState<Testimonial | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [bulkDelete, setBulkDelete] = useState<Testimonial[] | null>(null);

  const columns = useMemo<ColumnDef<Testimonial>[]>(
    () => [
      {
        accessorKey: "quote",
        header: "Quote",
        cell: ({ row }) => (
          <span
            className="line-clamp-1 max-w-[360px] text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            “{row.original.quote}”
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Author",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {row.original.company}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {row.original.role}
          </span>
        ),
      },
    ],
    []
  );

  const rowActions: DataTableRowAction<Testimonial>[] = [
    {
      label: "Edit",
      icon: <Pencil className="size-3.5" />,
      onSelect: (row) => {
        setEditTarget({ ...row });
        setEditOpen(true);
      },
    },
    {
      label: "Duplicate",
      icon: <Copy className="size-3.5" />,
      onSelect: (row) => {
        const copy: Testimonial = {
          ...row,
          id: makeId("testimonial"),
          name: `${row.name} (copy)`,
        };
        upsertTestimonial(copy);
        toast.success("Testimonial duplicated.");
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onSelect: (row) => setDeleteTarget(row),
      destructive: true,
    },
  ];

  const bulkActions: DataTableBulkAction<Testimonial>[] = [
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onRun: (rows) => setBulkDelete(rows),
      destructive: true,
    },
  ];

  function handleCreate() {
    const fresh: Testimonial = {
      id: makeId("testimonial"),
      quote: "",
      name: "",
      role: "",
      company: "",
      illustrative: true,
    };
    setEditTarget(fresh);
    setEditOpen(true);
  }

  return (
    <div>
      <AdminTableHeader
        title="Testimonials"
        description="Customer quotes shown on the home page and project case studies. All illustrative."
        icon={<MessageSquareQuote className="size-4" />}
        createLabel="New testimonial"
        onCreate={handleCreate}
      />
      <DataTable
        ariaLabel="Testimonials"
        columns={columns}
        data={testimonials}
        searchPlaceholder="Search by quote or author…"
        getSearchValue={(t) => `${t.quote} ${t.name} ${t.company}`}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onRowClick={(row) => {
          setEditTarget({ ...row });
          setEditOpen(true);
        }}
        emptyTitle="No testimonials"
        emptyDescription="Add your first illustrative quote."
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            New testimonial
          </Button>
        }
      />

      {editOpen && editTarget ? (
        <TestimonialEditorDialog
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditTarget(null);
          }}
          initial={editTarget}
          onSave={(t) => {
            upsertTestimonial(t);
            toast.success("Testimonial saved.", { description: t.name });
            setEditOpen(false);
            setEditTarget(null);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete testimonial?"
        description={deleteTarget ? `"${deleteTarget.name}'s testimonial will be removed.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteTestimonial(deleteTarget.id);
          toast.success("Testimonial deleted.");
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!bulkDelete}
        onOpenChange={(open) => !open && setBulkDelete(null)}
        title="Delete selected testimonials?"
        description={bulkDelete ? `${bulkDelete.length} testimonial(s) will be deleted.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!bulkDelete) return;
          for (const r of bulkDelete) deleteTestimonial(r.id);
          toast.success(`${bulkDelete.length} testimonial(s) deleted.`);
          setBulkDelete(null);
        }}
      />
    </div>
  );
}

interface TestimonialEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Testimonial;
  onSave: (t: Testimonial) => void;
}

function TestimonialEditorDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: TestimonialEditorDialogProps) {
  const [draft, setDraft] = useState<Testimonial>(initial);

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  function update(patch: Partial<Testimonial>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    if (!draft.quote.trim()) {
      toast.error("Quote is required.");
      return;
    }
    if (!draft.name.trim()) {
      toast.error("Author is required.");
      return;
    }
    onSave({ ...draft, illustrative: true });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit testimonial</DialogTitle>
          <DialogDescription>
            Customer quotes shown on the home testimonials slider and project case studies. Sample content is labeled illustrative.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="ts-quote" className="text-xs">Quote</Label>
            <Textarea
              id="ts-quote"
              value={draft.quote}
              onChange={(e) => update({ quote: e.target.value })}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ts-name" className="text-xs">Author name</Label>
              <Input
                id="ts-name"
                value={draft.name}
                onChange={(e) => update({ name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ts-role" className="text-xs">Role</Label>
              <Input
                id="ts-role"
                value={draft.role}
                onChange={(e) => update({ role: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="ts-company" className="text-xs">Company</Label>
            <Input
              id="ts-company"
              value={draft.company}
              onChange={(e) => update({ company: e.target.value })}
              placeholder="Meridian Properties (Illustrative)"
            />
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2" style={{ borderColor: "var(--border-subtle)" }}>
            <Label htmlFor="ts-illustrative" className="text-xs">
              Mark as illustrative sample
            </Label>
            <Switch
              id="ts-illustrative"
              checked={draft.illustrative}
              onCheckedChange={() => update({ illustrative: true })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={save}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
