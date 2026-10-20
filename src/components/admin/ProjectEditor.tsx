"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  AlertTriangle,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useRouter } from "@/lib/router";
import {
  useContentStore,
  useMedia,
  useProjects,
} from "@/lib/content-store";
import type { Project, SeoMeta } from "@/lib/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { MediaPickerDialog } from "./MediaPickerDialog";
import { SeoEditor } from "./SeoEditor";
import { StatusBadge } from "./StatusBadge";
import {
  LabeledInput,
  LabeledTextarea,
  ObjectArrayEditor,
  StringArrayEditor,
  MultiSelectChips,
} from "./form-helpers";

const SAVE_DEBOUNCE_MS = 500;

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "ongoing", label: "Ongoing" },
  { value: "planned", label: "Planned" },
] as const;

interface ProjectEditorProps {
  slug: string;
}

export function ProjectEditor({ slug }: ProjectEditorProps) {
  const projects = useProjects();
  const { upsertProject, deleteProject } = useContentStore();
  const { navigate } = useRouter();
  const media = useMedia();

  const existing = projects.find((p) => p.slug === slug);
  const [snapshot, setSnapshot] = useState<Project | null>(() =>
    existing ? { ...existing } : null
  );
  const [dirty, setDirty] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const challengeRef = useRef<MDXEditorMethods | null>(null);
  const solutionRef = useRef<MDXEditorMethods | null>(null);
  const implementationRef = useRef<MDXEditorMethods | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const next = projects.find((p) => p.slug === slug) ?? null;
    setSnapshot(next ? { ...next } : null);
    setDirty(false);
    if (next) {
      setTimeout(() => {
        challengeRef.current?.setMarkdown(next.challenge ?? "");
        solutionRef.current?.setMarkdown(next.solution ?? "");
        implementationRef.current?.setMarkdown(next.implementation ?? "");
      }, 0);
    }
     
  }, [slug]);

  useEffect(() => {
    if (!snapshot || !dirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (!snapshot) return;
      upsertProject(snapshot);
      setDirty(false);
      toast.success("Saved", { description: snapshot.title });
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
     
  }, [snapshot, dirty]);

  const update = useCallback((patch: Partial<Project>) => {
    setSnapshot((prev) => (prev ? { ...prev, ...patch } : prev));
    setDirty(true);
  }, []);

  function saveNow() {
    if (!snapshot) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    upsertProject(snapshot);
    setDirty(false);
    toast.success("Saved", { description: snapshot.title });
  }

  function confirmDelete() {
    if (!snapshot) return;
    deleteProject(snapshot.slug);
    toast.success("Project deleted.");
    navigate("/admin/projects");
  }

  if (!snapshot) {
    return <ProjectNotFound slug={slug} />;
  }

  const relatedOptions = projects
    .filter((p) => p.slug !== snapshot.slug)
    .map((p) => ({ value: p.slug, label: p.title }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild size="sm" variant="ghost" className="mt-0.5">
            <Link to="/admin/projects">
              <ArrowLeft className="size-3.5" />
              Projects
            </Link>
          </Button>
          <div>
            <div
              className="flex items-center gap-2 text-[11px] uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              <span>Project editor</span>
              <span>·</span>
              <span>/{snapshot.slug}</span>
              <StatusBadge status={snapshot.status} />
              <span className="text-[10px]" style={{ color: "var(--warning)" }}>
                Illustrative
              </span>
            </div>
            <h1
              className="mt-1 font-display text-2xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {snapshot.title || "Untitled project"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              saveNow();
              window.open(`#/projects/${snapshot.slug}`, "_blank");
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
              <CardTitle className="text-sm">Challenge</CardTitle>
              <CardDescription>What the client faced before Techstar.</CardDescription>
            </CardHeader>
            <CardContent>
              <MDXEditorBase
                ref={challengeRef}
                value={snapshot.challenge}
                onChange={(markdown) => update({ challenge: markdown })}
                ariaLabel="Challenge markdown editor"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Solution</CardTitle>
              <CardDescription>How Techstar designed the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <MDXEditorBase
                ref={solutionRef}
                value={snapshot.solution}
                onChange={(markdown) => update({ solution: markdown })}
                ariaLabel="Solution markdown editor"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Implementation</CardTitle>
              <CardDescription>How it was deployed and handed over.</CardDescription>
            </CardHeader>
            <CardContent>
              <MDXEditorBase
                ref={implementationRef}
                value={snapshot.implementation}
                onChange={(markdown) => update({ implementation: markdown })}
                ariaLabel="Implementation markdown editor"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Outcomes</CardTitle>
              <CardDescription>Quantified outcome rows shown in the outcomes grid.</CardDescription>
            </CardHeader>
            <CardContent>
              <ObjectArrayEditor
                label="Outcome"
                values={snapshot.outcomes}
                onChange={(outcomes) => update({ outcomes })}
                makeNew={() => ({ label: "", value: "" })}
                getRowTitle={(o) => o.label || "Untitled"}
                newLabel="Add outcome"
                renderRow={(value, updateRow) => (
                  <div className="grid grid-cols-2 gap-2">
                    <LabeledInput
                      label="Label"
                      inputId={`o-label-${value.label}`}
                      value={value.label}
                      onChange={(e) => updateRow({ label: e.target.value })}
                      placeholder="False alarms"
                    />
                    <LabeledInput
                      label="Value"
                      inputId={`o-value-${value.label}`}
                      value={value.value}
                      onChange={(e) => updateRow({ value: e.target.value })}
                      placeholder="-67%"
                    />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Gallery</CardTitle>
              <CardDescription>Image URLs / media ids shown in the project gallery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {snapshot.gallery.length === 0 ? (
                  <p className="col-span-full text-[11px] italic" style={{ color: "var(--text-muted)" }}>
                    No gallery images yet.
                  </p>
                ) : (
                  snapshot.gallery.map((g, i) => {
                    const url = media.find((m) => m.id === g)?.url ?? g;
                    return (
                      <div
                        key={i}
                        className="group relative aspect-[4/3] overflow-hidden rounded-md border"
                        style={{ borderColor: "var(--border-subtle)" }}
                      >
                        <img src={url} alt={`Gallery image ${i + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            update({
                              gallery: snapshot.gallery.filter((_, j) => j !== i),
                            })
                          }
                          className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label={`Remove image ${i + 1}`}
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGalleryPickerOpen(true)}
              >
                <Plus className="size-3.5" />
                Add image
              </Button>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Project details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <LabeledInput
                label="Title"
                inputId="prj-title"
                value={snapshot.title}
                onChange={(e) => update({ title: e.target.value })}
              />
              <LabeledInput
                label="Slug"
                inputId="prj-slug"
                value={snapshot.slug}
                onChange={(e) => update({ slug: e.target.value.toLowerCase() })}
              />
              <LabeledInput
                label="Client"
                inputId="prj-client"
                value={snapshot.client}
                onChange={(e) => update({ client: e.target.value })}
                hint="Illustrative"
              />
              <LabeledInput
                label="Location"
                inputId="prj-location"
                value={snapshot.location}
                onChange={(e) => update({ location: e.target.value })}
              />
              <LabeledInput
                label="Year"
                inputId="prj-year"
                type="number"
                value={String(snapshot.year)}
                onChange={(e) =>
                  update({ year: Number(e.target.value) || new Date().getFullYear() })
                }
              />
              <StringArrayEditor
                label="Categories"
                values={snapshot.categories}
                onChange={(categories) => update({ categories })}
                placeholder="Add category (e.g. Corporate) and press Enter"
              />
              <div className="space-y-1.5">
                <Label htmlFor="prj-status" className="text-xs">Status</Label>
                <Select
                  value={snapshot.status}
                  onValueChange={(v: typeof snapshot.status) =>
                    update({ status: v })
                  }
                >
                  <SelectTrigger id="prj-status" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="prj-illustrative" className="text-xs">
                  Illustrative sample
                </Label>
                <Switch
                  id="prj-illustrative"
                  checked={snapshot.illustrative}
                  onCheckedChange={() => update({ illustrative: true })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="prj-featured" className="text-xs">
                  Featured
                </Label>
                <Switch
                  id="prj-featured"
                  checked={!!snapshot.featured}
                  onCheckedChange={(checked) => update({ featured: !!checked })}
                />
              </div>
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
                      src={
                        media.find((m) => m.id === snapshot.coverImage)?.url ??
                        snapshot.coverImage
                      }
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
              <CardTitle className="text-sm">Related projects</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiSelectChips
                label="Related"
                values={snapshot.relatedProjectSlugs}
                options={relatedOptions}
                onChange={(slugs) => update({ relatedProjectSlugs: slugs })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">SEO</CardTitle>
            </CardHeader>
            <CardContent>
              <SeoEditor
                value={snapshot.seo ?? {}}
                onChange={(seo: SeoMeta) => update({ seo })}
                fallbackTitle={snapshot.title}
                fallbackDescription={snapshot.challenge?.replace(/<[^>]+>/g, " ").slice(0, 120)}
              />
            </CardContent>
          </Card>
        </aside>
      </div>

      <MediaPickerDialog
        open={galleryPickerOpen}
        onOpenChange={setGalleryPickerOpen}
        onSelect={(m) => {
          if (m) update({ gallery: [...snapshot.gallery, m.id] });
        }}
        confirmLabel="Add to gallery"
      />
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
        title="Delete project?"
        description={`"${snapshot.title}" will be permanently deleted.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

// Wrapper around MDXEditor with the standard toolbar preset.
function MDXEditorBase({
  ref,
  value,
  onChange,
  ariaLabel,
}: {
  ref: React.Ref<MDXEditorMethods>;
  value: string;
  onChange: (markdown: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="rounded-md border" style={{ borderColor: "var(--border-subtle)" }}>
      <MDXEditor
        ref={ref}
        aria-label={ariaLabel}
        markdown={value ?? ""}
        onChange={onChange}
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
        contentEditableClassName="prose prose-sm max-w-none min-h-[200px] px-3 py-2"
      />
    </div>
  );
}

function ProjectNotFound({ slug }: { slug: string }) {
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
        Project not found
      </h1>
      <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
        No project with slug <code className="font-mono">{slug}</code> exists.
      </p>
      <Button asChild className="mt-4" size="sm">
        <Link to="/admin/projects">Back to projects</Link>
      </Button>
    </div>
  );
}
