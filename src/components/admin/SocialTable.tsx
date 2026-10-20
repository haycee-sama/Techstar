"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Copy, Trash2, Link2 } from "lucide-react";
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
import {
  useContentStore,
  useGlobalSettings,
} from "@/lib/content-store";
import { makeId } from "@/lib/utils";
import type { SocialLink } from "@/lib/types";

const PLATFORM_OPTIONS: { value: SocialLink["platform"]; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter / X" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "github", label: "GitHub" },
  { value: "rss", label: "RSS" },
];

export function SocialTable() {
  const global = useGlobalSettings();
  const socials = global.socials;
  const { upsertSocial, deleteSocial } = useContentStore();

  const [editTarget, setEditTarget] = useState<SocialLink | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SocialLink | null>(null);
  const [bulkDelete, setBulkDelete] = useState<SocialLink[] | null>(null);

  const columns = useMemo<ColumnDef<SocialLink>[]>(
    () => [
      {
        accessorKey: "platform",
        header: "Platform",
        cell: ({ row }) => (
          <span className="text-xs uppercase" style={{ color: "var(--accent-bright)" }}>
            {row.original.platform}
          </span>
        ),
      },
      {
        accessorKey: "url",
        header: "URL",
        cell: ({ row }) => (
          <a
            href={row.original.url}
            target="_blank"
            rel="noreferrer noopener"
            className="line-clamp-1 max-w-[260px] text-xs hover:underline"
            style={{ color: "var(--text-secondary)" }}
          >
            {row.original.url}
          </a>
        ),
      },
      {
        accessorKey: "handle",
        header: "Handle",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {row.original.handle ?? "—"}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: () => <StatusBadge status="active" />,
      },
    ],
    []
  );

  const rowActions: DataTableRowAction<SocialLink>[] = [
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
        const copy: SocialLink = { ...row, id: makeId("soc") };
        upsertSocial(copy);
        toast.success("Social link duplicated.");
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onSelect: (row) => setDeleteTarget(row),
      destructive: true,
    },
  ];

  const bulkActions: DataTableBulkAction<SocialLink>[] = [
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onRun: (rows) => setBulkDelete(rows),
      destructive: true,
    },
  ];

  function handleCreate() {
    const fresh: SocialLink = {
      id: makeId("soc"),
      platform: "linkedin",
      url: "",
    };
    setEditTarget(fresh);
    setEditOpen(true);
  }

  return (
    <div>
      <AdminTableHeader
        title="Social links"
        description="Social profiles shown in the footer and on team-member cards."
        icon={<Link2 className="size-4" />}
        createLabel="New link"
        onCreate={handleCreate}
      />
      <DataTable
        ariaLabel="Social links"
        columns={columns}
        data={socials}
        searchPlaceholder="Search by platform or url…"
        getSearchValue={(s) => `${s.platform} ${s.url}`}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onRowClick={(row) => {
          setEditTarget({ ...row });
          setEditOpen(true);
        }}
        emptyTitle="No social links"
        emptyDescription="Add your first profile."
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            New link
          </Button>
        }
      />

      {editOpen && editTarget ? (
        <SocialEditorDialog
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditTarget(null);
          }}
          initial={editTarget}
          onSave={(s) => {
            upsertSocial(s);
            toast.success("Social link saved.");
            setEditOpen(false);
            setEditTarget(null);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete social link?"
        description={deleteTarget ? `${deleteTarget.platform} link will be removed.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteSocial(deleteTarget.id);
          toast.success("Social link deleted.");
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!bulkDelete}
        onOpenChange={(o) => !o && setBulkDelete(null)}
        title="Delete selected links?"
        description={bulkDelete ? `${bulkDelete.length} link(s) will be deleted.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!bulkDelete) return;
          for (const r of bulkDelete) deleteSocial(r.id);
          toast.success(`${bulkDelete.length} link(s) deleted.`);
          setBulkDelete(null);
        }}
      />
    </div>
  );
}

interface SocialEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: SocialLink;
  onSave: (s: SocialLink) => void;
}

function SocialEditorDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: SocialEditorDialogProps) {
  const [draft, setDraft] = useState<SocialLink>(initial);

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  function update(patch: Partial<SocialLink>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit social link</DialogTitle>
          <DialogDescription>
            Shown in the footer and on team-member cards. Handle is optional.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="soc-platform" className="text-xs">Platform</Label>
            <Select
              value={draft.platform}
              onValueChange={(v) => update({ platform: v as SocialLink["platform"] })}
            >
              <SelectTrigger id="soc-platform" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="soc-url" className="text-xs">URL</Label>
            <Input
              id="soc-url"
              value={draft.url}
              onChange={(e) => update({ url: e.target.value })}
              placeholder="https://linkedin.com/company/techstar"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="soc-handle" className="text-xs">Handle (optional)</Label>
            <Input
              id="soc-handle"
              value={draft.handle ?? ""}
              onChange={(e) => update({ handle: e.target.value || undefined })}
              placeholder="@techstar"
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
              if (!draft.url.trim()) {
                toast.error("URL is required.");
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
