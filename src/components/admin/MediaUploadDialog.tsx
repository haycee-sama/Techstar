"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileWarning, X } from "lucide-react";
import { useContentStore } from "@/lib/content-store";
import {
  MediaQuotaError,
  IndexedDBUnavailableError,
  putMediaBlob,
  takeMemoryUnavailableFlag,
  mediaKindFromMime,
} from "@/lib/indexeddb";
import { makeId, formatBytes } from "@/lib/utils";
import type { MediaAsset } from "@/lib/types";

interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded?: (asset: MediaAsset) => void;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Upload dialog used by the Media Library. Validates file type + size,
 * stores the blob to IndexedDB (or the in-memory fallback when
 * IndexedDB is unavailable), then upserts a MediaAsset into the
 * content store so it shows alongside seed media.
 *
 * Demo-grade: uploads persist to the browser only — not hosted.
 */
export function MediaUploadDialog({
  open,
  onOpenChange,
  onUploaded,
}: MediaUploadDialogProps) {
  const { upsertMedia } = useContentStore();
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function processFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setBusy(true);
    let added = 0;
    for (const file of arr) {
      // Type check — image or video only
      const kind = mediaKindFromMime(file.type);
      if (kind === "document" || kind === "audio") {
        toast.warning(`Skipped ${file.name} — only images and videos are supported.`);
        continue;
      }
      // Size check — reject > 10MB
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name} is too large — max 10MB.`);
        continue;
      }
      const id = makeId("media");
      const createdAt = new Date().toISOString();
      let persistedFailure = false;
      try {
        await putMediaBlob(id, file, {
          fileName: file.name,
          type: file.type,
          size: file.size,
          createdAt,
        });
      } catch (err) {
        // IndexedDB unavailable (private mode / legacy browser / disabled).
        // Per the brief, we still complete the upload with an object URL
        // only — the asset will vanish on next refresh. Surface a toast.
        if (err instanceof IndexedDBUnavailableError) {
          persistedFailure = true;
          toast.warning("IndexedDB unavailable — upload will not persist after refresh");
        } else if (err instanceof MediaQuotaError) {
          toast.error("Storage limit reached — remove older uploads to free space.");
          continue;
        } else {
          toast.error(`Failed to upload ${file.name}`);
           
          console.warn(err);
          continue;
        }
      }
      // If putMediaBlob fell back to the in-memory Map without throwing,
      // surface the one-shot "unavailable" toast here so the user knows
      // uploads won't survive a refresh.
      if (!persistedFailure && takeMemoryUnavailableFlag()) {
        toast.warning("IndexedDB unavailable — upload will not persist after refresh");
      }
      const url = URL.createObjectURL(file);
      const asset: MediaAsset = {
        id,
        type: kind === "video" ? "video" : "image",
        url,
        title: file.name.replace(/\.[^.]+$/, ""),
        alt: file.name.replace(/\.[^.]+$/, ""),
        fileName: file.name,
        createdAt,
        tags: ["upload"],
      };
      upsertMedia(asset);
      onUploaded?.(asset);
      added++;
    }
    if (added > 0) {
      toast.success(`Asset uploaded (demo — local storage only)${added > 1 ? ` ×${added}` : ""}`);
    }
    setBusy(false);
    onOpenChange(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      void processFiles(e.dataTransfer.files);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Upload media</DialogTitle>
          <DialogDescription>
            Add an image or video to the media library. Uploads are kept
            in your browser&apos;s IndexedDB and may be cleared when you
            clear browser data — not suitable for production.
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors"
          style={{
            borderColor: dragOver ? "var(--accent-bright)" : "var(--border-strong)",
            backgroundColor: dragOver ? "var(--surface-2)" : "var(--surface-1)",
          }}
        >
          <Upload
            className="size-6"
            style={{ color: "var(--text-muted)" }}
            aria-hidden
          />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Drag files here, or
          </p>
          <label
            htmlFor="media-upload-input"
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-xs font-medium"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--text-on-accent, #fff)",
            }}
          >
            <Upload className="size-3.5" />
            Browse files
            <input
              id="media-upload-input"
              type="file"
              accept="image/*,video/*"
              multiple
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                if (e.target.files?.length) {
                  void processFiles(e.target.files);
                }
                e.currentTarget.value = "";
              }}
              aria-label="Choose files to upload"
            />
          </label>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            PNG, JPG, WebP, MP4, WebM — max {formatBytes(MAX_FILE_BYTES)} per file.
          </p>
          {busy ? (
            <p className="mt-1 text-[11px]" style={{ color: "var(--accent-bright)" }}>
              Uploading…
            </p>
          ) : null}
        </div>

        <div
          className="flex items-start gap-2 rounded-md border p-2 text-[11px]"
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--surface-2)",
            color: "var(--text-muted)",
          }}
        >
          <FileWarning className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            IndexedDB-persisted uploads survive page refresh in modern
            browsers. In private mode or when IndexedDB is disabled,
            uploads are kept in memory for the current session only.
          </span>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            <X className="size-3.5" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
