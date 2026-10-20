"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Copy, Trash2, Users } from "lucide-react";
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
  useContentStore,
  useTeam,
  useMedia,
} from "@/lib/content-store";
import { formatDate, makeId } from "@/lib/utils";
import type { TeamMember, SocialLink } from "@/lib/types";
import { StringArrayEditor } from "./form-helpers";

const SOCIAL_PLATFORMS: SocialLink["platform"][] = [
  "linkedin",
  "twitter",
  "youtube",
  "github",
  "instagram",
  "facebook",
  "rss",
];

export function TeamTable() {
  const team = useTeam();
  const { upsertTeam, deleteTeam } = useContentStore();

  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [bulkDelete, setBulkDelete] = useState<TeamMember[] | null>(null);

  const columns = useMemo<ColumnDef<TeamMember>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {row.original.role}
          </span>
        ),
      },
      {
        accessorKey: "bio",
        header: "Bio",
        cell: ({ row }) => (
          <span
            className="line-clamp-1 max-w-[320px] text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {row.original.bio}
          </span>
        ),
      },
      {
        id: "social",
        header: "Social",
        cell: ({ row }) => (
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {row.original.social.length} link(s)
          </span>
        ),
      },
      {
        accessorKey: "order",
        header: "Order",
        cell: ({ row }) => (
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {row.original.order ?? "—"}
          </span>
        ),
      },
    ],
    []
  );

  const rowActions: DataTableRowAction<TeamMember>[] = [
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
        const copy: TeamMember = {
          ...row,
          id: makeId("team"),
          name: `${row.name} (copy)`,
        };
        upsertTeam(copy);
        toast.success("Team member duplicated.");
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onSelect: (row) => setDeleteTarget(row),
      destructive: true,
    },
  ];

  const bulkActions: DataTableBulkAction<TeamMember>[] = [
    {
      label: "Delete",
      icon: <Trash2 className="size-3.5" />,
      onRun: (rows) => setBulkDelete(rows),
      destructive: true,
    },
  ];

  function handleCreate() {
    const fresh: TeamMember = {
      id: makeId("team"),
      name: "New team member",
      role: "",
      bio: "",
      social: [],
      order: team.length + 1,
    };
    setEditTarget(fresh);
    setEditOpen(true);
  }

  return (
    <div>
      <AdminTableHeader
        title="Team"
        description="Leadership and engineering team shown on the About page."
        icon={<Users className="size-4" />}
        createLabel="New member"
        onCreate={handleCreate}
      />
      <DataTable
        ariaLabel="Team"
        columns={columns}
        data={team}
        searchPlaceholder="Search by name or role…"
        getSearchValue={(m) => `${m.name} ${m.role}`}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onRowClick={(row) => {
          setEditTarget({ ...row });
          setEditOpen(true);
        }}
        emptyTitle="No team members"
        emptyDescription="Add your first leadership bio."
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            New member
          </Button>
        }
      />

      {editOpen && editTarget ? (
        <TeamEditorDialog
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditTarget(null);
          }}
          initial={editTarget}
          onSave={(m) => {
            upsertTeam(m);
            toast.success("Team member saved.", { description: m.name });
            setEditOpen(false);
            setEditTarget(null);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete team member?"
        description={deleteTarget ? `"${deleteTarget.name}" will be removed.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteTeam(deleteTarget.id);
          toast.success("Team member deleted.");
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!bulkDelete}
        onOpenChange={(open) => !open && setBulkDelete(null)}
        title="Delete selected members?"
        description={bulkDelete ? `${bulkDelete.length} member(s) will be deleted.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (!bulkDelete) return;
          for (const r of bulkDelete) deleteTeam(r.id);
          toast.success(`${bulkDelete.length} member(s) deleted.`);
          setBulkDelete(null);
        }}
      />
    </div>
  );
}

interface TeamEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: TeamMember;
  onSave: (m: TeamMember) => void;
}

function TeamEditorDialog({ open, onOpenChange, initial, onSave }: TeamEditorDialogProps) {
  const [draft, setDraft] = useState<TeamMember>(initial);
  const media = useMedia();

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  function update(patch: Partial<TeamMember>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    if (!draft.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    onSave(draft);
  }

  // Social links handled via ObjectArrayEditor-like inline list.
  const socials = draft.social ?? [];
  function addSocial() {
    update({
      social: [...socials, { id: makeId("soc"), platform: "linkedin", url: "" }],
    });
  }
  function removeSocial(idx: number) {
    update({ social: socials.filter((_, i) => i !== idx) });
  }
  function updateSocial(idx: number, patch: Partial<SocialLink>) {
    update({
      social: socials.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    });
  }

  const avatarUrl = draft.avatar
    ? media.find((m) => m.id === draft.avatar)?.url ?? draft.avatar
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Edit team member</DialogTitle>
          <DialogDescription>
            Leadership bios shown on the About page. All sample bios should be replaced before launch.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="flex size-14 items-center justify-center overflow-hidden rounded-full border"
              style={{
                borderColor: "var(--border-subtle)",
                backgroundColor: "var(--surface-2)",
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={draft.name} className="h-full w-full object-cover" />
              ) : (
                <Users className="size-5" style={{ color: "var(--text-muted)" }} />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="tm-avatar" className="text-xs">Avatar URL</Label>
              <Input
                id="tm-avatar"
                value={draft.avatar ?? ""}
                onChange={(e) => update({ avatar: e.target.value })}
                placeholder="Media id or image URL"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="tm-name" className="text-xs">Name</Label>
              <Input
                id="tm-name"
                value={draft.name}
                onChange={(e) => update({ name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tm-role" className="text-xs">Role</Label>
              <Input
                id="tm-role"
                value={draft.role}
                onChange={(e) => update({ role: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="tm-bio" className="text-xs">Bio</Label>
            <Textarea
              id="tm-bio"
              value={draft.bio}
              onChange={(e) => update({ bio: e.target.value })}
              rows={4}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tm-order" className="text-xs">Display order</Label>
            <Input
              id="tm-order"
              type="number"
              value={String(draft.order ?? 1)}
              onChange={(e) => update({ order: Number(e.target.value) || 1 })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Social links</Label>
            <div className="space-y-2">
              {socials.map((s, i) => (
                <div key={s.id} className="grid grid-cols-[140px_1fr_auto] gap-2">
                  <select
                    aria-label="Social platform"
                    value={s.platform}
                    onChange={(e) =>
                      updateSocial(i, { platform: e.target.value as SocialLink["platform"] })
                    }
                    className="h-9 rounded-md border px-2 text-xs"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--background)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <Input
                    aria-label="Social URL"
                    value={s.url}
                    onChange={(e) => updateSocial(i, { url: e.target.value })}
                    placeholder="https://…"
                    className="h-9 text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 text-[var(--danger)]"
                    onClick={() => removeSocial(i)}
                    aria-label="Remove social link"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addSocial}>
                Add social link
              </Button>
            </div>
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
