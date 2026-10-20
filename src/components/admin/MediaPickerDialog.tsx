"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContentStore, useMedia } from "@/lib/content-store";
import { makeId } from "@/lib/utils";
import { ImageIcon, Upload, X, Check } from "lucide-react";
import type { MediaAsset } from "@/lib/types";

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Currently-selected media id or URL. */
  value?: string;
  /** Called when user confirms a selection. */
  onSelect: (media: MediaAsset | null) => void;
  /** Optional label for the confirm button. */
  confirmLabel?: string;
}

/**
 * Lightweight media library picker. Lists existing MediaAssets from the
 * content store and supports a "Upload new (demo)" flow that creates an
 * object URL and persists the asset via `upsertMedia`.
 *
 * Used by PageEditor (featured image, OG image) and Phase 3b CRUD tables.
 */
export function MediaPickerDialog({
  open,
  onOpenChange,
  value,
  onSelect,
  confirmLabel = "Select",
}: MediaPickerDialogProps) {
  const media = useMedia();
  const { upsertMedia } = useContentStore();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(value ?? null);

  useEffect(() => {
    if (open) {
      setSelectedId(value ?? null);
      setQuery("");
    }
  }, [open, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return media;
    return media.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.alt?.toLowerCase().includes(q) ||
        m.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [media, query]);

  function handleUpload(file: File) {
    const url = URL.createObjectURL(file);
    const asset: MediaAsset = {
      id: makeId("media"),
      type: file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
        ? "audio"
        : "image",
      url,
      title: file.name.replace(/\.[^.]+$/, ""),
      alt: file.name,
      fileName: file.name,
      createdAt: new Date().toISOString(),
      tags: ["upload"],
    };
    upsertMedia(asset);
    setSelectedId(asset.id);
  }

  function confirm() {
    if (!selectedId) {
      onSelect(null);
    } else {
      const picked = media.find((m) => m.id === selectedId) ?? null;
      onSelect(picked);
    }
    onOpenChange(false);
  }

  function clear() {
    setSelectedId(null);
    onSelect(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
          <DialogDescription>
            Choose an existing asset or upload a new one (demo only — uploads
            are kept in browser memory and persisted to local storage).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search media"
              className="pr-9"
              aria-label="Search media library"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
          <label
            htmlFor="media-upload"
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 text-xs font-medium transition-colors hover:bg-[var(--surface-2)]"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-secondary)" }}
          >
            <Upload className="size-3.5" />
            Upload new (demo)
            <input
              id="media-upload"
              type="file"
              accept="image/*,video/*,audio/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>

        <ScrollArea className="max-h-[55vh]">
          <div className="grid grid-cols-2 gap-3 p-1 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.length === 0 ? (
              <div
                className="col-span-full flex flex-col items-center justify-center gap-2 py-10 text-center text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <ImageIcon className="size-5" />
                <span>No media matches</span>
              </div>
            ) : (
              filtered.map((m) => {
                const selected = selectedId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedId(m.id)}
                    className="group relative overflow-hidden rounded-md border text-left transition-all"
                    style={{
                      borderColor: selected
                        ? "var(--accent-bright)"
                        : "var(--border-subtle)",
                      boxShadow: selected
                        ? "0 0 0 1px var(--accent-bright)"
                        : "none",
                    }}
                    aria-pressed={selected}
                    aria-label={`Select ${m.title}`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--surface-2)]">
                      {m.type === "image" ? (
                        <img
                          src={m.url}
                          alt={m.alt}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon
                            className="size-5"
                            style={{ color: "var(--text-muted)" }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="px-2 py-1.5">
                      <p
                        className="truncate text-xs font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {m.title}
                      </p>
                      <p
                        className="text-[10px] uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {m.type}
                      </p>
                    </div>
                    {selected ? (
                      <div
                        className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: "var(--accent-bright)" }}
                        aria-hidden
                      >
                        <Check className="size-3" />
                      </div>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="justify-between sm:justify-between">
          {value ? (
            <Button type="button" variant="ghost" size="sm" onClick={clear}>
              Clear selection
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={confirm}
              disabled={!selectedId}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
