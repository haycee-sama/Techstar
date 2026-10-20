"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Copy, Trash2, Tags } from "lucide-react";
import { toast } from "sonner";
import {
  DataTable,
  type DataTableRowAction,
  type DataTableBulkAction,
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
  useGlobalSettings,
} from "@/lib/content-store";
import { makeId } from "@/lib/utils";
import type { Cta } from "@/lib/types";

// CTA entries are stored as globalSettings.ctas.primary / .secondary plus
// a derived list we keep in localStorage for the editor's "placement" model.
// For Phase 3b we keep a local shadow array in localStorage to represent
// arbitrary CTAs (header/footer/floating/contact).
const CTA_STORE_KEY = "techstar:admin:ctas";

interface CtaEntry extends Cta {
  id: string;
  placement: "header" | "footer" | "floating" | "contact";
  active: boolean;
}

function readStoredCtas(): CtaEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CTA_STORE_KEY);
    if (raw) return JSON.parse(raw) as CtaEntry[];
  } catch {
    // ignore
  }
  // Seed with the existing global CTA + a couple defaults.
  return [
    { id: "cta-1", label: "Request a consultation", href: "#/contact", variant: "primary", placement: "header", active: true },
    { id: "cta-2", label: "Explore solutions", href: "#/services", variant: "secondary", placement: "header", active: true },
    { id: "cta-3", label: "Talk to an expert", href: "#/contact", variant: "primary", placement: "floating", active: true },
    { id: "cta-4", label: "Schedule a consultation", href: "#/contact", variant: "primary", placement: "contact", active: true },
    { id: "cta-5", label: "Visit our insights", href: "#/insights", variant: "secondary", placement: "footer", active: false },
  ];
}

const PLACEMENT_OPTIONS = [
  { value: "header", label: "Header" },
  { value: "footer", label: "Footer" },
  { value: "floating", label: "Floating button" },
  { value: "contact", label: "Contact section" },
];
const VARIANT_OPTIONS = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "ghost", label: "Ghost" },
  { value: "outline", label: "Outline" },
];

export function CtasTable() {
  const global = useGlobalSettings();
  const { updateGlobalSettings } = useContentStore();

  const [entries, setEntries] = useState<CtaEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [editTarget, setEditTarget] = useState<CtaEntry | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CtaEntry | null>(null);
  const [bulkDelete, setBulkDelete] = useState<CtaEntry[] | null>(null);

  useEffect(() => {
    setEntries(readStoredCtas());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CTA_STORE_KEY, JSON.stringify(entries));
      // Sync primary CTA to globalSettings.ctas.primary for the public site.
      const primaryCta = entries.find((e) => e.placement === "header" && e.active);
      if (primaryCta) {
        updateGlobalSettings({
          ctas: {
            primary: {
              label: primaryCta.label,
              href: primaryCta.href,
              variant: primaryCta.variant as Cta["variant"] ?? "primary",
            },
            secondary: global.ctas.secondary,
          },
        });
      }
    } catch {
      // ignore
    }
     
  }, [entries, hydrated]);

  function persist(next: CtaEntry[]) {
    setEntries(next);
  }

  const columns = useMemo<ColumnDef<CtaEntry>[]>(
    () => [
      {
        accessorKey: "label",
        header: "Label",
        cell: ({ row }) => (
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>
            {row.original.label}
          </span>
        ),
      },
      {
        accessorKey: "href",
        header: "Href",
        cell: ({ row }) => (
          <code
            className="font-mono text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            {row.original.href}
          </code>
        ),
      },
      {
        accessorKey: "variant",
        header: "Variant",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {row.original.variant}
          </span>
        ),
      },
      {
        accessorKey: "placement",
        header: "Placement",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {PLACEMENT_OPTIONS.find((o) => o.value === row.original.placement)?.label ?? row.original.placement}
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

  const rowActions: DataTableRowAction<CtaEntry>[] = [
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
        const copy: CtaEntry = { ...row, id: makeId("cta"), label: `${row.label} (copy)` };
        persist([...entries, copy]);
        toast.success("CTA duplicated.");
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onSelect: (row) => setDeleteTarget(row),
      destructive: true,
    },
  ];

  const bulkActions: DataTableBulkAction<CtaEntry>[] = [
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onRun: (rows) => setBulkDelete(rows),
      destructive: true,
    },
  ];

  function handleCreate() {
    const fresh: CtaEntry = {
      id: makeId("cta"),
      label: "New CTA",
      href: "#/contact",
      variant: "primary",
      placement: "header",
      active: true,
    };
    setEditTarget(fresh);
    setEditOpen(true);
  }

  return (
    <div>
      <AdminTableHeader
        title="CTAs"
        description="Buttons that drive conversion. Synced to globalSettings.ctas on save."
        icon={<Tags className="size-4" />}
        createLabel="New CTA"
        onCreate={handleCreate}
      />
      <DataTable
        ariaLabel="CTAs"
        columns={columns}
        data={entries}
        searchPlaceholder="Search by label or href…"
        getSearchValue={(c) => `${c.label} ${c.href} ${c.placement}`}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onRowClick={(row) => {
          setEditTarget({ ...row });
          setEditOpen(true);
        }}
        emptyTitle="No CTAs"
        emptyDescription="Add your first call-to-action."
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            New CTA
          </Button>
        }
      />

      {editOpen && editTarget ? (
        <CtaEditorDialog
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditTarget(null);
          }}
          initial={editTarget}
          onSave={(entry) => {
            const exists = entries.some((e) => e.id === entry.id);
            const next = exists
              ? entries.map((e) => (e.id === entry.id ? entry : e))
              : [...entries, entry];
            persist(next);
            toast.success("CTA saved.", { description: entry.label });
            setEditOpen(false);
            setEditTarget(null);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete CTA?"
        description={deleteTarget ? `"${deleteTarget.label}" will be removed.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          persist(entries.filter((e) => e.id !== deleteTarget.id));
          toast.success("CTA deleted.");
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!bulkDelete}
        onOpenChange={(o) => !o && setBulkDelete(null)}
        title="Delete selected CTAs?"
        description={bulkDelete ? `${bulkDelete.length} CTA(s) will be deleted.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!bulkDelete) return;
          const ids = new Set(bulkDelete.map((e) => e.id));
          persist(entries.filter((e) => !ids.has(e.id)));
          toast.success(`${bulkDelete.length} CTA(s) deleted.`);
          setBulkDelete(null);
        }}
      />
    </div>
  );
}

interface CtaEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: CtaEntry;
  onSave: (entry: CtaEntry) => void;
}

function CtaEditorDialog({ open, onOpenChange, initial, onSave }: CtaEditorDialogProps) {
  const [draft, setDraft] = useState<CtaEntry>(initial);

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  function update(patch: Partial<CtaEntry>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit CTA</DialogTitle>
          <DialogDescription>
            Buttons that drive conversion. Header CTAs also sync to globalSettings.ctas.primary on save.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="cta-label" className="text-xs">Label</Label>
            <Input
              id="cta-label"
              value={draft.label}
              onChange={(e) => update({ label: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cta-href" className="text-xs">Href</Label>
            <Input
              id="cta-href"
              value={draft.href}
              onChange={(e) => update({ href: e.target.value })}
              placeholder="#/contact"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cta-variant" className="text-xs">Variant</Label>
              <Select
                value={draft.variant ?? "primary"}
                onValueChange={(v) => update({ variant: v as CtaEntry["variant"] })}
              >
                <SelectTrigger id="cta-variant" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VARIANT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="cta-placement" className="text-xs">Placement</Label>
              <Select
                value={draft.placement}
                onValueChange={(v) => update({ placement: v as CtaEntry["placement"] })}
              >
                <SelectTrigger id="cta-placement" className="h-9">
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
          <div className="flex items-center justify-between rounded-md border px-3 py-2" style={{ borderColor: "var(--border-subtle)" }}>
            <Label htmlFor="cta-active" className="text-xs">Active</Label>
            <Switch
              id="cta-active"
              checked={draft.active}
              onCheckedChange={(checked) => update({ active: !!checked })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (!draft.label.trim()) {
                toast.error("Label is required.");
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
