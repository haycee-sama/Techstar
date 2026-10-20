"use client";

import {
  createElement,
  useState,
} from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, Copy, Trash2, GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSectionLibraryItem } from "@/lib/section-library";
import type { Section } from "@/lib/types";
import * as Icons from "lucide-react";

interface SectionNavigatorProps {
  sections: Section[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onReorder: (next: Section[]) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onInsertOpen: () => void;
}

function getSectionIcon(type: string): Icons.LucideIcon {
  const lib = getSectionLibraryItem(type as Section["type"]);
  if (!lib) return Icons.Square;
  return (
    (Icons as unknown as Record<string, Icons.LucideIcon>)[lib.icon] ?? Icons.Square
  );
}

function getSectionName(section: Section): string {
  const lib = getSectionLibraryItem(section.type);
  return lib?.name ?? section.type;
}

/**
 * Render a section-type icon by resolving its Lucide component by name.
 * Uses `createElement` so we never assign a PascalCase variable inside
 * a component body (which would trip the
 * `react-hooks/static-components` rule).
 */
function SectionTypeIcon({
  type,
  className,
  style,
}: {
  type: Section["type"];
  className?: string;
  style?: React.CSSProperties;
}) {
  return createElement(getSectionIcon(type), {
    className,
    style,
    "aria-hidden": true,
  });
}

/**
 * Left rail of the visual builder — a draggable, sortable list of the
 * page's sections. Each row shows a drag handle, the section icon,
 * name, variant, and quick actions (visibility, duplicate, delete).
 *
 * Uses @dnd-kit/sortable with Pointer + Keyboard + Touch sensors so
 * the same affordance works on desktop and touch devices.
 */
export function SectionNavigator({
  sections,
  selectedId,
  onSelect,
  onReorder,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  onInsertOpen,
}: SectionNavigatorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } })
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(sections, oldIndex, newIndex));
  }

  const activeSection = sections.find((s) => s.id === activeId) ?? null;

  return (
    <aside
      className="flex h-full flex-col border-r"
      style={{
        backgroundColor: "var(--surface-1)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <header
        className="flex items-center justify-between border-b px-3 py-2.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Sections
          </h3>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {sections.length} {sections.length === 1 ? "section" : "sections"}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onInsertOpen} className="h-7 gap-1 px-2 text-xs">
          <Plus className="size-3" />
          Insert
        </Button>
      </header>

      <ScrollArea className="flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="p-2">
              {sections.length === 0 ? (
                <li
                  className="rounded-md border border-dashed p-6 text-center text-xs"
                  style={{
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-muted)",
                  }}
                >
                  No sections yet. Click &ldquo;Insert&rdquo; to add one.
                </li>
              ) : (
                sections.map((section, idx) => (
                  <NavigatorRow
                    key={section.id}
                    section={section}
                    index={idx}
                    selected={section.id === selectedId}
                    onSelect={() => onSelect(section.id === selectedId ? null : section.id)}
                    onDuplicate={() => onDuplicate(section.id)}
                    onDelete={() => onDelete(section.id)}
                    onToggleVisibility={() => onToggleVisibility(section.id)}
                  />
                ))
              )}
            </ul>
          </SortableContext>
          <DragOverlay>
            {activeSection ? (
              <div
                className="rounded-md border bg-[var(--surface-2)] px-3 py-2 text-xs font-medium shadow-lg"
                style={{ borderColor: "var(--accent-bright)" }}
              >
                {getSectionName(activeSection)}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </ScrollArea>
    </aside>
  );
}

function NavigatorRow({
  section,
  index,
  selected,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleVisibility,
}: {
  section: Section;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });
  const name = getSectionName(section);
  const hidden = section.visible === false;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="mb-1"
    >
      <div
        className={[
          "group flex items-center gap-1 rounded-md border px-1.5 py-1.5",
          selected ? "ring-1" : "",
        ].join(" ")}
        style={{
          backgroundColor: selected ? "var(--surface-2)" : "transparent",
          borderColor: selected ? "var(--accent-bright)" : "var(--border-subtle)",
          // @ts-expect-error CSS custom property
          "--tw-ring-color": "var(--accent-bright)",
        }}
      >
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 outline-none focus:ring-2"
          aria-label={`Drag to reorder ${name}`}
          {...attributes}
          {...listeners}
          style={{ color: "var(--text-muted)" }}
        >
          <GripVertical className="size-3.5" aria-hidden />
        </button>

        <span
          className="flex size-5 shrink-0 items-center justify-center rounded text-[10px]"
          style={{ color: "var(--text-muted)" }}
          aria-hidden
        >
          {index + 1}
        </span>

        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-2 rounded px-1.5 py-1 text-left outline-none"
          aria-pressed={selected}
        >
          <SectionTypeIcon
            type={section.type}
            className="size-3.5 shrink-0"
            style={{ color: "var(--accent-bright)" }}
          />
          <span
            className="truncate text-xs font-medium"
            style={{ color: hidden ? "var(--text-muted)" : "var(--text-primary)" }}
          >
            {name}
          </span>
          {section.variant ? (
            <span
              className="rounded px-1 text-[9px] uppercase tracking-wide"
              style={{
                backgroundColor: "var(--surface-2)",
                color: "var(--text-muted)",
              }}
            >
              {section.variant}
            </span>
          ) : null}
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onToggleVisibility}
            className="rounded p-1 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            aria-label={hidden ? `Show ${name}` : `Hide ${name}`}
            title={hidden ? "Show section" : "Hide section"}
          >
            {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded p-1 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            aria-label={`Duplicate ${name}`}
            title="Duplicate section"
          >
            <Copy className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-[var(--text-muted)] transition-colors hover:text-[var(--danger, #ef4444)]"
            aria-label={`Delete ${name}`}
            title="Delete section"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}
