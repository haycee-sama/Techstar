"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Megaphone, Pencil, Copy, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  useContentStore,
  useContent,
} from "@/lib/content-store";
import { formatDate, makeId } from "@/lib/utils";
import type { Announcement } from "@/lib/types";

export function AnnouncementsTable() {
  const announcements = useContent().announcements;
  const { upsertAnnouncement, deleteAnnouncement, updateAnnouncement } = useContentStore();

  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  const columns = useMemo<ColumnDef<Announcement>[]>(
    () => [
      {
        accessorKey: "message",
        header: "Message",
        cell: ({ row }) => (
          <span
            className="line-clamp-1 max-w-[360px] text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {row.original.message}
          </span>
        ),
      },
      {
        accessorKey: "ctaLabel",
        header: "CTA",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {row.original.ctaLabel ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "startAt",
        header: "Window",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {row.original.startAt ? formatDate(row.original.startAt, "short") : "—"}
            {" → "}
            {row.original.endAt ? formatDate(row.original.endAt, "short") : "—"}
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

  const rowActions: DataTableRowAction<Announcement>[] = [
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
        const copy: Announcement = { ...row, id: makeId("announcement"), active: false };
        upsertAnnouncement(copy);
        toast.success("Announcement duplicated.");
      },
    },
    {
      label: row.original.active ? "Deactivate" : "Activate",
      onSelect: (row) => {
        // Single-active rule: activating one deactivates the others via the
        // store's upsertAnnouncement logic. For deactivate, just clear the
        // flag on this row only.
        if (row.active) {
          updateAnnouncement(row.id, { active: false });
          toast.info("Announcement deactivated.");
        } else {
          upsertAnnouncement({ ...row, active: true });
          toast.success("Announcement activated — others deactivated.");
        }
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
    const fresh: Announcement = {
      id: makeId("announcement"),
      message: "",
      active: false,
    };
    setEditTarget(fresh);
    setEditOpen(true);
  }

  return (
    <div>
      <AdminTableHeader
        title="Announcements"
        description="Top-of-page banner. Only one announcement can be active at a time — activating one deactivates the rest."
        icon={<Megaphone className="size-4" />}
        createLabel="New announcement"
        onCreate={handleCreate}
      />
      <DataTable
        ariaLabel="Announcements"
        columns={columns}
        data={announcements}
        searchPlaceholder="Search by message…"
        getSearchValue={(a) => a.message}
        rowActions={rowActions}
        onRowClick={(row) => {
          setEditTarget({ ...row });
          setEditOpen(true);
        }}
        emptyTitle="No announcements"
        emptyDescription="Add your first banner announcement."
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            New announcement
          </Button>
        }
      />

      {editOpen && editTarget ? (
        <AnnouncementEditorDialog
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditTarget(null);
          }}
          initial={editTarget}
          onSave={(a) => {
            upsertAnnouncement(a);
            toast.success("Announcement saved.");
            setEditOpen(false);
            setEditTarget(null);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete announcement?"
        description={deleteTarget ? `This announcement will be removed.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteAnnouncement(deleteTarget.id);
          toast.success("Announcement deleted.");
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

interface AnnouncementEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Announcement;
  onSave: (a: Announcement) => void;
}

function AnnouncementEditorDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: AnnouncementEditorDialogProps) {
  const [draft, setDraft] = useState<Announcement>(initial);

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  function update(patch: Partial<Announcement>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function toLocalInput(iso?: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  }
  function fromLocalInput(local: string): string | undefined {
    if (!local) return undefined;
    const d = new Date(local);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit announcement</DialogTitle>
          <DialogDescription>
            Banner shown at the top of every public page. Only one announcement can be active at a time — activating this will deactivate the others.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="ann-message" className="text-xs">Message</Label>
            <Input
              id="ann-message"
              value={draft.message}
              onChange={(e) => update({ message: e.target.value })}
              placeholder="Schedule a Q1 security readiness consultation…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ann-cta-label" className="text-xs">CTA label</Label>
              <Input
                id="ann-cta-label"
                value={draft.ctaLabel ?? ""}
                onChange={(e) => update({ ctaLabel: e.target.value || undefined })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ann-cta-href" className="text-xs">CTA href</Label>
              <Input
                id="ann-cta-href"
                value={draft.ctaHref ?? ""}
                onChange={(e) => update({ ctaHref: e.target.value || undefined })}
                placeholder="#/contact"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ann-start" className="text-xs">Start at</Label>
              <Input
                id="ann-start"
                type="datetime-local"
                value={toLocalInput(draft.startAt)}
                onChange={(e) => update({ startAt: fromLocalInput(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ann-end" className="text-xs">End at</Label>
              <Input
                id="ann-end"
                type="datetime-local"
                value={toLocalInput(draft.endAt)}
                onChange={(e) => update({ endAt: fromLocalInput(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2" style={{ borderColor: "var(--border-subtle)" }}>
            <Label htmlFor="ann-active" className="text-xs">
              Active (deactivates others)
            </Label>
            <Switch
              id="ann-active"
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
              if (!draft.message.trim()) {
                toast.error("Message is required.");
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
