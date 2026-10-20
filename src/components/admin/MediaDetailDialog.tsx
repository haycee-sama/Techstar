"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Copy,
  Trash2,
  AlertTriangle,
  Image as ImageIcon,
  Video as VideoIcon,
  Star,
} from "lucide-react";
import type { MediaAsset } from "@/lib/types";
import { copyToClipboard, formatDate } from "@/lib/utils";

interface MediaDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: MediaAsset | null;
  onUpdate: (next: MediaAsset) => void;
  onDelete: (m: MediaAsset) => void;
}

/**
 * Detail dialog for a single MediaAsset — large preview, editable
 * title / description / alt text (accessibility warning if empty),
 * read-only metadata, "Copy reference URL", "Copy markdown",
 * "Use as featured" hint, and Delete.
 */
export function MediaDetailDialog({
  open,
  onOpenChange,
  media,
  onUpdate,
  onDelete,
}: MediaDetailDialogProps) {
  const [draft, setDraft] = useState<MediaAsset | null>(media);

  // Re-sync when the incoming media changes
  useEffect(() => {
    setDraft(media);
  }, [media]);

  if (!media || !draft) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>No media selected</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  function update(partial: Partial<MediaAsset>) {
    const next: MediaAsset = { ...draft!, ...partial };
    setDraft(next);
    onUpdate(next);
  }

  async function handleCopyUrl() {
    try {
      await copyToClipboard(draft!.url);
      toast.success("Reference URL copied to clipboard");
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access");
    }
  }

  async function handleCopyMarkdown() {
    const md = `![${draft!.alt || draft!.title}](${draft!.url})`;
    try {
      await copyToClipboard(md);
      toast.success("Markdown copied to clipboard");
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access");
    }
  }

  function handleUseAsFeatured() {
    toast.message("Open a page editor's media picker to select this asset", {
      description:
        "Open any page in the visual builder, click a section with an image field, then click \"Pick\".",
    });
  }

  const altEmpty = !draft.alt?.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Media detail</DialogTitle>
          <DialogDescription>
            Edit metadata, copy a reference, or remove the asset.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Preview */}
          <div
            className="flex aspect-square items-center justify-center overflow-hidden rounded-md border"
            style={{
              borderColor: "var(--border-subtle)",
              backgroundColor: "var(--surface-2)",
            }}
          >
            {draft.type === "image" ? (
              <img
                src={draft.url}
                alt={draft.alt}
                className="h-full w-full object-contain"
              />
            ) : draft.type === "video" ? (
              <video
                src={draft.url}
                controls
                className="max-h-full max-w-full"
              />
            ) : (
              <ImageIcon className="size-8" style={{ color: "var(--text-muted)" }} aria-hidden />
            )}
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="media-title" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Title
              </Label>
              <Input
                id="media-title"
                value={draft.title}
                onChange={(e) => update({ title: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="media-alt" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Alt text (required for accessibility)
              </Label>
              <Textarea
                id="media-alt"
                value={draft.alt}
                onChange={(e) => update({ alt: e.target.value })}
                rows={3}
                className="text-sm"
                placeholder="Describe the image for screen readers…"
              />
              {altEmpty ? (
                <div
                  className="flex items-center gap-1.5 text-[11px]"
                  style={{ color: "var(--warning, #f59e0b)" }}
                >
                  <AlertTriangle className="size-3" aria-hidden />
                  Alt text is empty — screen readers will not convey this image.
                </div>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="media-desc" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Description
              </Label>
              <Textarea
                id="media-desc"
                value={draft.description ?? ""}
                onChange={(e) => update({ description: e.target.value })}
                rows={2}
                className="text-xs"
                placeholder="Optional longer description for the editor's reference."
              />
            </div>

            <div
              className="rounded-md border p-2 text-[11px]"
              style={{
                borderColor: "var(--border-subtle)",
                backgroundColor: "var(--surface-2)",
                color: "var(--text-muted)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="uppercase tracking-wide">Type</span>
                <span className="font-mono" style={{ color: "var(--text-secondary)" }}>
                  {draft.type === "video" ? (
                    <span className="inline-flex items-center gap-1">
                      <VideoIcon className="size-3" aria-hidden /> Video
                    </span>
                  ) : draft.type === "image" ? (
                    <span className="inline-flex items-center gap-1">
                      <ImageIcon className="size-3" aria-hidden /> Image
                    </span>
                  ) : (
                    draft.type
                  )}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="uppercase tracking-wide">Filename</span>
                <span className="truncate font-mono" style={{ color: "var(--text-secondary)" }} title={draft.fileName ?? ""}>
                  {draft.fileName ?? "—"}
                </span>
              </div>
              {draft.width && draft.height ? (
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="uppercase tracking-wide">Dimensions</span>
                  <span className="font-mono" style={{ color: "var(--text-secondary)" }}>
                    {draft.width} × {draft.height}
                  </span>
                </div>
              ) : null}
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="uppercase tracking-wide">Created</span>
                <span style={{ color: "var(--text-secondary)" }}>
                  {formatDate(draft.createdAt, "short")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyUrl} className="gap-1.5">
            <Copy className="size-3.5" />
            Copy reference URL
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyMarkdown} className="gap-1.5">
            <Copy className="size-3.5" />
            Copy markdown
          </Button>
          <Button variant="outline" size="sm" onClick={handleUseAsFeatured} className="gap-1.5">
            <Star className="size-3.5" />
            Use as featured image
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(draft)}
            className="ml-auto gap-1.5 text-[var(--danger,#ef4444)] hover:text-[var(--danger,#ef4444)]"
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
