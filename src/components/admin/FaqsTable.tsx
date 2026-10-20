"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Copy, Trash2, HelpCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useContentStore,
  useFaqs,
  useServiceCategories,
} from "@/lib/content-store";
import { formatDate, makeId } from "@/lib/utils";
import type { Faq } from "@/lib/types";

export function FaqsTable() {
  const faqs = useFaqs();
  const categories = useServiceCategories();
  const { upsertFaq, deleteFaq } = useContentStore();

  const [editTarget, setEditTarget] = useState<Faq | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);
  const [bulkDelete, setBulkDelete] = useState<Faq[] | null>(null);

  const categoryName = useCallback(
    (slug: string) =>
      categories.find((c) => c.slug === slug)?.name ??
      (slug === "general" ? "General" : slug),
    [categories]
  );

  const columns = useMemo<ColumnDef<Faq>[]>(
    () => [
      {
        accessorKey: "question",
        header: "Question",
        cell: ({ row }) => (
          <span
            className="line-clamp-1 max-w-[320px] font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {row.original.question}
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
        accessorKey: "answer",
        header: "Answer",
        cell: ({ row }) => (
          <span
            className="line-clamp-1 max-w-[320px] text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {row.original.answer}
          </span>
        ),
      },
    ],
    [categoryName]
  );

  const rowActions: DataTableRowAction<Faq>[] = [
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
        const copy: Faq = { ...row, id: makeId("faq") };
        upsertFaq(copy);
        toast.success("FAQ duplicated.");
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onSelect: (row) => setDeleteTarget(row),
      destructive: true,
    },
  ];

  const bulkActions: DataTableBulkAction<Faq>[] = [
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onRun: (rows) => setBulkDelete(rows),
      destructive: true,
    },
  ];

  function handleCreate() {
    const fresh: Faq = {
      id: makeId("faq"),
      question: "",
      answer: "",
      categorySlug: "general",
    };
    setEditTarget(fresh);
    setEditOpen(true);
  }

  return (
    <div>
      <AdminTableHeader
        title="FAQs"
        description="Question/answer pairs shown on the /faq page and service pages."
        icon={<HelpCircle className="size-4" />}
        createLabel="New FAQ"
        onCreate={handleCreate}
      />
      <DataTable
        ariaLabel="FAQs"
        columns={columns}
        data={faqs}
        searchPlaceholder="Search by question…"
        getSearchValue={(f) => `${f.question} ${f.answer}`}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onRowClick={(row) => {
          setEditTarget({ ...row });
          setEditOpen(true);
        }}
        emptyTitle="No FAQs"
        emptyDescription="Add your first Q/A pair."
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            New FAQ
          </Button>
        }
      />

      {editOpen && editTarget ? (
        <FaqEditorDialog
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditTarget(null);
          }}
          initial={editTarget}
          categories={categories}
          onSave={(f) => {
            upsertFaq(f);
            toast.success("FAQ saved.", { description: f.question });
            setEditOpen(false);
            setEditTarget(null);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete FAQ?"
        description={deleteTarget ? `"${deleteTarget.question}" will be removed.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteFaq(deleteTarget.id);
          toast.success("FAQ deleted.");
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!bulkDelete}
        onOpenChange={(open) => !open && setBulkDelete(null)}
        title="Delete selected FAQs?"
        description={bulkDelete ? `${bulkDelete.length} FAQ(s) will be deleted.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!bulkDelete) return;
          for (const r of bulkDelete) deleteFaq(r.id);
          toast.success(`${bulkDelete.length} FAQ(s) deleted.`);
          setBulkDelete(null);
        }}
      />
    </div>
  );
}

interface FaqEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Faq;
  categories: { slug: string; name: string }[];
  onSave: (f: Faq) => void;
}

function FaqEditorDialog({
  open,
  onOpenChange,
  initial,
  categories,
  onSave,
}: FaqEditorDialogProps) {
  const [draft, setDraft] = useState<Faq>(initial);

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  function update(patch: Partial<Faq>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    if (!draft.question.trim()) {
      toast.error("Question is required.");
      return;
    }
    if (!draft.answer.trim()) {
      toast.error("Answer is required.");
      return;
    }
    onSave(draft);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit FAQ</DialogTitle>
          <DialogDescription>
            Question and answer shown on the /faq page and (if it has a service category) on the matching service page.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="faq-question" className="text-xs">Question</Label>
            <Input
              id="faq-question"
              value={draft.question}
              onChange={(e) => update({ question: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="faq-answer" className="text-xs">Answer</Label>
            <Textarea
              id="faq-answer"
              value={draft.answer}
              onChange={(e) => update({ answer: e.target.value })}
              rows={5}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="faq-category" className="text-xs">Category</Label>
            <Select
              value={draft.categorySlug}
              onValueChange={(v) => update({ categorySlug: v })}
            >
              <SelectTrigger id="faq-category" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
