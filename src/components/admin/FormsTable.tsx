"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Copy, Trash2, Shapes, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DataTable,
  type DataTableRowAction,
} from "./DataTable";
import { StatusBadge } from "./StatusBadge";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useContentStore,
  useForms,
} from "@/lib/content-store";
import { makeId } from "@/lib/utils";
import type { FormDefinition, FormFieldDefinition } from "@/lib/types";

const PLACEMENT_OPTIONS = [
  { value: "contact", label: "Contact page" },
  { value: "newsletter", label: "Newsletter" },
  { value: "consultation", label: "Consultation wizard" },
  { value: "footer", label: "Footer" },
];
const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio" },
];

export function FormsTable() {
  const forms = useForms();
  const { upsertForm, deleteForm } = useContentStore();

  const [editTarget, setEditTarget] = useState<FormDefinition | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FormDefinition | null>(null);

  const columns = useMemo<ColumnDef<FormDefinition>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Form",
        cell: ({ row }) => (
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>
            {row.original.title}
          </span>
        ),
      },
      {
        accessorKey: "placement",
        header: "Placement",
        cell: ({ row }) => (
          <span className="text-xs uppercase" style={{ color: "var(--accent-bright)" }}>
            {row.original.placement}
          </span>
        ),
      },
      {
        accessorKey: "fields",
        header: "Fields",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {row.original.fields.length}
          </span>
        ),
      },
      {
        accessorKey: "submitLabel",
        header: "Submit label",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {row.original.submitLabel}
          </span>
        ),
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.active ? "active" : "inactive"} />
        ),
      },
    ],
    []
  );

  const rowActions: DataTableRowAction<FormDefinition>[] = [
    {
      label: "Edit",
      icon: <Pencil className="size-3.5" />,
      onSelect: (row) => {
        setEditTarget({ ...row, fields: row.fields.map((f) => ({ ...f })) });
        setEditOpen(true);
      },
    },
    {
      label: "Duplicate",
      icon: <Copy className="size-3.5" />,
      onSelect: (row) => {
        const copy: FormDefinition = {
          ...row,
          id: makeId("form"),
          title: `${row.title} (copy)`,
          fields: row.fields.map((f) => ({ ...f, id: makeId("ff") })),
          active: false,
        };
        upsertForm(copy);
        toast.success("Form duplicated.");
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onSelect: (row) => setDeleteTarget(row),
      destructive: true,
    },
  ];

  function handleCreate() {
    const fresh: FormDefinition = {
      id: makeId("form"),
      title: "New form",
      description: "",
      placement: "contact",
      submitLabel: "Submit",
      submitEndpoint: "demo://inquiry",
      active: true,
      fields: [],
    };
    setEditTarget(fresh);
    setEditOpen(true);
  }

  return (
    <div>
      <AdminTableHeader
        title="Forms"
        description="Configurable form definitions. Persisted here — public form rendering will consume them in Phase 4+ integration."
        icon={<Shapes className="size-4" />}
        createLabel="New form"
        onCreate={handleCreate}
      />
      <DataTable
        ariaLabel="Forms"
        columns={columns}
        data={forms}
        searchPlaceholder="Search by title or placement…"
        getSearchValue={(f) => `${f.title} ${f.placement}`}
        rowActions={rowActions}
        onRowClick={(row) => {
          setEditTarget({ ...row, fields: row.fields.map((f) => ({ ...f })) });
          setEditOpen(true);
        }}
        emptyTitle="No forms"
        emptyDescription="Add your first form definition."
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            New form
          </Button>
        }
      />

      {editOpen && editTarget ? (
        <FormEditorDialog
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditTarget(null);
          }}
          initial={editTarget}
          onSave={(f) => {
            upsertForm(f);
            toast.success("Form saved.", { description: f.title });
            toast.info("Demo: form rendering will use this config in Phase 4+ integration.");
            setEditOpen(false);
            setEditTarget(null);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete form?"
        description={deleteTarget ? `"${deleteTarget.title}" will be removed.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteForm(deleteTarget.id);
          toast.success("Form deleted.");
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

interface FormEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: FormDefinition;
  onSave: (f: FormDefinition) => void;
}

function FormEditorDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: FormEditorDialogProps) {
  const [draft, setDraft] = useState<FormDefinition>(initial);

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  function update(patch: Partial<FormDefinition>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function updateField(idx: number, patch: Partial<FormFieldDefinition>) {
    setDraft((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)),
    }));
  }
  function addField() {
    setDraft((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          id: makeId("ff"),
          label: "New field",
          type: "text",
          name: `field_${prev.fields.length + 1}`,
          required: false,
        },
      ],
    }));
  }
  function removeField(idx: number) {
    setDraft((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== idx),
    }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>Edit form</DialogTitle>
          <DialogDescription>
            Persisted to the content store. Public form rendering will use this config in Phase 4+ integration.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="form-title" className="text-xs">Title</Label>
              <Input
                id="form-title"
                value={draft.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="form-placement" className="text-xs">Placement</Label>
              <Select
                value={draft.placement}
                onValueChange={(v) => update({ placement: v as FormDefinition["placement"] })}
              >
                <SelectTrigger id="form-placement" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLACEMENT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="form-desc" className="text-xs">Description (optional)</Label>
            <Textarea
              id="form-desc"
              value={draft.description ?? ""}
              onChange={(e) => update({ description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="form-submit" className="text-xs">Submit label</Label>
              <Input
                id="form-submit"
                value={draft.submitLabel}
                onChange={(e) => update({ submitLabel: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="form-endpoint" className="text-xs">Endpoint (demo)</Label>
              <Input
                id="form-endpoint"
                value={draft.submitEndpoint ?? ""}
                onChange={(e) => update({ submitEndpoint: e.target.value })}
                placeholder="demo://inquiry"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2" style={{ borderColor: "var(--border-subtle)" }}>
            <Label htmlFor="form-active" className="text-xs">Active</Label>
            <Switch
              id="form-active"
              checked={draft.active}
              onCheckedChange={(checked) => update({ active: !!checked })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Fields</Label>
            <div className="space-y-2">
              {draft.fields.length === 0 ? (
                <p className="text-[11px] italic" style={{ color: "var(--text-muted)" }}>
                  No fields yet. Add at least one field to make the form usable.
                </p>
              ) : (
                draft.fields.map((f, i) => (
                  <div
                    key={f.id}
                    className="rounded-md border p-2"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <div className="grid grid-cols-[1fr_120px_1fr_auto] gap-2">
                      <Input
                        aria-label="Field label"
                        value={f.label}
                        onChange={(e) => updateField(i, { label: e.target.value })}
                        placeholder="Label"
                        className="h-8 text-xs"
                      />
                      <Select
                        value={f.type}
                        onValueChange={(v) =>
                          updateField(i, { type: v as FormFieldDefinition["type"] })
                        }
                      >
                        <SelectTrigger aria-label="Field type" className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPE_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        aria-label="Field name"
                        value={f.name}
                        onChange={(e) => updateField(i, { name: e.target.value })}
                        placeholder="name (no spaces)"
                        className="h-8 text-xs font-mono"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-[var(--danger)]"
                        onClick={() => removeField(i)}
                        aria-label="Remove field"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Input
                        aria-label="Field placeholder"
                        value={f.placeholder ?? ""}
                        onChange={(e) =>
                          updateField(i, { placeholder: e.target.value || undefined })
                        }
                        placeholder="Placeholder"
                        className="h-8 text-xs"
                      />
                      <Input
                        aria-label="Field validation hint"
                        value={f.validationHint ?? ""}
                        onChange={(e) =>
                          updateField(i, { validationHint: e.target.value || undefined })
                        }
                        placeholder="Validation hint (e.g. min 30 chars)"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <Label htmlFor={`field-required-${f.id}`} className="text-[10px]">
                        Required
                      </Label>
                      <Switch
                        id={`field-required-${f.id}`}
                        checked={f.required}
                        onCheckedChange={(checked) => updateField(i, { required: !!checked })}
                      />
                    </div>
                  </div>
                ))
              )}
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                <Plus className="size-3.5" />
                Add field
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (!draft.title.trim()) {
                toast.error("Title is required.");
                return;
              }
              onSave(draft);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
