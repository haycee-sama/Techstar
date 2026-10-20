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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  ArrowLeft,
  Eye,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useRouter } from "@/lib/router";
import {
  useContentStore,
  useLegalPage,
} from "@/lib/content-store";

const SAVE_DEBOUNCE_MS = 500;

export function LegalEditor({ slug }: { slug: string }) {
  const legalPage = useLegalPage(slug);
  const { upsertLegalPage } = useContentStore();
  const { navigate } = useRouter();

  const [draft, setDraft] = useState(legalPage ? { ...legalPage } : null);
  const [dirty, setDirty] = useState(false);
  const mdxRef = useRef<MDXEditorMethods | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const next = legalPage ? { ...legalPage } : null;
    setDraft(next);
    setDirty(false);
    if (next) {
      setTimeout(() => mdxRef.current?.setMarkdown(next.body ?? ""), 0);
    }
     
  }, [slug]);

  useEffect(() => {
    if (!draft || !dirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (!draft) return;
      const stamped = { ...draft, updatedAt: new Date().toISOString() };
      upsertLegalPage(stamped);
      setDraft(stamped);
      setDirty(false);
      toast.success("Legal document saved.", { description: draft.title });
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
     
  }, [draft, dirty]);

  const update = useCallback((patch: Partial<NonNullable<typeof draft>>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    setDirty(true);
  }, []);

  function saveNow() {
    if (!draft) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const stamped = { ...draft, updatedAt: new Date().toISOString() };
    upsertLegalPage(stamped);
    setDraft(stamped);
    setDirty(false);
    toast.success("Legal document saved.", { description: draft.title });
  }

  if (!draft) {
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
          Legal document not found
        </h1>
        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          No legal document with slug <code className="font-mono">{slug}</code> exists.
        </p>
        <Button asChild className="mt-4" size="sm">
          <Link to="/admin/legal">Back to legal documents</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild size="sm" variant="ghost" className="mt-0.5">
            <Link to="/admin/legal">
              <ArrowLeft className="size-3.5" />
              Legal
            </Link>
          </Button>
          <div>
            <div
              className="flex items-center gap-2 text-[11px] uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              <span>Legal editor</span>
              <span>·</span>
              <span>/{draft.slug}</span>
            </div>
            <h1
              className="mt-1 font-display text-2xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {draft.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              saveNow();
              const publicSlug = draft.slug === "cookie" ? "cookie-preferences" : draft.slug;
              window.open(`#/${publicSlug}`, "_blank");
            }}
          >
            <Eye className="size-3.5" />
            Preview
          </Button>
          <Button size="sm" onClick={saveNow} disabled={!dirty}>
            <Save className="size-3.5" />
            Save
          </Button>
        </div>
      </div>

      <div
        className="flex items-start gap-3 rounded-md border px-3 py-2 text-xs"
        style={{
          borderColor: "var(--warning)",
          backgroundColor: "var(--surface-2)",
          color: "var(--text-secondary)",
        }}
      >
        <AlertTriangle
          className="mt-0.5 size-4 shrink-0"
          style={{ color: "var(--warning)" }}
        />
        <p>
          <strong>Sample policy.</strong> This document is illustrative only.
          Replace with reviewed legal copy before launch.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Document body</CardTitle>
              <CardDescription>
                Markdown source rendered via react-markdown on the public side.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border" style={{ borderColor: "var(--border-subtle)" }}>
                <MDXEditor
                  ref={mdxRef}
                  markdown={draft.body ?? ""}
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
        <aside>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Document details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="legal-title" className="text-xs">Title</Label>
                <Input
                  id="legal-title"
                  value={draft.title}
                  onChange={(e) => update({ title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="legal-slug" className="text-xs">Slug</Label>
                <Input
                  id="legal-slug"
                  value={draft.slug}
                  onChange={(e) => update({ slug: e.target.value.toLowerCase() })}
                />
              </div>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Last updated: {draft.updatedAt}
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
