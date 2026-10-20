"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MDXEditor,
  MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  codeBlockPlugin,
  imagePlugin,
  tablePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  ListsToggle,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  CodeToggle,
  Separator,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Info,
  Redo2,
  Save,
  Send,
  Undo2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/lib/router";
import {
  useAuthors,
  useContentStore,
  useMedia,
} from "@/lib/content-store";
import type { PageContent, PageStatus } from "@/lib/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { MediaPickerDialog } from "./MediaPickerDialog";
import { SeoEditor } from "./SeoEditor";
import { StatusBadge } from "./StatusBadge";

interface PageEditorProps {
  slug: string;
}

const SLUG_REGEX = /^[a-z0-9-]+$/;
const SAVE_DEBOUNCE_MS = 500;
const MAX_HISTORY = 50;

type EditorSnapshot = {
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  featuredImage: string;
  authorId: string;
  status: PageStatus;
  publishedAt: string | undefined;
  seo: PageContent["seo"];
};

function toSnapshot(p: PageContent): EditorSnapshot {
  return {
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? "",
    bodyHtml: p.bodyHtml ?? "",
    featuredImage: p.featuredImage ?? "",
    authorId: p.authorId ?? "",
    status: p.status,
    publishedAt: p.publishedAt,
    seo: { ...p.seo },
  };
}

/**
 * Two-pane page editor. The main column holds the title, slug, excerpt,
 * featured image, and the MDXEditor body. The right sidebar holds the
 * status block (save draft / publish / unpublish / preview), SEO fields,
 * and publication settings.
 *
 * Workflow: local React state mirrors the page's editable fields. A debounced
 * save flushes to the content store (`updatePage`) every 500ms while typing.
 * Publish snapshots the current draft via `publishPage`; Unpublish sets the
 * status to archived via `unpublishPage`.
 *
 * Undo/redo maintains a local history of editor snapshots (max 50 entries).
 */
export function PageEditor({ slug }: PageEditorProps) {
  const { getPage, updatePage, publishPage, unpublishPage } = useContentStore();
  const authors = useAuthors();
  const media = useMedia();
  const page = getPage(slug);

  const [snapshot, setSnapshot] = useState<EditorSnapshot | null>(() =>
    page ? toSnapshot(page) : null
  );
  const [history, setHistory] = useState<EditorSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(
    page?.updatedAt ?? null
  );
  const [saving, setSaving] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [navigateAwayOpen, setNavigateAwayOpen] = useState(false);
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  const [slugEditedByUser, setSlugEditedByUser] = useState(false);

  const mdxRef = useRef<MDXEditorMethods | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);

  // Keep the dirty ref in sync so the re-sync effect can skip overwriting
  // in-progress typing when a debounced save mutates state.pages.
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  // Re-sync snapshot when the page slug changes (navigating between editors)
  // OR when an external mutation lands in the store (e.g. another tab edits
  // the same page). We skip the re-sync when the user has unsaved local
  // changes — publish / unpublish explicitly re-sync in their own handlers.
  useEffect(() => {
    if (dirtyRef.current) return;
    const current = getPage(slug);
    if (current) {
      const snap = toSnapshot(current);
      setSnapshot(snap);
      setHistory([snap]);
      setHistoryIndex(0);
      setSlugEditedByUser(false);
      setLastSavedAt(current.updatedAt);
      // Reset the MDXEditor's internal markdown the next tick.
      const md = current.bodyHtml ?? "";
      setTimeout(() => mdxRef.current?.setMarkdown(md), 0);
    }
  }, [slug, getPage]);

  // beforeunload prompt when there are unsaved changes.
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Hash-change guard: intercept navigation away when dirty.
  useEffect(() => {
    function onHashChange() {
      if (!dirty) return;
      const target = window.location.hash;
      const expected = `#/admin/pages/${slug}`;
      if (target === expected) return;
      window.history.pushState(null, "", expected);
      setPendingNav(target);
      setNavigateAwayOpen(true);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [dirty, slug]);

  // Debounced save while editing.
  useEffect(() => {
    if (!snapshot || !dirty) return;
    setSaving(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (!snapshot) return;
      updatePage(slug, {
        title: snapshot.title,
        excerpt: snapshot.excerpt,
        bodyHtml: snapshot.bodyHtml,
        featuredImage: snapshot.featuredImage || undefined,
        authorId: snapshot.authorId || undefined,
        seo: snapshot.seo,
      });
      const stamp = new Date().toISOString();
      setLastSavedAt(stamp);
      setSaving(false);
      setDirty(false);
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [snapshot, dirty, slug, updatePage]);

  // ---------- Mutation helpers ----------

  const update = useCallback(
    (patch: Partial<EditorSnapshot>, opts?: { skipHistory?: boolean }) => {
      setSnapshot((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        if (!opts?.skipHistory) {
          setHistory((h) => {
            const truncated = h.slice(0, historyIndex + 1);
            truncated.push(next);
            const overflow = truncated.length - MAX_HISTORY;
            const trimmed =
              overflow > 0 ? truncated.slice(overflow) : truncated;
            return trimmed;
          });
          setHistoryIndex((i) =>
            Math.min(i + 1, MAX_HISTORY - 1)
          );
        }
        setDirty(true);
        return next;
      });
    },
    [historyIndex]
  );

  const onTitleChange = useCallback(
    (title: string) => {
      update({ title });
      if (!slugEditedByUser) {
        const auto = slugify(title);
        update({ slug: auto }, { skipHistory: true });
      }
    },
    [update, slugEditedByUser]
  );

  const onSlugChange = useCallback(
    (next: string) => {
      setSlugEditedByUser(true);
      update({ slug: next.toLowerCase() });
    },
    [update]
  );

  const onBodyChange = useCallback(
    (markdown: string) => {
      update({ bodyHtml: markdown });
    },
    [update]
  );

  // ---------- Undo / Redo ----------

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const idx = historyIndex - 1;
    setHistoryIndex(idx);
    const prev = history[idx];
    setSnapshot(prev);
    setDirty(true);
    mdxRef.current?.setMarkdown(prev.bodyHtml);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const idx = historyIndex + 1;
    setHistoryIndex(idx);
    const next = history[idx];
    setSnapshot(next);
    setDirty(true);
    mdxRef.current?.setMarkdown(next.bodyHtml);
  }, [history, historyIndex]);

  // ---------- Save / Publish / Unpublish / Preview ----------

  function saveNow() {
    if (!snapshot) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    updatePage(slug, {
      title: snapshot.title,
      excerpt: snapshot.excerpt,
      bodyHtml: snapshot.bodyHtml,
      featuredImage: snapshot.featuredImage || undefined,
      authorId: snapshot.authorId || undefined,
      seo: snapshot.seo,
    });
    const stamp = new Date().toISOString();
    setLastSavedAt(stamp);
    setSaving(false);
    setDirty(false);
    toast.success("Draft saved", {
      description: `Saved at ${new Date(stamp).toLocaleTimeString()}`,
    });
  }

  function publish() {
    saveNow();
    publishPage(slug);
    toast.success("Page published", {
      description: `Live snapshot captured at ${new Date().toLocaleTimeString()}.`,
    });
    setPublishOpen(false);
    const updated = getPage(slug);
    if (updated) setSnapshot(toSnapshot(updated));
  }

  function unpublish() {
    unpublishPage(slug);
    toast.success("Page unpublished", {
      description: "Status set to archived. Snapshot retained for rollback.",
    });
    setUnpublishOpen(false);
    const updated = getPage(slug);
    if (updated) setSnapshot(toSnapshot(updated));
  }

  function preview() {
    const win = window.open(`/#/${slug}`, "_blank", "noopener,noreferrer");
    if (!win) {
      toast.info("Preview — pop-ups were blocked");
    } else {
      toast.info("Preview mode opening — note: this demo opens the published page.");
    }
  }

  // ---------- 404 state ----------

  if (!page || !snapshot) {
    return <PageNotFound slug={slug} />;
  }

  // ---------- Validation ----------

  const titleErr =
    !snapshot.title || snapshot.title.length < 3
      ? "Title must be at least 3 characters."
      : null;
  const slugErr =
    !snapshot.slug || !SLUG_REGEX.test(snapshot.slug)
      ? "Slug must be lowercase letters, numbers, and hyphens only."
      : null;
  const excerptWarn =
    !snapshot.excerpt || snapshot.excerpt.length < 8
      ? "Add a short excerpt for better listings and SEO."
      : null;

  const publishedSnapshot = page.publishedSnapshot;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button asChild size="sm" variant="ghost" className="h-8">
          <Link to="/admin/pages">
            <ArrowLeft className="size-3.5" />
            Pages
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <Undo2 className="size-3.5" />
            Undo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
          >
            <Redo2 className="size-3.5" />
            Redo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Main editor */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Page basics</CardTitle>
              <CardDescription>
                Title, slug, excerpt, and featured image. Saved automatically
                while you type.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="page-title" className="text-xs">Title</Label>
                <Input
                  id="page-title"
                  value={snapshot.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Page title"
                  className="text-lg font-display"
                  aria-invalid={!!titleErr}
                />
                {titleErr ? (
                  <p className="text-[11px]" style={{ color: "var(--danger)" }} role="alert">
                    {titleErr}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="page-slug" className="text-xs">Slug</Label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>/</span>
                  <Input
                    id="page-slug"
                    value={snapshot.slug}
                    onChange={(e) => onSlugChange(e.target.value)}
                    placeholder="page-slug"
                    className="font-mono"
                    aria-invalid={!!slugErr}
                    aria-describedby={slugErr ? "page-slug-err" : undefined}
                  />
                </div>
                {slugErr ? (
                  <p
                    id="page-slug-err"
                    className="text-[11px]"
                    style={{ color: "var(--danger)" }}
                    role="alert"
                  >
                    {slugErr}
                  </p>
                ) : (
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    Public URL: <span className="font-mono">/{snapshot.slug === "home" ? "" : snapshot.slug}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="page-excerpt" className="text-xs">Excerpt</Label>
                <Textarea
                  id="page-excerpt"
                  value={snapshot.excerpt}
                  onChange={(e) => update({ excerpt: e.target.value })}
                  placeholder="One or two sentences summarizing the page."
                  rows={3}
                />
                {excerptWarn ? (
                  <p
                    className="flex items-center gap-1 text-[11px]"
                    style={{ color: "var(--warning)" }}
                  >
                    <AlertTriangle className="size-3" />
                    {excerptWarn}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Featured image</Label>
                <div className="flex gap-2">
                  <div
                    className="flex size-16 items-center justify-center overflow-hidden rounded-md border"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-2)",
                    }}
                  >
                    {snapshot.featuredImage ? (
                      <img
                        src={resolveMediaUrl(snapshot.featuredImage, media)}
                        alt="Featured"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon
                        className="size-4"
                        style={{ color: "var(--text-muted)" }}
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => setMediaPickerOpen(true)}
                    >
                      {snapshot.featuredImage ? "Change image" : "Pick image"}
                    </Button>
                    {snapshot.featuredImage ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => update({ featuredImage: "" })}
                      >
                        Clear
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Body</CardTitle>
              <CardDescription>
                Rich text via <code>@mdxeditor/editor</code>. Stored as markdown
                on the page&apos;s <code>bodyHtml</code> field (visible to the
                Phase 4 WYSIWYG builder).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="overflow-hidden rounded-md border"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--bg-navy)",
                }}
              >
                <MDXEditor
                  ref={mdxRef}
                  markdown={snapshot.bodyHtml || ""}
                  onChange={onBodyChange}
                  className="min-h-[420px]"
                  contentEditableClassName="prose prose-sm max-w-none px-4 py-3"
                  plugins={[
                    headingsPlugin({ allowedHeadingLevels: [2, 3] }),
                    listsPlugin(),
                    linkPlugin(),
                    linkDialogPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin(),
                    codeBlockPlugin(),
                    imagePlugin(),
                    tablePlugin(),
                    toolbarPlugin({
                      toolbarContents: () => (
                        <>
                          <UndoRedo />
                          <Separator />
                          <BoldItalicUnderlineToggles />
                          <Separator />
                          <BlockTypeSelect />
                          <ListsToggle />
                          <Separator />
                          <CreateLink />
                          <InsertImage />
                          <InsertTable />
                          <InsertThematicBreak />
                          <CodeToggle />
                        </>
                      ),
                    }),
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-[72px] lg:self-start">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Status</CardTitle>
                <StatusBadge status={snapshot.status} />
              </div>
              <CardDescription>
                {saving
                  ? "Saving…"
                  : dirty
                  ? "Unsaved changes"
                  : `Saved ${lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : "—"}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={saveNow} variant="outline" size="sm" disabled={!dirty}>
                  <Save className="size-3.5" />
                  Save draft
                </Button>
                <Button onClick={() => setPublishOpen(true)} size="sm">
                  <Send className="size-3.5" />
                  Publish
                </Button>
                <Button
                  onClick={() => setUnpublishOpen(true)}
                  size="sm"
                  variant="ghost"
                  disabled={snapshot.status !== "published"}
                >
                  <EyeOff className="size-3.5" />
                  Unpublish
                </Button>
                <Button onClick={preview} size="sm" variant="ghost">
                  <Eye className="size-3.5" />
                  Preview
                </Button>
              </div>

              {publishedSnapshot ? (
                <div
                  className="rounded-md border p-2 text-[11px]"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-2)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <p className="flex items-center gap-1 font-medium" style={{ color: "var(--text-primary)" }}>
                    <CheckCircle2
                      className="size-3"
                      style={{ color: "var(--success)" }}
                    />
                    Published snapshot
                  </p>
                  <p className="mt-1">
                    Captured {new Date(publishedSnapshot.publishedAt).toLocaleString()}
                  </p>
                  <p className="mt-0.5">Title: {publishedSnapshot.title}</p>
                </div>
              ) : (
                <p
                  className="flex items-center gap-1 text-[11px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Info className="size-3" />
                  No published snapshot yet. Click Publish to capture one.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Publication settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="author" className="text-xs">Author</Label>
                <Select
                  value={snapshot.authorId || "none"}
                  onValueChange={(v) =>
                    update({ authorId: v === "none" ? "" : v })
                  }
                >
                  <SelectTrigger id="author" className="h-9">
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No author</SelectItem>
                    {authors.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs">Status</Label>
                <Select
                  value={snapshot.status}
                  onValueChange={(v: PageStatus) => update({ status: v })}
                >
                  <SelectTrigger id="status" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="published-at" className="text-xs">
                  Published at
                </Label>
                <Input
                  id="published-at"
                  type="datetime-local"
                  value={toLocalInput(snapshot.publishedAt)}
                  onChange={(e) =>
                    update({
                      publishedAt: fromLocalInput(e.target.value),
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">SEO</CardTitle>
              <CardDescription>
                Title + meta description + OG image. Persisted with the page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SeoEditor
                value={snapshot.seo}
                onChange={(seo) => update({ seo })}
                fallbackTitle={snapshot.title}
                fallbackDescription={snapshot.excerpt}
              />
            </CardContent>
          </Card>
        </aside>
      </div>

      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        value={snapshot.featuredImage}
        onSelect={(m) => {
          if (m) update({ featuredImage: m.id });
        }}
        confirmLabel="Use this image"
      />

      <ConfirmDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        title="Publish page?"
        description="Captures a published snapshot from the current draft and sets the status to published. The page becomes visible on the public site."
        confirmLabel="Publish"
        onConfirm={publish}
      />

      <ConfirmDialog
        open={unpublishOpen}
        onOpenChange={setUnpublishOpen}
        title="Unpublish this page?"
        description="Sets status to archived. The published snapshot is retained so you can re-publish later."
        confirmLabel="Unpublish"
        variant="destructive"
        onConfirm={unpublish}
      />

      <ConfirmDialog
        open={navigateAwayOpen}
        onOpenChange={(open) => {
          setNavigateAwayOpen(open);
          if (!open) setPendingNav(null);
        }}
        title="Leave this page?"
        description="You have unsaved changes. Save them now or stay here."
        confirmLabel="Save & leave"
        cancelLabel="Stay"
        onConfirm={() => {
          saveNow();
          if (pendingNav) {
            const target = pendingNav.startsWith("#") ? pendingNav : `#${pendingNav}`;
            window.history.pushState(null, "", target);
            window.dispatchEvent(new HashChangeEvent("hashchange"));
          }
        }}
      />
    </div>
  );
}

// ---------- 404 ----------

function PageNotFound({ slug }: { slug: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div
        className="mx-auto flex size-12 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--surface-2)", color: "var(--text-muted)" }}
      >
        <AlertTriangle className="size-5" />
      </div>
      <h1
        className="mt-3 font-display text-xl font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        Page not found
      </h1>
      <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
        No page with slug <code className="font-mono">{slug}</code> exists in the
        content store.
      </p>
      <Button asChild className="mt-4" size="sm">
        <Link to="/admin/pages">Back to pages</Link>
      </Button>
    </div>
  );
}

// ---------- Local helpers ----------

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function resolveMediaUrl(
  ref: string,
  media: ReturnType<typeof useMedia>
): string {
  const found = media.find((m) => m.id === ref);
  return found?.url ?? ref;
}
