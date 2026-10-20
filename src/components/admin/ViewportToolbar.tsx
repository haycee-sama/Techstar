"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Save,
  Send,
  ExternalLink,
  HelpCircle,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type Viewport = "desktop" | "tablet" | "mobile";

interface ViewportToolbarProps {
  pageTitle: string;
  onTitleChange: (next: string) => void;
  viewport: Viewport;
  onViewportChange: (v: Viewport) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  status: "saving" | "saved" | "dirty";
  lastSavedAt: string | null;
  published: boolean;
  publishedAt: string | null;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onPreview: () => void;
}

/**
 * Top toolbar of the visual builder center canvas. Holds the inline
 * editable page title, viewport toggle (Desktop / Tablet / Mobile),
 * undo / redo (Ctrl+Z / Ctrl+Shift+Z wired up in the parent), Save
 * draft, Publish / Unpublish, Preview, and a status indicator.
 *
 * Also shows a small honesty chip + a Help dialog explaining scope
 * ("Section-based editor — edits structured section data, not
 * arbitrary HTML.").
 */
export function ViewportToolbar({
  pageTitle,
  onTitleChange,
  viewport,
  onViewportChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  status,
  lastSavedAt,
  published,
  publishedAt,
  onSave,
  onPublish,
  onUnpublish,
  onPreview,
}: ViewportToolbarProps) {
  return (
    <header
      className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b px-3 py-2"
      style={{
        backgroundColor: "var(--background)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <Input
        value={pageTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        aria-label="Page title"
        className="h-8 w-48 text-sm font-semibold sm:w-64"
        style={{ color: "var(--text-primary)" }}
      />

      <StatusIndicator status={status} lastSavedAt={lastSavedAt} published={published} publishedAt={publishedAt} />

      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        <ViewportToggle viewport={viewport} onChange={onViewportChange} />
        <div className="mx-1 h-5 w-px" style={{ backgroundColor: "var(--border-subtle)" }} aria-hidden />
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo (Ctrl+Z)"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo (Ctrl+Shift+Z)"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="size-3.5" />
        </Button>
        <div className="mx-1 h-5 w-px" style={{ backgroundColor: "var(--border-subtle)" }} aria-hidden />
        <Button variant="outline" size="sm" onClick={onSave} className="h-8 gap-1.5">
          <Save className="size-3.5" />
          Save draft
        </Button>
        {published ? (
          <Button variant="outline" size="sm" onClick={onUnpublish} className="h-8 gap-1.5">
            Unpublish
          </Button>
        ) : (
          <Button size="sm" onClick={onPublish} className="h-8 gap-1.5">
            <Send className="size-3.5" />
            Publish
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onPreview} className="h-8 gap-1.5">
          <ExternalLink className="size-3.5" />
          Preview
        </Button>
        <HelpDialog />
      </div>
    </header>
  );
}

function ViewportToggle({
  viewport,
  onChange,
}: {
  viewport: Viewport;
  onChange: (v: Viewport) => void;
}) {
  const options: { value: Viewport; icon: typeof Monitor; label: string; width: string }[] = [
    { value: "desktop", icon: Monitor, label: "Desktop", width: "100%" },
    { value: "tablet", icon: Tablet, label: "Tablet", width: "768px" },
    { value: "mobile", icon: Smartphone, label: "Mobile", width: "390px" },
  ];
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-md border p-0.5"
      style={{
        borderColor: "var(--border-subtle)",
        backgroundColor: "var(--surface-1)",
      }}
      role="group"
      aria-label="Preview viewport"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = viewport === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            title={opt.label}
            aria-label={`${opt.label} viewport`}
            className="flex size-7 items-center justify-center rounded transition-colors"
            style={{
              backgroundColor: active ? "var(--surface-2)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            <Icon className="size-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

function StatusIndicator({
  status,
  lastSavedAt,
  published,
  publishedAt,
}: {
  status: "saving" | "saved" | "dirty";
  lastSavedAt: string | null;
  published: boolean;
  publishedAt: string | null;
}) {
  const [, setTick] = useState(0);
  // Refresh relative time every 30s
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const label =
    status === "saving" ? "Saving…" : status === "dirty" ? "Unsaved changes" : "Saved";
  const color =
    status === "saving" ? "var(--text-muted)" : status === "dirty" ? "var(--warning, #f59e0b)" : "var(--success, #10b981)";

  const savedAtStr = lastSavedAt ? relativeTime(lastSavedAt) : "never";
  const publishedAtStr = publishedAt ? relativeTime(publishedAt) : "—";

  return (
    <div className="hidden items-center gap-2 text-[11px] sm:flex">
      <span className="inline-flex items-center gap-1" style={{ color }} title={`Last saved: ${savedAtStr}`}>
        <Check className="size-3" aria-hidden />
        {label}
      </span>
      <span aria-hidden style={{ color: "var(--text-muted)" }}>·</span>
      <span style={{ color: "var(--text-muted)" }} title="Page status">
        {published ? "Published" : "Draft"}
      </span>
      {published ? (
        <span style={{ color: "var(--text-muted)" }} title={`Published at: ${publishedAtStr}`}>
          · {publishedAtStr}
        </span>
      ) : null}
    </div>
  );
}

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          aria-label="Help — what the visual builder edits"
        >
          <HelpCircle className="size-3.5" />
          <span className="hidden text-xs sm:inline">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>What the visual builder edits</DialogTitle>
          <DialogDescription>
            A clear picture of what the builder touches — and what it doesn&apos;t.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          <p>
            The visual builder is a <strong style={{ color: "var(--text-primary)" }}>section-based editor</strong>.
            It edits the <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 text-xs">sections</code> array
            on a <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 text-xs">PageContent</code> record —
            a structured list of typed sections (hero, split-image, stats, timeline, CTA, etc.).
          </p>
          <p>
            It is <strong style={{ color: "var(--text-primary)" }}>not</strong> a free-form HTML editor. You
            cannot drop arbitrary markup onto a page; you can only compose the section types listed in
            the Insert panel. Each section&apos;s schema (eyebrow / heading / body / CTA / image / variants)
            is enforced by the inspector.
          </p>
          <p>
            The public home page renders its own fixed composition of section components directly — it
            does <strong style={{ color: "var(--text-primary)" }}>not</strong> read from{" "}
            <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 text-xs">sections</code>. Builder
            pages are rendered by the <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 text-xs">#/preview/&lt;slug&gt;</code>{" "}
            route via the shared <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 text-xs">SectionRenderer</code>.
          </p>
          <p style={{ color: "var(--text-muted)" }}>
            Honest scope: this builder is best suited for landing pages, about pages, and other
            evergreen pages that benefit from section-level composition. Long-form articles still
            use the markdown-based page editor at{" "}
            <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 text-xs">#/admin/pages/&lt;slug&gt;</code>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
