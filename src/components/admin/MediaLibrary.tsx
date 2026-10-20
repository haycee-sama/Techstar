"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutGrid,
  List as ListIcon,
  Search,
  Upload,
  ImageIcon,
  Video as VideoIcon,
  Code as EmbedIcon,
  AlertTriangle,
  MoreHorizontal,
  Copy,
  FileText,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useContentStore, useMedia } from "@/lib/content-store";
import type { MediaAsset } from "@/lib/types";
import {
  deleteMediaBlob,
  listMediaBlobs,
  mediaKindFromMime,
  putMediaBlob,
  takeMemoryUnavailableFlag,
  type StoredMediaBlob,
  MediaQuotaError,
  IndexedDBUnavailableError,
} from "@/lib/indexeddb";
import { copyToClipboard, formatDate } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { MediaDetailDialog } from "./MediaDetailDialog";
import { MediaUploadDialog } from "./MediaUploadDialog";
import { ConfirmDialog } from "./ConfirmDialog";

type TypeFilter = "all" | "image" | "video" | "embed";
type ViewMode = "grid" | "list";

/**
 * Classify a MediaAsset into a filter bucket:
 *  - image  → "image"
 *  - video with a known embed host (youtube / vimeo / /embed/) → "embed"
 *  - other video → "video"
 *  - document/audio (rare in seed) → "embed" bucket so the filter
 *    still surfaces them rather than hiding them entirely.
 */
function classifyAsset(m: MediaAsset): TypeFilter {
  if (m.type === "image") return "image";
  if (m.type === "video") {
    const url = m.url.toLowerCase();
    if (
      url.includes("youtube") ||
      url.includes("youtu.be") ||
      url.includes("vimeo") ||
      url.includes("/embed/")
    ) {
      return "embed";
    }
    return "video";
  }
  return "embed";
}

/**
 * Media library — admin route `#/admin/media`.
 *
 * Lists every MediaAsset (seed data + IndexedDB-persisted uploads).
 * Toolbar: live search, type filter (All | Image | Video | Embed),
 * grid/list toggle, and Upload (opens the upload dialog).
 *
 * Grid tile: thumbnail, filename, type chip, hover overlay with quick
 * actions (Edit / Copy URL / Delete).
 *
 * List view: table rows with thumbnail, filename, type, dimensions,
 * alt (with warning indicator if empty), created date, and a
 * per-row actions menu (Edit / Copy URL / Copy markdown / Delete).
 *
 * Click any tile/row to open the detail dialog. Detail dialog handles
 * all metadata edits + deletion.
 *
 * Honest scope: uploads are browser-local. They are NOT hosted and
 * may be cleared when the user clears browser data. Not suitable
 * for production. A persistent Alert at the top of the page says so.
 */
export function MediaLibrary() {
  const media = useMedia();
  const { upsertMedia, deleteMedia } = useContentStore();

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [view, setView] = useState<ViewMode>("grid");

  // Live-filter is debounced 150ms so typing stays responsive even
  // when the library grows past a few hundred assets.
  const debouncedQuery = useDebouncedValue(query, 150);

  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Track which asset ids were uploaded by the user (vs. seeded). Used
  // to know which IndexedDB blobs to clean up on delete + on the
  // "Reset only media" danger-zone action.
  const uploadedIdsRef = useRef<Set<string>>(new Set());
  const [uploadedVersion, setUploadedVersion] = useState(0);

  // On mount, load IndexedDB-persisted uploads and surface them in the
  // store. Idempotent: skips ids that are already in the store.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const blobs = await listMediaBlobs();
        if (cancelled) return;
        for (const b of blobs) {
          if (media.some((m) => m.id === b.id)) {
            uploadedIdsRef.current.add(b.id);
            continue;
          }
          const url = URL.createObjectURL(b.blob);
          const asset: MediaAsset = {
            id: b.id,
            type: mediaKindFromMime(b.type) === "video" ? "video" : "image",
            url,
            title: b.fileName.replace(/\.[^.]+$/, ""),
            alt: b.fileName.replace(/\.[^.]+$/, ""),
            fileName: b.fileName,
            createdAt: b.createdAt,
            tags: ["upload"],
          };
          uploadedIdsRef.current.add(b.id);
          upsertMedia(asset);
        }
        setUploadedVersion((v) => v + 1);
        if (takeMemoryUnavailableFlag()) {
          toast.warning("IndexedDB unavailable — upload will not persist after refresh");
        }
      } catch (err) {
        if (!cancelled) {
          toast.error("Failed to load uploaded media from browser storage.");
           
          console.warn(err);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
     
  }, []);

  // Re-resolve the currently-selected asset whenever the store
  // updates (e.g. after a delete or after an edit). Falls back to
  // null when the asset has been removed.
  useEffect(() => {
    if (!selected) return;
    const fresh = media.find((m) => m.id === selected.id) ?? null;
    if (fresh?.title !== selected.title || fresh?.alt !== selected.alt || fresh?.description !== selected.description) {
      setSelected(fresh);
    }
  }, [media, selected]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return media.filter((m) => {
      if (typeFilter !== "all" && classifyAsset(m) !== typeFilter) return false;
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) ||
        (m.fileName ?? "").toLowerCase().includes(q) ||
        m.alt?.toLowerCase().includes(q) ||
        m.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [media, debouncedQuery, typeFilter]);

  function openDetail(m: MediaAsset) {
    setSelected(m);
    setDetailOpen(true);
  }

  async function handleQuickCopyUrl(m: MediaAsset, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await copyToClipboard(m.url);
      toast.success("Reference URL copied to clipboard");
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access");
    }
  }

  async function handleQuickCopyMarkdown(m: MediaAsset, e: React.MouseEvent) {
    e.stopPropagation();
    const md = `![${m.alt || m.title}](${m.url})`;
    try {
      await copyToClipboard(md);
      toast.success("Markdown copied to clipboard");
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access");
    }
  }

  function requestDelete(m: MediaAsset) {
    setDeleteTarget(m);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    deleteMedia(id);
    if (uploadedIdsRef.current.has(id)) {
      try {
        await deleteMediaBlob(id);
      } catch {
        // best-effort
      }
      uploadedIdsRef.current.delete(id);
      setUploadedVersion((v) => v + 1);
    }
    if (selected?.id === id) {
      setSelected(null);
      setDetailOpen(false);
    }
    setDeleteTarget(null);
    toast.success("Media asset deleted");
  }

  // Expose a hook so the danger-zone card can clear IndexedDB. Not
  // strictly required by the brief but makes the "reset only media"
  // path more robust when invoked from elsewhere.
  async function clearAllUploadedBlobs() {
    for (const id of Array.from(uploadedIdsRef.current)) {
      try {
        await deleteMediaBlob(id);
      } catch {
        // ignore
      }
    }
    uploadedIdsRef.current.clear();
    setUploadedVersion((v) => v + 1);
  }
  // Attach to window for cross-component access. Cleaner would be a
  // shared context but this keeps the surface area small.
  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as unknown as { __techstarClearMediaBlobs?: () => Promise<void> }).__techstarClearMediaBlobs =
      clearAllUploadedBlobs;
    return () => {
      delete (window as unknown as { __techstarClearMediaBlobs?: () => Promise<void> }).__techstarClearMediaBlobs;
    };
  }, []);

  void uploadedVersion; // re-render trigger; nothing else to render from it.

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <div
          className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          <ImageIcon className="size-3.5" aria-hidden />
          Phase 4b · Media library
        </div>
        <h1
          className="font-display text-2xl font-semibold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Media
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          All assets used across the site. Uploads persist to browser
          IndexedDB and survive refresh — but they are <strong>not hosted</strong>{" "}
          and may be cleared when you clear browser data.
        </p>
      </div>

      <div
        role="alert"
        className="mb-4 flex items-start gap-2 rounded-md border p-2.5 text-[11px] leading-relaxed"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--surface-2)",
          color: "var(--text-muted)",
        }}
      >
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>
          Browser-local storage — uploads are not hosted and may be
          cleared when you clear browser data. Not suitable for
          production.
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, filename, or alt…"
            className="h-9 pl-8 text-sm"
            aria-label="Search media"
          />
        </div>
        <ToggleGroup
          type="single"
          value={typeFilter}
          onValueChange={(v) => {
            // Radix ToggleGroup fires an empty string when the active
            // item is clicked again — guard so we don't blank the filter.
            if (v) setTypeFilter(v as TypeFilter);
          }}
          aria-label="Filter by type"
          className="h-9"
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="all" className="h-7 px-2.5 text-[11px] uppercase tracking-wide">
            All
          </ToggleGroupItem>
          <ToggleGroupItem value="image" className="h-7 px-2.5 text-[11px] uppercase tracking-wide">
            Image
          </ToggleGroupItem>
          <ToggleGroupItem value="video" className="h-7 px-2.5 text-[11px] uppercase tracking-wide">
            Video
          </ToggleGroupItem>
          <ToggleGroupItem value="embed" className="h-7 px-2.5 text-[11px] uppercase tracking-wide">
            Embed
          </ToggleGroupItem>
        </ToggleGroup>
        <div
          className="inline-flex items-center gap-0.5 rounded-md border p-0.5"
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--surface-1)",
          }}
          role="group"
          aria-label="View mode"
        >
          <ViewToggle
            active={view === "grid"}
            onClick={() => setView("grid")}
            label="Grid view"
          >
            <LayoutGrid className="size-3.5" />
          </ViewToggle>
          <ViewToggle
            active={view === "list"}
            onClick={() => setView("list")}
            label="List view"
          >
            <ListIcon className="size-3.5" />
          </ViewToggle>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="gap-1.5">
          <Upload className="size-4" />
          Upload
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <ImageIcon
              className="mx-auto size-8"
              style={{ color: "var(--text-muted)" }}
              aria-hidden
            />
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              No media matches your filters.
            </p>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m) => (
            <GridTile
              key={m.id}
              media={m}
              onClick={() => openDetail(m)}
              onCopyUrl={(e) => handleQuickCopyUrl(m, e)}
              onDelete={() => requestDelete(m)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Preview</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead className="w-[80px]">Type</TableHead>
                  <TableHead className="w-[100px]">Dimensions</TableHead>
                  <TableHead>Alt text</TableHead>
                  <TableHead className="w-[120px]">Created</TableHead>
                  <TableHead className="w-[40px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <ListRow
                    key={m.id}
                    media={m}
                    onClick={() => openDetail(m)}
                    onCopyUrl={(e) => handleQuickCopyUrl(m, e)}
                    onCopyMarkdown={(e) => handleQuickCopyMarkdown(m, e)}
                    onDelete={() => requestDelete(m)}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <MediaDetailDialog
        open={detailOpen}
        onOpenChange={(o) => {
          setDetailOpen(o);
          if (!o) setSelected(null);
        }}
        media={selected}
        onUpdate={(next) => {
          upsertMedia(next);
          setSelected(next);
        }}
        onDelete={(m) => {
          setDeleteTarget(m);
          setDetailOpen(false);
        }}
      />

      <MediaUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={(asset) => {
          uploadedIdsRef.current.add(asset.id);
          setUploadedVersion((v) => v + 1);
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete media asset?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be removed permanently. Any sections referencing it will show a broken image.`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

// ============================================================
// GRID TILE — hover overlay with quick actions
// ============================================================
function GridTile({
  media,
  onClick,
  onCopyUrl,
  onDelete,
}: {
  media: MediaAsset;
  onClick: () => void;
  onCopyUrl: (e: React.MouseEvent) => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-md border text-left transition-all hover:border-[var(--accent-bright)]"
      style={{
        borderColor: "var(--border-subtle)",
        backgroundColor: "var(--surface-1)",
      }}
    >
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left"
        aria-label={`Open ${media.title}`}
      >
        <div
          className="relative aspect-[4/3] w-full overflow-hidden"
          style={{ backgroundColor: "var(--surface-2)" }}
        >
          <TilePreview media={media} className="h-full w-full" />
        </div>
        <div className="px-2 py-1.5">
          <p
            className="truncate text-xs font-medium"
            style={{ color: "var(--text-primary)" }}
            title={media.fileName ?? media.title}
          >
            {media.fileName ?? media.title}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <TypeBadge type={classifyAsset(media)} />
            {!media.alt?.trim() ? (
              <span
                title="Alt text is empty — screen readers will not convey this image"
                className="inline-flex items-center"
                style={{ color: "var(--warning, #f59e0b)" }}
              >
                <AlertTriangle className="size-3" aria-hidden />
              </span>
            ) : null}
          </div>
        </div>
      </button>

      {/* Hover overlay with quick actions. Also reveals on keyboard
          focus-within so the buttons are reachable without a mouse. */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        style={{ backgroundColor: "color-mix(in srgb, var(--bg-deep, #0a0f1f) 70%, transparent)" }}
        aria-hidden={false}
      >
        <OverlayButton
          label="Edit"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Pencil className="size-3.5" />
        </OverlayButton>
        <OverlayButton label="Copy URL" onClick={onCopyUrl}>
          <Copy className="size-3.5" />
        </OverlayButton>
        <OverlayButton label="Delete" onClick={(e) => { e.stopPropagation(); onDelete(); }} destructive>
          <Trash2 className="size-3.5" />
        </OverlayButton>
      </div>
    </div>
  );
}

function TilePreview({
  media,
  className,
}: {
  media: MediaAsset;
  className?: string;
}) {
  if (media.type === "image") {
    return (
      <img
        src={media.url}
        alt={media.alt}
        className={`${className ?? ""} object-cover transition-transform group-hover:scale-105`}
        loading="lazy"
      />
    );
  }
  if (media.type === "video") {
    return (
      <div
        className={`flex items-center justify-center ${className ?? ""}`}
        style={{ color: "var(--text-muted)" }}
      >
        <VideoIcon className="size-6" aria-hidden />
      </div>
    );
  }
  return (
    <div
      className={`flex items-center justify-center ${className ?? ""}`}
      style={{ color: "var(--text-muted)" }}
    >
      <EmbedIcon className="size-6" aria-hidden />
    </div>
  );
}

function OverlayButton({
  label,
  onClick,
  destructive,
  children,
}: {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="pointer-events-auto flex size-8 items-center justify-center rounded-md border text-white transition-colors hover:bg-white/15"
      style={{
        borderColor: "color-mix(in srgb, white 30%, transparent)",
        color: destructive ? "#fca5a5" : "white",
      }}
    >
      {children}
    </button>
  );
}

function TypeBadge({ type }: { type: TypeFilter }) {
  const label = type === "all" ? "—" : type[0]?.toUpperCase() + type.slice(1);
  return (
    <Badge
      variant="outline"
      className="px-1.5 py-0 text-[9px] uppercase tracking-wide"
      style={{
        color: "var(--text-muted)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {label}
    </Badge>
  );
}

// ============================================================
// LIST ROW — table cells + actions dropdown menu
// ============================================================
function ListRow({
  media,
  onClick,
  onCopyUrl,
  onCopyMarkdown,
  onDelete,
}: {
  media: MediaAsset;
  onClick: () => void;
  onCopyUrl: (e: React.MouseEvent) => void;
  onCopyMarkdown: (e: React.MouseEvent) => void;
  onDelete: () => void;
}) {
  const altEmpty = !media.alt?.trim();
  return (
    <TableRow
      onClick={onClick}
      className="cursor-pointer"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <TableCell>
        <div
          className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border"
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--surface-2)",
          }}
        >
          <TilePreview media={media} className="h-full w-full" />
        </div>
      </TableCell>
      <TableCell className="max-w-[200px]">
        <p
          className="truncate text-xs font-medium"
          style={{ color: "var(--text-primary)" }}
          title={media.fileName ?? media.title}
        >
          {media.fileName ?? media.title}
        </p>
        {media.description ? (
          <p
            className="truncate text-[10px]"
            style={{ color: "var(--text-muted)" }}
          >
            {media.description}
          </p>
        ) : null}
      </TableCell>
      <TableCell>
        <TypeBadge type={classifyAsset(media)} />
      </TableCell>
      <TableCell className="text-[11px] font-mono" style={{ color: "var(--text-secondary)" }}>
        {media.width && media.height ? `${media.width} × ${media.height}` : "—"}
      </TableCell>
      <TableCell className="max-w-[220px]">
        {altEmpty ? (
          <span
            className="inline-flex items-center gap-1 text-[11px]"
            style={{ color: "var(--warning, #f59e0b)" }}
            title="Alt text is empty"
          >
            <AlertTriangle className="size-3" aria-hidden />
            <span className="italic" style={{ color: "var(--text-muted)" }}>
              empty
            </span>
          </span>
        ) : (
          <p
            className="truncate text-[11px]"
            style={{ color: "var(--text-secondary)" }}
            title={media.alt}
          >
            {media.alt}
          </p>
        )}
      </TableCell>
      <TableCell className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        {formatDate(media.createdAt, "short")}
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Open actions"
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={onClick} className="gap-2 text-xs">
              <Pencil className="size-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => onCopyUrl(e as unknown as React.MouseEvent)} className="gap-2 text-xs">
              <Copy className="size-3.5" />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => onCopyMarkdown(e as unknown as React.MouseEvent)} className="gap-2 text-xs">
              <FileText className="size-3.5" />
              Copy markdown
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open(media.url, "_blank", "noopener,noreferrer")}
              className="gap-2 text-xs"
            >
              <ExternalLink className="size-3.5" />
              Open in new tab
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="gap-2 text-xs text-[var(--danger,#ef4444)] focus:text-[var(--danger,#ef4444)]"
            >
              <Trash2 className="size-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// ============================================================
// VIEW TOGGLE BUTTON
// ============================================================
function ViewToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className="flex size-7 items-center justify-center rounded transition-colors"
      style={{
        backgroundColor: active ? "var(--surface-2)" : "transparent",
        color: active ? "var(--text-primary)" : "var(--text-muted)",
      }}
    >
      {children}
    </button>
  );
}

// Re-export so callers can compose.
export { copyToClipboard };
// Re-export StoredMediaBlob type so the store-side wrappers can keep
// using the same shape.
export type { StoredMediaBlob };
// Re-export IndexedDB helpers + error classes so other components can
// instanceof-check or call them without reaching into @/lib/indexeddb.
export {
  MediaQuotaError,
  IndexedDBUnavailableError,
  putMediaBlob,
  listMediaBlobs,
};
