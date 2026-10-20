"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Copy, Trash2, ListChecks, GripVertical, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AdminTableHeader } from "./AdminTableHeader";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  useContentStore,
  useNavigation,
  useFooterLinks,
} from "@/lib/content-store";
import { makeId } from "@/lib/utils";
import type { NavItem, FooterLinkGroup } from "@/lib/types";

export function NavigationTable() {
  const navigation = useNavigation();
  const footerLinks = useFooterLinks();
  const { updateNavigation, updateFooterLinks } = useContentStore();

  function movePrimary(from: number, to: number) {
    if (to < 0 || to >= navigation.length) return;
    updateNavigation(arrayMove(navigation, from, to));
  }
  function removePrimary(idx: number) {
    updateNavigation(navigation.filter((_, i) => i !== idx));
    toast.success("Nav item removed.");
  }
  function duplicatePrimary(idx: number) {
    const item = navigation[idx];
    const copy: NavItem = {
      ...item,
      label: `${item.label} (copy)`,
      children: item.children?.map((c) => ({ ...c })),
    };
    updateNavigation([...navigation.slice(0, idx + 1), copy, ...navigation.slice(idx + 1)]);
    toast.success("Nav item duplicated.");
  }
  function addPrimary(item: NavItem) {
    updateNavigation([...navigation, item]);
    toast.success("Nav item added.");
  }
  function updatePrimary(idx: number, patch: Partial<NavItem>) {
    updateNavigation(navigation.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  return (
    <div>
      <AdminTableHeader
        title="Navigation"
        description="Header nav + footer link groups. Drag to reorder. Mega-menu children supported on header nav."
        icon={<ListChecks className="size-4" />}
      />

      <Tabs defaultValue="primary">
        <TabsList>
          <TabsTrigger value="primary">Primary nav</TabsTrigger>
          <TabsTrigger value="footer">Footer links</TabsTrigger>
        </TabsList>

        <TabsContent value="primary" className="mt-4">
          <PrimaryNavTab
            items={navigation}
            onMove={movePrimary}
            onRemove={removePrimary}
            onDuplicate={duplicatePrimary}
            onAdd={addPrimary}
            onUpdate={updatePrimary}
          />
        </TabsContent>

        <TabsContent value="footer" className="mt-4">
          <FooterLinksTab
            groups={footerLinks}
            onChange={(groups) => {
              updateFooterLinks(groups);
              toast.success("Footer links saved.");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ================= Primary nav tab =================

function PrimaryNavTab({
  items,
  onMove,
  onRemove,
  onDuplicate,
  onAdd,
  onUpdate,
}: {
  items: NavItem[];
  onMove: (from: number, to: number) => void;
  onRemove: (idx: number) => void;
  onDuplicate: (idx: number) => void;
  onAdd: (item: NavItem) => void;
  onUpdate: (idx: number, patch: Partial<NavItem>) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );
  const [editing, setEditing] = useState<{ idx: number; item: NavItem } | null>(null);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((_, i) => String(i) === active.id);
    const to = items.findIndex((_, i) => String(i) === over.id);
    if (from === -1 || to === -1) return;
    onMove(from, to);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Primary navigation</CardTitle>
            <CardDescription>
              Top-of-page menu. Items with children render a mega-menu on hover.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" />
            Add item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={items.map((_, i) => String(i))}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {items.length === 0 ? (
                <li className="py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  No primary nav items yet.
                </li>
              ) : (
                items.map((item, i) => (
                  <SortableNavItem
                    key={`${item.label}-${i}`}
                    id={String(i)}
                    item={item}
                    onEdit={() => setEditing({ idx: i, item })}
                    onDuplicate={() => onDuplicate(i)}
                    onRemove={() => setDeleteIdx(i)}
                  />
                ))
              )}
            </ul>
          </SortableContext>
        </DndContext>
      </CardContent>

      {editing ? (
        <NavItemDialog
          open
          onOpenChange={(o) => !o && setEditing(null)}
          initial={editing.item}
          onSave={(patched) => {
            onUpdate(editing.idx, patched);
            setEditing(null);
            toast.success("Nav item saved.");
          }}
        />
      ) : null}

      {addOpen ? (
        <NavItemDialog
          open
          onOpenChange={(o) => !o && setAddOpen(false)}
          initial={{ label: "", href: "#/" }}
          onSave={(item) => {
            onAdd(item);
            setAddOpen(false);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={deleteIdx !== null}
        onOpenChange={(o) => !o && setDeleteIdx(null)}
        title="Remove nav item?"
        description="This will remove the item from the primary navigation."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => {
          if (deleteIdx !== null) onRemove(deleteIdx);
          setDeleteIdx(null);
        }}
      />
    </Card>
  );
}

function SortableNavItem({
  id,
  item,
  onEdit,
  onDuplicate,
  onRemove,
}: {
  id: string;
  item: NavItem;
  onEdit: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };
  return (
    <li
      ref={setNodeRef}
      style={{
        ...style,
        borderColor: "var(--border-subtle)",
        backgroundColor: "var(--background)",
      }}
      className="flex items-center gap-2 rounded-md border px-2 py-1.5"
    >
      <button
        type="button"
        className="cursor-grab rounded p-1 hover:bg-[var(--surface-2)]"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" style={{ color: "var(--text-muted)" }} />
      </button>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {item.label || "Untitled"}
        </p>
        <p
          className="truncate font-mono text-[10px]"
          style={{ color: "var(--text-muted)" }}
        >
          {item.href}
          {item.children?.length ? ` · ${item.children.length} child links` : ""}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" className="size-7" onClick={onEdit} aria-label="Edit nav item">
          <Pencil className="size-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="size-7" onClick={onDuplicate} aria-label="Duplicate nav item">
          <Copy className="size-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-7 text-[var(--danger)]"
          onClick={onRemove}
          aria-label="Remove nav item"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </li>
  );
}

function NavItemDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: NavItem;
  onSave: (item: NavItem) => void;
}) {
  const [draft, setDraft] = useState<NavItem>(initial);

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  function update(patch: Partial<NavItem>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function updateChild(idx: number, patch: Partial<NonNullable<NavItem["children"]>[number]>) {
    setDraft((prev) => ({
      ...prev,
      children: (prev.children ?? []).map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));
  }
  function addChild() {
    setDraft((prev) => ({
      ...prev,
      children: [...(prev.children ?? []), { label: "", href: "#/", group: "General" }],
    }));
  }
  function removeChild(idx: number) {
    setDraft((prev) => ({
      ...prev,
      children: (prev.children ?? []).filter((_, i) => i !== idx),
    }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit nav item</DialogTitle>
          <DialogDescription>
            Label, href, and (optional) mega-menu children. Children appear grouped under their `group` field.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="nav-label" className="text-xs">Label</Label>
              <Input
                id="nav-label"
                value={draft.label}
                onChange={(e) => update({ label: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nav-href" className="text-xs">Href</Label>
              <Input
                id="nav-href"
                value={draft.href}
                onChange={(e) => update({ href: e.target.value })}
                placeholder="#/services"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Mega-menu children</Label>
            <div className="space-y-2">
              {(draft.children ?? []).length === 0 ? (
                <p className="text-[11px] italic" style={{ color: "var(--text-muted)" }}>
                  No children — item will render as a plain link.
                </p>
              ) : (
                (draft.children ?? []).map((c, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_120px_auto] gap-2">
                    <Input
                      aria-label="Child label"
                      value={c.label}
                      onChange={(e) => updateChild(i, { label: e.target.value })}
                      placeholder="Label"
                      className="h-9 text-xs"
                    />
                    <Input
                      aria-label="Child href"
                      value={c.href}
                      onChange={(e) => updateChild(i, { href: e.target.value })}
                      placeholder="#/services/cctv"
                      className="h-9 text-xs"
                    />
                    <Input
                      aria-label="Child group"
                      value={c.group ?? ""}
                      onChange={(e) => updateChild(i, { group: e.target.value })}
                      placeholder="Security"
                      className="h-9 text-xs"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-9 text-[var(--danger)]"
                      onClick={() => removeChild(i)}
                      aria-label="Remove child"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))
              )}
              <Button type="button" variant="outline" size="sm" onClick={addChild}>
                <Plus className="size-3.5" />
                Add child
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

// ================= Footer links tab =================

function FooterLinksTab({
  groups,
  onChange,
}: {
  groups: FooterLinkGroup[];
  onChange: (groups: FooterLinkGroup[]) => void;
}) {
  function updateGroup(idx: number, patch: Partial<FooterLinkGroup>) {
    onChange(groups.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  }
  function addGroup() {
    onChange([
      ...groups,
      { title: "New group", links: [{ label: "New link", href: "#/" }] },
    ]);
  }
  function removeGroup(idx: number) {
    onChange(groups.filter((_, i) => i !== idx));
    toast.success("Footer group removed.");
  }
  function updateLink(groupIdx: number, linkIdx: number, patch: Partial<FooterLinkGroup["links"][number]>) {
    onChange(
      groups.map((g, i) =>
        i === groupIdx
          ? {
              ...g,
              links: g.links.map((l, j) => (j === linkIdx ? { ...l, ...patch } : l)),
            }
          : g
      )
    );
  }
  function addLink(groupIdx: number) {
    onChange(
      groups.map((g, i) =>
        i === groupIdx ? { ...g, links: [...g.links, { label: "New link", href: "#/" }] } : g
      )
    );
  }
  function removeLink(groupIdx: number, linkIdx: number) {
    onChange(
      groups.map((g, i) =>
        i === groupIdx ? { ...g, links: g.links.filter((_, j) => j !== linkIdx) } : g
      )
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Footer link groups</CardTitle>
            <CardDescription>
              Multi-column footer rendered on every public page.
            </CardDescription>
          </div>
          <Button size="sm" onClick={addGroup}>
            <Plus className="size-3.5" />
            Add group
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {groups.map((g, gi) => (
            <div
              key={gi}
              className="rounded-md border p-3"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Input
                  aria-label="Group title"
                  value={g.title}
                  onChange={(e) => updateGroup(gi, { title: e.target.value })}
                  className="h-8 flex-1 text-xs font-medium"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-[var(--danger)]"
                  onClick={() => removeGroup(gi)}
                  aria-label="Remove group"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <ul className="space-y-1.5">
                {g.links.map((l, li) => (
                  <li key={li} className="grid grid-cols-[1fr_1fr_auto] gap-1.5">
                    <Input
                      aria-label="Link label"
                      value={l.label}
                      onChange={(e) => updateLink(gi, li, { label: e.target.value })}
                      placeholder="Label"
                      className="h-7 text-xs"
                    />
                    <Input
                      aria-label="Link href"
                      value={l.href}
                      onChange={(e) => updateLink(gi, li, { href: e.target.value })}
                      placeholder="#/about"
                      className="h-7 text-xs"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-[var(--danger)]"
                      onClick={() => removeLink(gi, li)}
                      aria-label="Remove link"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 h-7"
                onClick={() => addLink(gi)}
              >
                <Plus className="size-3" />
                Add link
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
