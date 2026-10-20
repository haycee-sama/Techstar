"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useContentStore,
  usePage,
} from "@/lib/content-store";
import type { Section } from "@/lib/types";
import { SectionRenderer } from "@/components/builder/SectionRenderer";
import { SectionNavigator } from "./SectionNavigator";
import { PropertiesInspector } from "./PropertiesInspector";
import { ViewportToolbar, type Viewport } from "./ViewportToolbar";
import { InsertSectionPanel } from "./InsertSectionPanel";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PanelLeft, PanelRight } from "lucide-react";
import { Link, useRouter } from "@/lib/router";

const MAX_HISTORY = 50;
const HISTORY_DEBOUNCE_MS = 400;
const SAVE_DEBOUNCE_MS = 500;

interface VisualBuilderProps {
  slug: string;
}

interface BuilderState {
  sections: Section[];
  title: string;
}

/**
 * Phase 4 — Visual page builder. 3-pane layout:
 *   - Left rail  : SectionNavigator (sortable list of sections)
 *   - Center     : live canvas via SectionRenderer + ViewportToolbar
 *   - Right rail : PropertiesInspector (data + layout settings)
 *
 * Edits the same `PageContent.sections` array that the public preview
 * route (`#/preview/:slug`) renders — both go through `<SectionRenderer>`.
 *
 * Undo/redo: local history stack of section arrays (max 50 entries).
 * History pushes are debounced 400ms so typing in the inspector
 * doesn't push a million entries. Ctrl+Z / Ctrl+Shift+Z keyboard
 * shortcuts wired up here.
 *
 * Save draft (debounced 500ms) writes through to the content store.
 * Publish copies the current draft sections → `publishedSections` and
 * sets status='published' + publishedAt. Unpublish sets status='archived'.
 *
 * Unsaved-changes guard: `beforeunload` + route-away intercept.
 */
export function VisualBuilder({ slug }: VisualBuilderProps) {
  const { getPage, updatePageSections, updatePage, publishPage, unpublishPage } = useContentStore();
  const page = usePage(slug);
  const { navigate, parsed } = useRouter();

  const [draft, setDraft] = useState<BuilderState>(() => ({
    sections: page?.sections ?? [],
    title: page?.title ?? "",
  }));
  const [history, setHistory] = useState<Section[][]>(() => [page?.sections ?? []]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [insertOpen, setInsertOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [navGuardOpen, setNavGuardOpen] = useState(false);
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [navSheetOpen, setNavSheetOpen] = useState(false);
  const [inspectorSheetOpen, setInspectorSheetOpen] = useState(false);

  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<"saving" | "saved" | "dirty">("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(page?.updatedAt ?? null);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // Re-sync when slug changes (navigating between builder pages)
  useEffect(() => {
    const p = getPage(slug);
    if (p) {
      setDraft({ sections: p.sections, title: p.title });
      setHistory([p.sections]);
      setHistoryIndex(0);
      setDirty(false);
      setStatus("saved");
      setLastSavedAt(p.updatedAt);
      setSelectedId(null);
    } else {
      // Page not found — bounce to overview
      toast.error(`Page "${slug}" not found`);
      navigate("/admin/builder", { replace: true });
    }
     
  }, [slug]);

  // Keep dirtyRef in sync
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  // ===== Save draft (debounced) =====
  const scheduleSave = useCallback(() => {
    setStatus("dirty");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const current = draftRef.current;
      updatePageSections(slug, current.sections);
      updatePage(slug, { title: current.title });
      setLastSavedAt(new Date().toISOString());
      setStatus("saved");
      setDirty(false);
    }, SAVE_DEBOUNCE_MS);
  }, [slug, updatePageSections, updatePage]);

  // ===== History (debounced) =====
  const scheduleHistoryPush = useCallback(
    (next: Section[]) => {
      if (historyTimer.current) clearTimeout(historyTimer.current);
      historyTimer.current = setTimeout(() => {
        setHistory((prev) => {
          const trimmed = prev.slice(0, historyIndex + 1);
          trimmed.push(next);
          if (trimmed.length > MAX_HISTORY) {
            trimmed.shift();
          }
          return trimmed;
        });
        setHistoryIndex((i) => Math.min(i + 1, MAX_HISTORY - 1));
      }, HISTORY_DEBOUNCE_MS);
    },
    [historyIndex]
  );

  // ===== Mutations on draft =====
  const commit = useCallback(
    (next: BuilderState) => {
      setDraft(next);
      setDirty(true);
      setStatus("dirty");
      scheduleHistoryPush(next.sections);
      scheduleSave();
    },
    [scheduleHistoryPush, scheduleSave]
  );

  const commitSections = useCallback(
    (next: Section[]) => {
      commit({ ...draftRef.current, sections: next });
    },
    [commit]
  );

  const updateSection = useCallback(
    (next: Section) => {
      const nextSections = draftRef.current.sections.map((s) => (s.id === next.id ? next : s));
      commitSections(nextSections);
      setSelectedId(next.id);
    },
    [commitSections]
  );

  const addSection = useCallback(
    (section: Section) => {
      const arr = draftRef.current.sections;
      let insertIdx = arr.length;
      if (selectedId) {
        const i = arr.findIndex((s) => s.id === selectedId);
        if (i >= 0) insertIdx = i + 1;
      }
      const next = [...arr.slice(0, insertIdx), section, ...arr.slice(insertIdx)];
      commitSections(next);
      setSelectedId(section.id);
      toast.success(`Added ${section.type} section`);
    },
    [selectedId, commitSections]
  );

  const deleteSection = useCallback(
    (id: string) => {
      const next = draftRef.current.sections.filter((s) => s.id !== id);
      commitSections(next);
      if (selectedId === id) setSelectedId(null);
      toast.success("Section deleted");
    },
    [selectedId, commitSections]
  );

  const duplicateSection = useCallback(
    (id: string) => {
      const arr = draftRef.current.sections;
      const idx = arr.findIndex((s) => s.id === id);
      if (idx < 0) return;
      const copy: Section = {
        ...arr[idx],
        id: `${arr[idx].id}-copy-${Math.random().toString(36).slice(2, 6)}`,
        data: JSON.parse(JSON.stringify(arr[idx].data)),
        settings: { ...arr[idx].settings },
      };
      const next = [...arr.slice(0, idx + 1), copy, ...arr.slice(idx + 1)];
      commitSections(next);
      setSelectedId(copy.id);
      toast.success("Section duplicated");
    },
    [commitSections]
  );

  const toggleVisibility = useCallback(
    (id: string) => {
      const next = draftRef.current.sections.map((s) =>
        s.id === id ? { ...s, visible: s.visible !== false ? false : true } : s
      );
      commitSections(next);
    },
    [commitSections]
  );

  const reorder = useCallback(
    (next: Section[]) => {
      commitSections(next);
    },
    [commitSections]
  );

  const moveSection = useCallback(
    (direction: "up" | "down") => {
      if (!selectedId) return;
      const arr = draftRef.current.sections;
      const idx = arr.findIndex((s) => s.id === selectedId);
      if (idx < 0) return;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= arr.length) return;
      const next = [...arr];
      const tmp = next[idx];
      next[idx] = next[newIdx];
      next[newIdx] = tmp;
      commitSections(next);
    },
    [selectedId, commitSections]
  );

  // ===== Undo / Redo =====
  const undo = useCallback(() => {
    setHistoryIndex((i) => {
      if (i <= 0) return i;
      const newIdx = i - 1;
      const sections = history[newIdx];
      setDraft((d) => ({ ...d, sections }));
      setDirty(true);
      setStatus("dirty");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updatePageSections(slug, sections);
        setLastSavedAt(new Date().toISOString());
        setStatus("saved");
        setDirty(false);
      }, SAVE_DEBOUNCE_MS);
      return newIdx;
    });
  }, [history, slug, updatePageSections]);

  const redo = useCallback(() => {
    setHistoryIndex((i) => {
      if (i >= history.length - 1) return i;
      const newIdx = i + 1;
      const sections = history[newIdx];
      setDraft((d) => ({ ...d, sections }));
      setDirty(true);
      setStatus("dirty");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updatePageSections(slug, sections);
        setLastSavedAt(new Date().toISOString());
        setStatus("saved");
        setDirty(false);
      }, SAVE_DEBOUNCE_MS);
      return newIdx;
    });
  }, [history, slug, updatePageSections]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // ===== Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z =====
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        const target = e.target as HTMLElement | null;
        if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
          return;
        }
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  // ===== beforeunload guard =====
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // ===== Route-away guard =====
  useEffect(() => {
    function onHashChange() {
      if (!dirtyRef.current) return;
      const next = window.location.hash;
      const currentPath = `#${parsed.path}`;
      if (next === currentPath) return;
      const target = next.replace(/^#/, "");
      window.history.replaceState(null, "", currentPath);
      setPendingNav(target);
      setNavGuardOpen(true);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [parsed.path]);

  // ===== Save / Publish actions =====
  function handleSaveNow() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    updatePageSections(slug, draft.sections);
    updatePage(slug, { title: draft.title });
    setLastSavedAt(new Date().toISOString());
    setStatus("saved");
    setDirty(false);
    toast.success("Draft saved");
  }

  function confirmPublish() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    updatePageSections(slug, draft.sections);
    updatePage(slug, { title: draft.title });
    publishPage(slug);
    setLastSavedAt(new Date().toISOString());
    setStatus("saved");
    setDirty(false);
    toast.success("Page published — preview route now reflects the published snapshot.");
  }

  function confirmUnpublish() {
    unpublishPage(slug);
    toast.success("Page unpublished — preview route now shows an archived notice.");
  }

  function handlePreview() {
    const url = `#/preview/${slug}?preview=true`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // Selected section lookup
  const selectedSection = useMemo(
    () => draft.sections.find((s) => s.id === selectedId) ?? null,
    [draft.sections, selectedId]
  );
  const selectedIndex = useMemo(
    () => (selectedSection ? draft.sections.findIndex((s) => s.id === selectedSection.id) : -1),
    [draft.sections, selectedSection]
  );

  // Shared inspector element (used in both inline rail + sheet)
  const inspector = (
    <PropertiesInspector
      section={selectedSection}
      onChange={(next) => {
        updateSection(next);
      }}
      onMove={moveSection}
      canMoveUp={selectedIndex > 0}
      canMoveDown={selectedIndex >= 0 && selectedIndex < draft.sections.length - 1}
      onDelete={() => setDeleteOpen(true)}
      index={selectedIndex >= 0 ? selectedIndex : 0}
      total={draft.sections.length}
    />
  );

  // Shared navigator element (used in both inline rail + sheet)
  const navigator = (
    <SectionNavigator
      sections={draft.sections}
      selectedId={selectedId}
      onSelect={(id) => {
        setSelectedId(id);
        setNavSheetOpen(false);
      }}
      onReorder={reorder}
      onDuplicate={duplicateSection}
      onDelete={deleteSection}
      onToggleVisibility={toggleVisibility}
      onInsertOpen={() => {
        setNavSheetOpen(false);
        setInsertOpen(true);
      }}
    />
  );

  if (!page) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p style={{ color: "var(--text-muted)" }}>Page not found.</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to="/admin/builder">Back to builder overview</Link>
        </Button>
      </div>
    );
  }

  // Viewport-driven canvas width
  const canvasMaxWidth =
    viewport === "mobile" ? "390px" : viewport === "tablet" ? "768px" : "100%";

  return (
    <div className="-m-4 sm:-m-6 flex h-[calc(100vh-3.5rem)] flex-col">
      <ViewportToolbar
        pageTitle={draft.title}
        onTitleChange={(t) => commit({ ...draft, title: t })}
        viewport={viewport}
        onViewportChange={setViewport}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        status={status}
        lastSavedAt={lastSavedAt}
        published={page.status === "published"}
        publishedAt={page.publishedAt ?? null}
        onSave={handleSaveNow}
        onPublish={() => setPublishOpen(true)}
        onUnpublish={() => setUnpublishOpen(true)}
        onPreview={handlePreview}
      />

      {/* Mobile-only sub-bar with sheet triggers */}
      <div
        className="flex items-center gap-2 border-b px-3 py-1.5 lg:hidden"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Sheet open={navSheetOpen} onOpenChange={setNavSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
              <PanelLeft className="size-3.5" />
              Sections ({draft.sections.length})
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="px-3 py-2">
              <SheetTitle className="text-xs uppercase tracking-wide">Sections</SheetTitle>
            </SheetHeader>
            {navigator}
          </SheetContent>
        </Sheet>

        <Sheet open={inspectorSheetOpen} onOpenChange={setInspectorSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto h-7 gap-1.5 text-xs"
              disabled={!selectedSection}
            >
              <PanelRight className="size-3.5" />
              Inspector
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0">
            <SheetHeader className="px-3 py-2">
              <SheetTitle className="text-xs uppercase tracking-wide">Inspector</SheetTitle>
            </SheetHeader>
            {inspector}
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Left rail — SectionNavigator (md+) */}
        <div className="hidden w-64 shrink-0 md:block">
          {navigator}
        </div>

        {/* Center canvas */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className="relative flex-1 overflow-y-auto"
            style={{ backgroundColor: "var(--bg-deep)" }}
          >
            <HonestyChip />
            <div
              className="mx-auto my-4 overflow-hidden rounded-md border transition-all"
              style={{
                width: canvasMaxWidth,
                maxWidth: "100%",
                borderColor: "var(--border-subtle)",
                backgroundColor: "var(--background)",
              }}
            >
              <SectionRenderer sections={draft.sections} showHiddenPlaceholders />
            </div>
          </div>
        </div>

        {/* Right rail — PropertiesInspector (lg+) */}
        <div className="hidden w-80 shrink-0 lg:block">
          {inspector}
        </div>
      </div>

      <InsertSectionPanel
        open={insertOpen}
        onOpenChange={setInsertOpen}
        onInsert={addSection}
      />

      <ConfirmDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        title="Publish page?"
        description={`The current draft (${draft.sections.length} sections) will become the published snapshot. The preview route will reflect it immediately.`}
        confirmLabel="Publish"
        onConfirm={confirmPublish}
      />

      <ConfirmDialog
        open={unpublishOpen}
        onOpenChange={setUnpublishOpen}
        title="Unpublish page?"
        description="The preview route will show an archived notice. Your draft sections are preserved."
        confirmLabel="Unpublish"
        variant="destructive"
        onConfirm={confirmUnpublish}
      />

      <ConfirmDialog
        open={navGuardOpen}
        onOpenChange={(open) => {
          setNavGuardOpen(open);
          if (!open) setPendingNav(null);
        }}
        title="Leave the page editor?"
        description="You have unsaved changes. The save is debounced 500ms — leaving now may discard recent edits."
        confirmLabel="Leave without saving"
        cancelLabel="Stay and keep editing"
        variant="destructive"
        onConfirm={() => {
          const target = pendingNav;
          dirtyRef.current = false;
          setDirty(false);
          setPendingNav(null);
          if (target) navigate(target);
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete section?"
        description={
          selectedSection
            ? `Section "${selectedSection.type}" will be removed from the page. This can be undone with Ctrl+Z.`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (selectedSection) {
            deleteSection(selectedSection.id);
          }
        }}
      />
    </div>
  );
}

function HonestyChip() {
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 hidden sm:block">
      <span
        className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wide"
        style={{
          borderColor: "var(--border-subtle)",
          color: "var(--text-muted)",
          backgroundColor: "color-mix(in srgb, var(--background) 90%, transparent)",
          backdropFilter: "blur(6px)",
        }}
      >
        <span className="size-1.5 rounded-full" style={{ backgroundColor: "var(--accent-bright)" }} aria-hidden />
        Section-based editor — edits structured section data, not arbitrary HTML.
      </span>
    </div>
  );
}
