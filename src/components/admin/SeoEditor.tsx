"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MediaPickerDialog } from "./MediaPickerDialog";
import { useMedia } from "@/lib/content-store";
import { ImageIcon, ExternalLink } from "lucide-react";
import type { SeoMeta } from "@/lib/types";

interface SeoEditorProps {
  value: SeoMeta;
  onChange: (next: SeoMeta) => void;
  /** Default title used when SEO title is empty (e.g. the page title). */
  fallbackTitle?: string;
  /** Default description used when SEO description is empty. */
  fallbackDescription?: string;
  /** Site base URL for the social preview card. */
  siteBaseUrl?: string;
}

const SEO_TITLE_MAX = 60;
const SEO_DESC_MAX = 160;

/**
 * Reusable SEO fields block: SEO title (with counter), meta description
 * (with counter), canonical URL, OG title, OG image (media picker), and a
 * rendered social-preview card. Mounted inside the PageEditor right sidebar
 * and reusable by Phase 3b CRUD editors (services, articles, projects).
 */
export function SeoEditor({
  value,
  onChange,
  fallbackTitle = "",
  fallbackDescription = "",
  siteBaseUrl = "https://techstar.example",
}: SeoEditorProps) {
  const media = useMedia();
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    // No-op — keeps React from complaining about controlled inputs without onChange
  }, []);

  function update(patch: Partial<SeoMeta>) {
    onChange({ ...value, ...patch });
  }

  const ogUrl = value.ogImage
    ? resolveMediaUrl(value.ogImage, media)
    : undefined;

  const previewTitle = value.title || fallbackTitle || "Untitled page";
  const previewDesc =
    value.description || fallbackDescription || "Techstar editorial content.";
  const previewUrl = value.canonical
    ? value.canonical
    : `${siteBaseUrl}/#/page`;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="seo-title" className="text-xs">
            SEO title
          </Label>
          <CharCounter
            count={(value.title ?? "").length}
            max={SEO_TITLE_MAX}
          />
        </div>
        <Input
          id="seo-title"
          value={value.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder={fallbackTitle || "SEO title…"}
          maxLength={120}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="seo-desc" className="text-xs">
            Meta description
          </Label>
          <CharCounter
            count={(value.description ?? "").length}
            max={SEO_DESC_MAX}
          />
        </div>
        <Textarea
          id="seo-desc"
          value={value.description ?? ""}
          onChange={(e) => update({ description: e.target.value })}
          placeholder={fallbackDescription || "Short summary for search results…"}
          rows={3}
          maxLength={300}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="seo-canonical" className="text-xs">
          Canonical URL
        </Label>
        <Input
          id="seo-canonical"
          value={value.canonical ?? ""}
          onChange={(e) => update({ canonical: e.target.value })}
          placeholder={`${siteBaseUrl}/your-page`}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="og-title" className="text-xs">
          Open Graph title
        </Label>
        <Input
          id="og-title"
          value={value.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder={previewTitle}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Open Graph image</Label>
        <div className="flex gap-2">
          <div
            className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-md border"
            style={{
              borderColor: "var(--border-subtle)",
              backgroundColor: "var(--surface-2)",
            }}
          >
            {ogUrl ? (
              <img
                src={ogUrl}
                alt="Open Graph preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon
                className="size-4"
                style={{ color: "var(--text-muted)" }}
              />
            )}
          </div>
          <div className="flex flex-1 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-12 flex-1"
              onClick={() => setPickerOpen(true)}
            >
              {value.ogImage ? "Change image" : "Pick image"}
            </Button>
            {value.ogImage ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-12 px-2"
                onClick={() => update({ ogImage: undefined })}
                aria-label="Clear OG image"
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Social preview</Label>
        <div
          className="overflow-hidden rounded-lg border"
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--bg-navy)",
          }}
        >
          {ogUrl ? (
            <div className="aspect-[1.91/1] w-full overflow-hidden bg-[var(--surface-2)]">
              <img
                src={ogUrl}
                alt={previewTitle}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
          <div className="p-3">
            <p
              className="truncate text-[11px] uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              {previewUrl}
            </p>
            <p
              className="mt-1 line-clamp-1 text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {previewTitle}
            </p>
            <p
              className="mt-0.5 line-clamp-2 text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {previewDesc}
            </p>
          </div>
        </div>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          Preview is illustrative — social networks apply their own card rules.
        </p>
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        value={value.ogImage}
        onSelect={(m) => {
          if (m) update({ ogImage: m.id });
        }}
        confirmLabel="Use this image"
      />

      <p
        className="flex items-center gap-1 text-[10px]"
        style={{ color: "var(--text-muted)" }}
      >
        <ExternalLink className="size-3" />
        Demo mode — these SEO fields persist to local storage only.
      </p>
    </div>
  );
}

function CharCounter({ count, max }: { count: number; max: number }) {
  const over = count > max;
  const near = !over && count > max * 0.85;
  return (
    <span
      className="font-mono text-[10px] tabular-nums"
      style={{
        color: over
          ? "var(--danger)"
          : near
          ? "var(--warning)"
          : "var(--text-muted)",
      }}
    >
      {count}/{max}
    </span>
  );
}

function resolveMediaUrl(
  ref: string | undefined,
  media: ReturnType<typeof useMedia>
): string | undefined {
  if (!ref) return undefined;
  const found = media.find((m) => m.id === ref);
  return found?.url ?? ref;
}
