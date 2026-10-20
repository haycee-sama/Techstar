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
  EyeOff,
  Image as ImageIcon,
  Save,
  Send,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useRouter } from "@/lib/router";
import {
  useContentStore,
  useMedia,
  useServiceCategories,
  useServices,
} from "@/lib/content-store";
import type { Service, SeoMeta } from "@/lib/types";
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

interface ServiceEditorProps {
  slug: string;
}

export function ServiceEditor({ slug }: ServiceEditorProps) {
  const services = useServices();
  const categories = useServiceCategories();
  const { upsertService, deleteService } = useContentStore();
  const { navigate } = useRouter();

  const existing = services.find((s) => s.slug === slug);
  const [snapshot, setSnapshot] = useState<Service | null>(() =>
    existing ? { ...existing } : null
  );
  const [dirty, setDirty] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const mdxRef = useRef<MDXEditorMethods | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-sync when slug changes (navigating between services).
  useEffect(() => {
    const next = services.find((s) => s.slug === slug) ?? null;
    setSnapshot(next ? { ...next } : null);
    setDirty(false);
    if (next) {
      // Reset MDXEditor content next tick so it doesn't lose its internal state.
      setTimeout(() => mdxRef.current?.setMarkdown(next.overview ?? ""), 0);
    }
     
  }, [slug]);

  // Debounced save.
  useEffect(() => {
    if (!snapshot || !dirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (!snapshot) return;
      upsertService(snapshot);
      setDirty(false);
      toast.success("Saved", { description: snapshot.title });
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
     
  }, [snapshot, dirty]);

  const update = useCallback((patch: Partial<Service>) => {
    setSnapshot((prev) => (prev ? { ...prev, ...patch } : prev));
    setDirty(true);
  }, []);

  function saveNow() {
    if (!snapshot) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    upsertService(snapshot);
    setDirty(false);
    toast.success("Saved", { description: snapshot.title });
  }

  function publish() {
    if (!snapshot) return;
    update({ status: "active" });
    toast.success("Service is now active.", { description: snapshot.title });
  }

  function unpublish() {
    if (!snapshot) return;
    update({ status: "coming-soon" });
    toast.info("Service marked as coming soon.");
  }

  function confirmDelete() {
    if (!snapshot) return;
    deleteService(snapshot.slug);
    toast.success("Service deleted.");
    navigate("/admin/services");
  }

  if (!snapshot) {
    return <ServiceNotFound slug={slug} />;
  }

  const relatedOptions = services
    .filter((s) => s.slug !== snapshot.slug)
    .map((s) => ({ value: s.slug, label: s.title }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild size="sm" variant="ghost" className="mt-0.5">
            <Link to="/admin/services">
              <ArrowLeft className="size-3.5" />
              Services
            </Link>
          </Button>
          <div>
            <div
              className="flex items-center gap-2 text-[11px] uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              <span>Service editor</span>
              <span>·</span>
              <span>/{snapshot.slug}</span>
              <StatusBadge status={snapshot.status ?? "active"} />
            </div>
            <h1
              className="mt-1 font-display text-2xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {snapshot.title || "Untitled service"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (dirty) saveNow();
              window.open(`#/services/${snapshot.slug}`, "_blank");
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

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Overview</CardTitle>
              <CardDescription>
                Editorial overview shown on the service detail page. Use the WYSIWYG editor — markdown is persisted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border" style={{ borderColor: "var(--border-subtle)" }}>
                <MDXEditor
                  ref={mdxRef}
                  markdown={snapshot.overview ?? ""}
                  onChange={(markdown) => update({ overview: markdown })}
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
                  contentEditableClassName="prose prose-sm max-w-none min-h-[300px] px-3 py-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Benefits</CardTitle>
              <CardDescription>
                Outcome-led bullet points shown in the benefits grid.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ObjectArrayEditor
                label="Benefit"
                values={snapshot.benefits}
                onChange={(benefits) => update({ benefits })}
                makeNew={() => ({ title: "", description: "" })}
                getRowTitle={(b) => b.title || "Untitled"}
                newLabel="Add benefit"
                renderRow={(value, updateRow) => (
                  <div className="space-y-2">
                    <LabeledInput
                      label="Title"
                      inputId={`b-title-${value.title}`}
                      value={value.title}
                      onChange={(e) => updateRow({ title: e.target.value })}
                      placeholder="e.g. Lower alarm fatigue"
                    />
                    <LabeledTextarea
                      label="Description"
                      textareaId={`b-desc-${value.title}`}
                      value={value.description}
                      onChange={(e) => updateRow({ description: e.target.value })}
                      placeholder="One-sentence outcome…"
                      rows={2}
                    />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Capabilities</CardTitle>
              <CardDescription>
                Tech-discipline chips listed under capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StringArrayEditor
                label="Capability"
                values={snapshot.capabilities}
                onChange={(capabilities) => update({ capabilities })}
                placeholder="Add capability and press Enter"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Process</CardTitle>
              <CardDescription>
                Four-step engagement narrative — Discover / Design / Deploy / Support.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LabeledTextarea
                label="Discover"
                textareaId="process-discover"
                value={snapshot.process.discover}
                onChange={(e) =>
                  update({
                    process: { ...snapshot.process, discover: e.target.value },
                  })
                }
                rows={3}
              />
              <LabeledTextarea
                label="Design"
                textareaId="process-design"
                value={snapshot.process.design}
                onChange={(e) =>
                  update({
                    process: { ...snapshot.process, design: e.target.value },
                  })
                }
                rows={3}
              />
              <LabeledTextarea
                label="Deploy"
                textareaId="process-deploy"
                value={snapshot.process.deploy}
                onChange={(e) =>
                  update({
                    process: { ...snapshot.process, deploy: e.target.value },
                  })
                }
                rows={3}
              />
              <LabeledTextarea
                label="Support"
                textareaId="process-support"
                value={snapshot.process.support}
                onChange={(e) =>
                  update({
                    process: { ...snapshot.process, support: e.target.value },
                  })
                }
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Use cases</CardTitle>
              <CardDescription>
                Scenario-driven tiles shown in the use-cases grid.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ObjectArrayEditor
                label="Use case"
                values={snapshot.useCases}
                onChange={(useCases) => update({ useCases })}
                makeNew={() => ({ title: "", description: "" })}
                getRowTitle={(u) => u.title || "Untitled"}
                newLabel="Add use case"
                renderRow={(value, updateRow) => (
                  <div className="space-y-2">
                    <LabeledInput
                      label="Title"
                      inputId={`u-title-${value.title}`}
                      value={value.title}
                      onChange={(e) => updateRow({ title: e.target.value })}
                    />
                    <LabeledTextarea
                      label="Description"
                      textareaId={`u-desc-${value.title}`}
                      value={value.description}
                      onChange={(e) => updateRow({ description: e.target.value })}
                      rows={2}
                    />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">FAQs</CardTitle>
              <CardDescription>
                Q/A pairs shown on the service detail page. These are independent of the global FAQs table.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ObjectArrayEditor
                label="FAQ"
                values={snapshot.faqs}
                onChange={(faqs) => update({ faqs })}
                makeNew={() => ({ question: "", answer: "" })}
                getRowTitle={(f) => f.question || "Untitled"}
                newLabel="Add FAQ"
                renderRow={(value, updateRow) => (
                  <div className="space-y-2">
                    <LabeledInput
                      label="Question"
                      inputId={`q-${value.question}`}
                      value={value.question}
                      onChange={(e) => updateRow({ question: e.target.value })}
                    />
                    <LabeledTextarea
                      label="Answer"
                      textareaId={`a-${value.question}`}
                      value={value.answer}
                      onChange={(e) => updateRow({ answer: e.target.value })}
                      rows={2}
                    />
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Service details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <LabeledInput
                label="Title"
                inputId="svc-title"
                value={snapshot.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="CCTV & Video Surveillance"
              />
              <LabeledInput
                label="Slug"
                inputId="svc-slug"
                value={snapshot.slug}
                onChange={(e) =>
                  update({ slug: e.target.value.toLowerCase() })
                }
              />
              <LabeledInput
                label="Tagline"
                inputId="svc-tagline"
                value={snapshot.tagline}
                onChange={(e) => update({ tagline: e.target.value })}
                placeholder="See everything. Miss nothing."
              />
              <div className="space-y-1.5">
                <Label htmlFor="svc-category" className="text-xs">Category</Label>
                <Select
                  value={snapshot.categorySlug}
                  onValueChange={(v) => update({ categorySlug: v })}
                >
                  <SelectTrigger id="svc-category" className="h-9">
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
              <LabeledInput
                label="Icon (lucide name)"
                inputId="svc-icon"
                value={snapshot.icon ?? ""}
                onChange={(e) => update({ icon: e.target.value })}
                placeholder="Video"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Hero media</CardTitle>
              <CardDescription>
                Featured image for the service detail hero. Use a media id or URL.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <MediaField
                value={snapshot.heroMedia}
                onOpen={() => setMediaOpen(true)}
                onClear={() => update({ heroMedia: undefined })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Related services</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiSelectChips
                label="Related"
                description="Shown in the 'Related services' rail on the public detail page."
                values={snapshot.relatedServiceSlugs}
                options={relatedOptions}
                onChange={(slugs) => update({ relatedServiceSlugs: slugs })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">CTA</CardTitle>
              <CardDescription>Call-to-action button at the end of the page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <LabeledInput
                label="Label"
                inputId="svc-cta-label"
                value={snapshot.cta?.label ?? ""}
                onChange={(e) =>
                  update({
                    cta: {
                      label: e.target.value,
                      href: snapshot.cta?.href ?? "#/contact",
                      variant: snapshot.cta?.variant ?? "primary",
                    },
                  })
                }
                placeholder="Talk to an expert"
              />
              <LabeledInput
                label="Href"
                inputId="svc-cta-href"
                value={snapshot.cta?.href ?? ""}
                onChange={(e) =>
                  update({
                    cta: {
                      label: snapshot.cta?.label ?? "Talk to an expert",
                      href: e.target.value,
                      variant: snapshot.cta?.variant ?? "primary",
                    },
                  })
                }
                placeholder="#/contact"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status</CardTitle>
              <CardDescription>
                Active services appear in the catalog. Coming-soon services show a badge. Retired services are hidden.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Current status
                </span>
                <StatusBadge status={snapshot.status ?? "active"} />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={publish}
                  disabled={(snapshot.status ?? "active") === "active"}
                >
                  <Send className="size-3.5" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={unpublish}
                  disabled={snapshot.status === "coming-soon"}
                >
                  <EyeOff className="size-3.5" />
                  Mark coming soon
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
                fallbackDescription={snapshot.tagline}
              />
            </CardContent>
          </Card>
        </aside>
      </div>

      <MediaPickerDialog
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        value={snapshot.heroMedia}
        onSelect={(m) => {
          if (m) update({ heroMedia: m.id });
        }}
        confirmLabel="Use this image"
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete service?"
        description={`"${snapshot.title}" will be permanently removed from the catalog.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function MediaField({
  value,
  onOpen,
  onClear,
}: {
  value?: string;
  onOpen: () => void;
  onClear: () => void;
}) {
  const media = useMedia();
  const url = value
    ? media.find((m) => m.id === value)?.url ?? value
    : undefined;
  return (
    <div className="flex gap-2">
      <div
        className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-md border"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--surface-2)",
        }}
      >
        {url ? (
          <img src={url} alt="Hero preview" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="size-4" style={{ color: "var(--text-muted)" }} />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <Button type="button" variant="outline" size="sm" onClick={onOpen}>
          {value ? "Change image" : "Pick image"}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-[var(--danger)]"
          >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ServiceNotFound({ slug }: { slug: string }) {
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
        Service not found
      </h1>
      <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
        No service with slug <code className="font-mono">{slug}</code> exists in the
        catalog.
      </p>
      <Button asChild className="mt-4" size="sm">
        <Link to="/admin/services">Back to services</Link>
      </Button>
    </div>
  );
}
