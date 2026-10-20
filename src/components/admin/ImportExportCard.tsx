"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "./ConfirmDialog";
import { useContentStore } from "@/lib/content-store";
import type { ContentState } from "@/lib/types";
import { Download, Upload, FileJson } from "lucide-react";

/**
 * Export/import card. Lets the user download a JSON snapshot of the
 * entire content state and re-import it later (or on a different
 * browser). Import validates the shape (top-level keys must match
 * the ContentState shape) and rejects malformed JSON with a toast
 * error.
 */
export function ImportExportCard() {
  const { exportJson, importJson } = useContentStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importConfirm, setImportConfirm] = useState<{ json: ContentState; summary: string } | null>(null);

  function handleExport() {
    const data = exportJson();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `techstar-content-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported content as JSON.");
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch (e) {
        toast.error("Invalid JSON file: malformed JSON");
        console.warn(e);
        return;
      }
      const summary = validateContentState(json);
      if (!summary) return;
      setImportConfirm({ json: json as ContentState, summary });
    } catch (e) {
      toast.error("Failed to read file.");
      console.warn(e);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function validateContentState(json: unknown): string | null {
    if (typeof json !== "object" || json === null) {
      toast.error("Invalid JSON file: top-level value is not an object.");
      return null;
    }
    const obj = json as Record<string, unknown>;
    // Brief: minimum required keys = services, pages, projects, articles.
    // We accept anything that has these four so partial exports can
    // still be imported without surprise. Other top-level keys are
    // merged over the current state by importJson (callers should be
    // aware — this is demo-grade).
    const required = ["services", "pages", "projects", "articles"] as const;
    const missing = required.filter((k) => !(k in obj));
    if (missing.length > 0) {
      toast.error(`Invalid JSON file: missing required keys (${missing.join(", ")})`);
      return null;
    }
    // Build a short summary
    const summary = [
      `${Array.isArray(obj.services) ? obj.services.length : 0} services`,
      `${Array.isArray(obj.pages) ? obj.pages.length : 0} pages`,
      `${Array.isArray(obj.projects) ? obj.projects.length : 0} projects`,
      `${Array.isArray(obj.articles) ? obj.articles.length : 0} articles`,
      `${Array.isArray(obj.media) ? obj.media.length : 0} media`,
    ].join(", ");
    return summary;
  }

  function confirmImport() {
    if (!importConfirm) return;
    importJson(importConfirm.json);
    toast.success(`Imported ${importConfirm.summary}`);
    setImportConfirm(null);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div
            className="flex size-9 items-center justify-center rounded-md"
            style={{
              backgroundColor: "var(--surface-2)",
              color: "var(--accent-bright)",
            }}
            aria-hidden
          >
            <FileJson className="size-4" />
          </div>
          <div>
            <CardTitle className="font-display text-base" style={{ color: "var(--text-primary)" }}>
              Export / Import
            </CardTitle>
            <CardDescription>
              Round-trip your entire content store as a JSON file.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Export JSON
            </h4>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Downloads the full content store as a single JSON file.
              Filename includes today&apos;s date.
            </p>
          </div>
          <Button variant="default" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="size-3.5" />
            Export JSON
          </Button>
        </div>

        <div className="h-px" style={{ backgroundColor: "var(--border-subtle)" }} aria-hidden />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Import JSON
            </h4>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Replace the current content store with a previously-exported file.
              Malformed files are rejected with a toast error.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5"
          >
            <Upload className="size-3.5" />
            Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportFile(f);
            }}
            aria-label="Import JSON"
          />
        </div>
      </CardContent>

      <ConfirmDialog
        open={!!importConfirm}
        onOpenChange={(o) => !o && setImportConfirm(null)}
        title="Replace current content with imported file?"
        description={
          importConfirm
            ? `This will overwrite all current content with the imported snapshot. ${importConfirm.summary}`
            : ""
        }
        confirmLabel="Import and overwrite"
        variant="destructive"
        onConfirm={confirmImport}
      />
    </Card>
  );
}
