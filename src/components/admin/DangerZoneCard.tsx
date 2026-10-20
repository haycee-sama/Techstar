"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmDialog } from "./ConfirmDialog";
import { useContentStore, useMedia } from "@/lib/content-store";
import { clearAllMediaBlobs } from "@/lib/indexeddb";
import { AlertTriangle, Trash2, RefreshCw, RotateCcw } from "lucide-react";

/**
 * Red-bordered danger zone card with destructive content actions:
 *   - Reset all content to seed data (with confirm dialog)
 *   - Reset only media uploads (clears IndexedDB + the in-memory
 *     fallback store, and removes every MediaAsset from the content
 *     store). Other content stays intact.
 */
export function DangerZoneCard() {
  const { resetToSeed, exportJson, deleteMedia } = useContentStore();
  const media = useMedia();
  const [resetOpen, setResetOpen] = useState(false);
  const [resetMediaOpen, setResetMediaOpen] = useState(false);

  function handleResetAll() {
    const snapshot = exportJson();
    try {
      // Stash a one-shot backup the user can restore by hand if needed.
      window.sessionStorage.setItem(
        "techstar:content:reset-backup",
        JSON.stringify(snapshot)
      );
    } catch {
      // ignore — backup is best-effort
    }
    // Also clear IndexedDB uploads — the seed data does not include
    // them, so leaving stale blobs behind would orphan them.
    void clearAllMediaBlobs().catch(() => undefined);
    resetToSeed();
    toast.success("Content reset to seed data");
  }

  async function handleResetMediaOnly() {
    // 1) Clear every persisted blob (and the in-memory fallback).
    try {
      await clearAllMediaBlobs();
    } catch {
      // best-effort — the content store still gets cleared below
    }
    // 2) Remove every MediaAsset from the content store.
    for (const m of media) {
      deleteMedia(m.id);
    }
    toast.success("Media library cleared");
  }

  return (
    <Card
      className="border-2"
      style={{
        borderColor: "var(--danger, #ef4444)",
      }}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <div
            className="flex size-9 items-center justify-center rounded-md"
            style={{
              backgroundColor: "color-mix(in srgb, var(--danger, #ef4444) 12%, transparent)",
              color: "var(--danger, #ef4444)",
            }}
            aria-hidden
          >
            <AlertTriangle className="size-4" />
          </div>
          <div>
            <CardTitle className="font-display text-base" style={{ color: "var(--text-primary)" }}>
              Danger zone
            </CardTitle>
            <CardDescription>
              Destructive actions — proceed with caution.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert variant="destructive">
          <AlertTriangle className="size-4" aria-hidden />
          <AlertTitle>Back up first</AlertTitle>
          <AlertDescription>
            Use the Export tab to download your current content before
            resetting. A one-shot session backup is also stashed in
            <code className="mx-1 rounded bg-black/10 px-1 py-0.5 text-[11px]">
              sessionStorage
            </code>
            when you reset.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Reset all content to seed data
            </h4>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Overwrites every page, service, article, project, testimonial,
              FAQ, form, and global setting. Irreversible (without a backup).
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setResetOpen(true)}
            className="gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            Reset to seed
          </Button>
        </div>

        <div className="h-px" style={{ backgroundColor: "var(--border-subtle)" }} aria-hidden />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Reset only media uploads
            </h4>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Clears every persisted upload from IndexedDB
              ({media.length} {media.length === 1 ? "asset" : "assets"} in
              the library) and removes all MediaAssets from the store.
              Other content stays intact.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetMediaOpen(true)}
            className="gap-1.5 text-[var(--danger,#ef4444)] hover:text-[var(--danger,#ef4444)]"
          >
            <Trash2 className="size-3.5" />
            Reset media
          </Button>
        </div>
      </CardContent>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset all content to seed data?"
        description="This will overwrite all your local changes to content. Export first if you want to keep them. This action cannot be undone. A one-shot session backup is stashed in sessionStorage as a safety net."
        confirmLabel="Reset everything"
        variant="destructive"
        onConfirm={handleResetAll}
      />

      <ConfirmDialog
        open={resetMediaOpen}
        onOpenChange={setResetMediaOpen}
        title="Reset media library?"
        description={`All ${media.length} media ${media.length === 1 ? "asset" : "assets"} will be removed from the content store and IndexedDB. Sections referencing them will show a broken image. This action cannot be undone.`}
        confirmLabel="Reset media"
        variant="destructive"
        onConfirm={handleResetMediaOnly}
      />
    </Card>
  );
}

// Re-export so callers can compose a small inline reset button
export function InlineResetButton() {
  const { resetToSeed } = useContentStore();
  return (
    <Button variant="outline" size="sm" onClick={() => resetToSeed()} className="gap-1.5">
      <RotateCcw className="size-3.5" />
      Reset content
    </Button>
  );
}
