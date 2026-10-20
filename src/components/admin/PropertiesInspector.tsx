"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { getSectionLibraryItem } from "@/lib/section-library";
import type { Section, SectionSettings } from "@/lib/types";
import { MediaPickerDialog } from "./MediaPickerDialog";
import type { MediaAsset } from "@/lib/types";

interface PropertiesInspectorProps {
  section: Section | null;
  onChange: (next: Section) => void;
  onMove: (direction: "up" | "down") => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onDelete: () => void;
  index: number;
  total: number;
}

const SPACING_OPTIONS: { value: SectionSettings["spacing"]; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "normal", label: "Normal" },
  { value: "spacious", label: "Spacious" },
  { value: "relaxed", label: "Relaxed" },
];

const WIDTH_OPTIONS: { value: SectionSettings["width"]; label: string }[] = [
  { value: "narrow", label: "Narrow" },
  { value: "default", label: "Default" },
  { value: "normal", label: "Normal" },
  { value: "wide", label: "Wide" },
  { value: "full", label: "Full" },
];

const ALIGN_OPTIONS: { value: SectionSettings["alignment"]; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const THEME_OPTIONS: { value: SectionSettings["themeVariant"]; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "inverted", label: "Inverted" },
  { value: "muted", label: "Muted" },
];

/**
 * Right rail of the visual builder — properties inspector for the
 * currently-selected section. Edits the section's `data` object, its
 * `variant`, and its `settings` (spacing / alignment / width /
 * themeVariant / visibility).
 *
 * The inspector is data-driven: it inspects the section's `data` keys
 * and renders an appropriate input for each common field. Unknown
 * fields fall back to a JSON text editor so the user can still tweak
 * them by hand.
 */
export function PropertiesInspector({
  section,
  onChange,
  onMove,
  canMoveUp,
  canMoveDown,
  onDelete,
  index,
  total,
}: PropertiesInspectorProps) {
  if (!section) {
    return (
      <aside
        className="flex h-full flex-col border-l"
        style={{
          backgroundColor: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div
          className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center"
          style={{ color: "var(--text-muted)" }}
        >
          <div className="eyebrow">Inspector</div>
          <p className="text-xs">Select a section to edit its properties.</p>
        </div>
      </aside>
    );
  }

  const lib = getSectionLibraryItem(section.type);

  function updateData(next: Record<string, unknown>) {
    onChange({ ...section, data: { ...section.data, ...next } });
  }

  function updateSettings(next: Partial<SectionSettings>) {
    onChange({ ...section, settings: { ...section.settings, ...next } });
  }

  return (
    <aside
      className="flex h-full flex-col border-l"
      style={{
        backgroundColor: "var(--surface-1)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <header
        className="border-b px-3 py-2.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Inspector
            </h3>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Section {index + 1} of {total}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-[var(--danger,#ef4444)] hover:text-[var(--danger,#ef4444)]"
            onClick={onDelete}
          >
            <Trash2 className="size-3" />
            Delete
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Type
            </Label>
            <div
              className="rounded-md border px-3 py-2 text-sm font-medium"
              style={{
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
                backgroundColor: "var(--surface-2)",
              }}
            >
              {lib?.name ?? section.type}
              <span className="ml-2 text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {section.type}
              </span>
            </div>
          </div>

          {lib && lib.variants.length > 1 ? (
            <Field label="Variant">
              <Select
                value={section.variant ?? lib.variants[0]}
                onValueChange={(v) => onChange({ ...section, variant: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lib.variants.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => onMove("up")}
              disabled={!canMoveUp}
            >
              <ArrowUp className="size-3" />
              Up
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => onMove("down")}
              disabled={!canMoveDown}
            >
              <ArrowDown className="size-3" />
              Down
            </Button>
          </div>

          <div className="my-3 h-px" style={{ backgroundColor: "var(--border-subtle)" }} aria-hidden />

          <DataFields
            section={section}
            data={section.data}
            onChange={updateData}
          />

          <div className="my-3 h-px" style={{ backgroundColor: "var(--border-subtle)" }} aria-hidden />

          <Field label="Layout: spacing">
            <Select
              value={section.settings.spacing ?? "normal"}
              onValueChange={(v) => updateSettings({ spacing: v as SectionSettings["spacing"] })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPACING_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value as string}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Width">
              <Select
                value={section.settings.width ?? "default"}
                onValueChange={(v) => updateSettings({ width: v as SectionSettings["width"] })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WIDTH_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value as string}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Alignment">
              <Select
                value={section.settings.alignment ?? "left"}
                onValueChange={(v) => updateSettings({ alignment: v as SectionSettings["alignment"] })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALIGN_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value as string}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Theme variant">
            <Select
              value={section.settings.themeVariant ?? "default"}
              onValueChange={(v) => updateSettings({ themeVariant: v as SectionSettings["themeVariant"] })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEME_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value as string}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <label
            className="flex cursor-pointer items-center gap-2 rounded-md border p-2"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <Checkbox
              checked={section.visible !== false}
              onCheckedChange={(c) => onChange({ ...section, visible: c === true })}
            />
            <span className="text-xs" style={{ color: "var(--text-primary)" }}>
              Visible on page
            </span>
          </label>
        </div>
      </ScrollArea>
    </aside>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        {label}
      </Label>
      {children}
    </div>
  );
}

/**
 * Data-driven field list. Renders appropriate inputs for the common
 * field names used across section library defaults. Falls back to a
 * generic JSON textarea for unknown shapes.
 */
function DataFields({
  section,
  data,
  onChange,
}: {
  section: Section;
  data: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  const keys = Object.keys(data);
  if (keys.length === 0) {
    return (
      <div
        className="rounded-md border border-dashed p-3 text-center text-[11px]"
        style={{
          borderColor: "var(--border-subtle)",
          color: "var(--text-muted)",
        }}
      >
        This section type has no editable fields — it pulls its content
        from the shared content store (services, testimonials, etc.).
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {keys.map((key) => (
        <FieldEditor
          key={key}
          section={section}
          fieldKey={key}
          value={data[key]}
          onChange={(v) => onChange({ ...data, [key]: v })}
        />
      ))}
    </div>
  );
}

function FieldEditor({
  section,
  fieldKey,
  value,
  onChange,
}: {
  section: Section;
  fieldKey: string;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  // Determine field kind from name + value shape
  const isImageKey =
    /^(image|beforeImage|afterImage|posterImage|coverImage|featuredImage)$/i.test(fieldKey) ||
    (typeof value === "string" && /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(value) && !/^(http)/i.test(value) === false);
  const isUrlKey = /^(videoUrl|embedUrl|ctaHref|primaryCtaHref|secondaryCtaHref)$/i.test(fieldKey);
  const isBodyKey = /^(body|description)$/i.test(fieldKey);
  const isHtmlKey = fieldKey === "html";
  const isItemsKey = /^(items|stats|images)$/i.test(fieldKey);
  const isCtaLabel = /^(ctaLabel|primaryCtaLabel|secondaryCtaLabel|submitLabel)$/i.test(fieldKey);

  if (isHtmlKey) {
    return (
      <Field label="HTML (sanitized on render)">
        <Textarea
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="font-mono text-[11px]"
          spellCheck={false}
          aria-label="HTML"
        />
      </Field>
    );
  }

  if (isImageKey) {
    return <ImageField label={prettyLabel(fieldKey)} value={value} onChange={onChange} />;
  }

  if (isItemsKey) {
    return (
      <ArrayField
        section={section}
        fieldKey={fieldKey}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (isUrlKey) {
    return (
      <Field label={prettyLabel(fieldKey)}>
        <Input
          type="url"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs"
          placeholder="https://…"
          aria-label={prettyLabel(fieldKey)}
        />
      </Field>
    );
  }

  if (isBodyKey) {
    return (
      <Field label={prettyLabel(fieldKey)}>
        <Textarea
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="text-xs"
          aria-label={prettyLabel(fieldKey)}
        />
      </Field>
    );
  }

  if (isCtaLabel || typeof value === "string") {
    return (
      <Field label={prettyLabel(fieldKey)}>
        <Input
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs"
          aria-label={prettyLabel(fieldKey)}
        />
      </Field>
    );
  }

  // Fallback — show raw JSON in a textarea
  return (
    <Field label={`${prettyLabel(fieldKey)} (raw JSON)`}>
      <Textarea
        value={safeStringify(value)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {
            // ignore — user is mid-edit
          }
        }}
        rows={3}
        className="font-mono text-[11px]"
        spellCheck={false}
        aria-label={prettyLabel(fieldKey)}
      />
    </Field>
  );
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const url = typeof value === "string" ? value : "";

  function handleSelect(m: MediaAsset | null) {
    onChange(m?.url ?? "");
  }

  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <div
          className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)" }}
        >
          {url ? (
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="size-3.5" style={{ color: "var(--text-muted)" }} aria-hidden />
          )}
        </div>
        <Input
          value={url}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs"
          placeholder="https://… or pick from library"
          aria-label={label}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 shrink-0"
          onClick={() => setPickerOpen(true)}
        >
          Pick
        </Button>
      </div>
      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        value={url}
        onSelect={handleSelect}
        confirmLabel="Use"
      />
    </Field>
  );
}

function ArrayField({
  section,
  fieldKey,
  value,
  onChange,
}: {
  section: Section;
  fieldKey: string;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  // Determine the item schema for common array fields
  const itemSchema = useMemo(() => {
    if (fieldKey === "stats") {
      return { value: "string", label: "string", illustrative: "boolean" };
    }
    if (fieldKey === "images") {
      return { url: "string", alt: "string" };
    }
    if (fieldKey === "items") {
      // timeline vs accordion — both have label/title + body/description
      return section.type === "accordion"
        ? { title: "string", body: "string" }
        : { label: "string", description: "string" };
    }
    return null;
  }, [fieldKey, section.type]);

  const arr = Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];

  if (!itemSchema) {
    // Unknown array — fall back to raw JSON
    return (
      <Field label={`${prettyLabel(fieldKey)} (raw JSON)`}>
        <Textarea
          value={safeStringify(value)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              // ignore
            }
          }}
          rows={4}
          className="font-mono text-[11px]"
          spellCheck={false}
          aria-label={prettyLabel(fieldKey)}
        />
      </Field>
    );
  }

  const fields = Object.keys(itemSchema);

  function updateItem(i: number, nextItem: Record<string, unknown>) {
    const copy = arr.slice();
    copy[i] = nextItem;
    onChange(copy);
  }

  function addItem() {
    const blank: Record<string, unknown> = {};
    for (const f of fields) {
      blank[f] = "";
    }
    onChange([...arr, blank]);
  }

  function removeItem(i: number) {
    onChange(arr.filter((_, idx) => idx !== i));
  }

  return (
    <Field label={`${prettyLabel(fieldKey)} (${arr.length})`}>
      <div className="space-y-2">
        {arr.map((item, i) => (
          <div
            key={i}
            className="rounded-md border p-2"
            style={{
              borderColor: "var(--border-subtle)",
              backgroundColor: "var(--surface-2)",
            }}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                #{i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--danger,#ef4444)]"
                aria-label={`Remove item ${i + 1}`}
              >
                <X className="size-3" />
              </button>
            </div>
            <div className="space-y-1.5">
              {fields.map((f) => (
                <div key={f} className="flex items-center gap-1.5">
                  <span className="w-20 shrink-0 text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    {f}
                  </span>
                  {itemSchema[f] === "boolean" ? (
                    <Checkbox
                      checked={item[f] === true}
                      onCheckedChange={(c) => updateItem(i, { ...item, [f]: c === true })}
                    />
                  ) : f === "body" || f === "description" ? (
                    <Textarea
                      value={typeof item[f] === "string" ? (item[f] as string) : ""}
                      onChange={(e) => updateItem(i, { ...item, [f]: e.target.value })}
                      rows={2}
                      className="flex-1 text-[11px]"
                    />
                  ) : (
                    <Input
                      value={typeof item[f] === "string" ? (item[f] as string) : ""}
                      onChange={(e) => updateItem(i, { ...item, [f]: e.target.value })}
                      className="h-7 flex-1 text-[11px]"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 w-full gap-1 text-[11px]"
          onClick={addItem}
        >
          <Plus className="size-3" />
          Add item
        </Button>
      </div>
    </Field>
  );
}

function prettyLabel(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return "";
  }
}
