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
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Eye,
  Image as ImageIcon,
  Save,
  Send,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useRouter } from "@/lib/router";
import {
  useContentStore,
  useArticles,
  useAuthors,
  useServiceCategories,
  useMedia,
} from "@/lib/content-store";
import type { Article, SeoMeta } from "@/lib/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { MediaPickerDialog } from "./MediaPickerDialog";
import { SeoEditor } from "./SeoEditor";
import { StatusBadge } from "./StatusBadge";
import {
  LabeledInput,
  LabeledTextarea,
  StringArrayEditor,
} from "./form-helpers";

const SAVE_DEBOUNCE_MS = 500;

export function ArticleEditor({ slug }: { slug: string }) {
  const articles = useArticles();
  const authors = useAuthors();
  const categories = useServiceCategories();
  const media = useMedia();
  const { upsertArticle, deleteArticle } = useContentStore();
  const { navigate } = useRouter();

  const existing = articles.find((a) => a.slug === slug);
  const [snapshot, setSnapshot] = useState<Article | null>(() =>
    existing ? { ...existing } : null
  );
  const [dirty, setDirty] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const mdxRef = useRef<MDXEditorMethods | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const next = articles.find((a) => a.slug === slug) ?? null;
    setSnapshot(next ? { ...next } : null);
    setDirty(false);
    if (next) {
      setTimeout(() => mdxRef.current?.setMarkdown(next.body ?? ""), 0);
    }
     
  }, [slug]);

  useEffect(() => {
    if (!snapshot || !dirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (!snapshot) return;
      upsertArticle(snapshot);
      setDirty(false);
      toast.success("Saved", { description: snapshot.title });
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
     
  }, [snapshot, dirty]);

  const update = useCallback((patch: Partial<Article>) => {
    setSnapshot((prev) => (prev ? { ...prev, ...patch } : prev));
    setDirty(true);
  }, []);

  function saveNow() {
    if (!snapshot) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    upsertArticle(snapshot);
    setDirty(false);
    toast.success("Saved", { description: snapshot.title });
  }

  function publish() {
    if (!snapshot) return;
    const stamp = new Date().toISOString();
    update({ status: "published", publishedAt: snapshot.publishedAt ?? stamp });
    toast.success("Article published.", { description: snapshot.title });
  }

  function unpublish() {
    if (!snapshot) return;
    update({ status: "draft" });
    toast.info("Article moved back to draft.");
  }

  function confirmDelete() {
    if (!snapshot) return;
    deleteArticle(snapshot.slug);
    toast.success("Article deleted.");
    navigate("/admin/articles");
  }

  if (!snapshot) {
    return <ArticleNotFound slug={slug} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild size="sm" variant="ghost" className="mt-0.5">
            <Link to="/admin/articles">
              <ArrowLeft className="size-3.5" />
              Articles
            </Link>
          </Button>
          <div>
            <div
              className="flex items-center gap-2 text-[11px] uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              <span>Article editor</span>
              <span>·</span>
              <span>/{snapshot.slug}</span>
              <StatusBadge status={snapshot.status} />
            </div>
            <h1
              className="mt-1 font-display text-2xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {snapshot.title || "Untitled article"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              saveNow();
              window.open(`#/insights/${snapshot.slug}`, "_blank");
            }}
          >
            <Eye className="size-3.5" />
            Preview
          </Button>
          <Button size="sm" onClick={saveNow} disabled={!dirty}>
            <Save className="size-3.5" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="text-[var(--danger)]"
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Article body</CardTitle>
              <CardDescription>
                WYSIWYG markdown. Rendered on /insights/:slug via react-markdown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border" style={{ borderColor: "var(--border-subtle)" }}>
                <MDXEditor
                  ref={mdxRef}
                  markdown={snapshot.body ?? ""}
                  onChange={(markdown) => update({ body: markdown })}
                  plugins={[
                    headingsPlugin(),
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
                  contentEditableClassName="prose prose-sm max-w-none min-h-[420px] px-3 py-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Article details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <LabeledInput
                label="Title"
                inputId="art-title"
                value={snapshot.title}
                onChange={(e) => update({ title: e.target.value })}
              />
              <LabeledInput
                label="Slug"
                inputId="art-slug"
                value={snapshot.slug}
                onChange={(e) => update({ slug: e.target.value.toLowerCase() })}
              />
              <LabeledTextarea
                label="Excerpt"
                textareaId="art-excerpt"
                value={snapshot.excerpt}
                onChange={(e) => update({ excerpt: e.target.value })}
                rows={3}
              />
              <div className="space-y-1.5">
                <Label htmlFor="art-author" className="text-xs">Author</Label>
                <Select
                  value={snapshot.authorId}
                  onValueChange={(v) => update({ authorId: v })}
                >
                  <SelectTrigger id="art-author" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="art-category" className="text-xs">Category</Label>
                <Select
                  value={snapshot.categorySlug}
                  onValueChange={(v) => update({ categorySlug: v })}
                >
                  <SelectTrigger id="art-category" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <StringArrayEditor
                label="Tags"
                values={snapshot.tags}
                onChange={(tags) => update({ tags })}
                placeholder="Add tag and press Enter"
              />
              <LabeledInput
                label="Published at"
                inputId="art-published"
                type="datetime-local"
                value={toLocalInput(snapshot.publishedAt)}
                onChange={(e) =>
                  update({ publishedAt: fromLocalInput(e.target.value) ?? snapshot.publishedAt })
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cover image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div
                  className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-md border"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-2)",
                  }}
                >
                  {snapshot.coverImage ? (
                    <img
                      src={media.find((m) => m.id === snapshot.coverImage)?.url ?? snapshot.coverImage}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="size-4" style={{ color: "var(--text-muted)" }} />
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-16 flex-1"
                  onClick={() => setCoverPickerOpen(true)}
                >
                  {snapshot.coverImage ? "Change cover" : "Pick cover"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Publication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Status
                </span>
                <StatusBadge status={snapshot.status} />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={publish}
                  disabled={snapshot.status === "published"}
                >
                  <Send className="size-3.5" />
                  Publish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={unpublish}
                  disabled={snapshot.status === "draft"}
                >
                  Unpublish
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">SEO</CardTitle>
            </CardHeader>
            <CardContent>
              <SeoEditor
                value={snapshot.seo}
                onChange={(seo: SeoMeta) => update({ seo })}
                fallbackTitle={snapshot.title}
                fallbackDescription={snapshot.excerpt}
              />
            </CardContent>
          </Card>
        </aside>
      </div>

      <MediaPickerDialog
        open={coverPickerOpen}
        onOpenChange={setCoverPickerOpen}
        value={snapshot.coverImage}
        onSelect={(m) => {
          if (m) update({ coverImage: m.id });
        }}
        confirmLabel="Use this image"
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete article?"
        description={`"${snapshot.title}" will be permanently deleted.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function ArticleNotFound({ slug }: { slug: string }) {
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
        Article not found
      </h1>
      <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
        No article with slug <code className="font-mono">{slug}</code> exists.
      </p>
      <Button asChild className="mt-4" size="sm">
        <Link to="/admin/articles">Back to articles</Link>
      </Button>
    </div>
  );
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
