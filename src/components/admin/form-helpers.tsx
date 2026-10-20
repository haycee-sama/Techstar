"use client";

import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-react";

// ============================================================
// Array editor — list of strings (e.g. capabilities, tags)
// ============================================================
interface StringArrayEditorProps {
  label: string;
  description?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  /** Field id for the add input. */
  inputId?: string;
}

export function StringArrayEditor({
  label,
  description,
  values,
  onChange,
  placeholder = "Add item and press Enter",
  inputId,
}: StringArrayEditorProps) {
  function add(value: string) {
    const v = value.trim();
    if (!v) return;
    if (values.includes(v)) return;
    onChange([...values, v]);
  }
  function removeAt(idx: number) {
    onChange(values.filter((_, i) => i !== idx));
  }
  function updateAt(idx: number, value: string) {
    onChange(values.map((v, i) => (i === idx ? value : v)));
  }
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs">{label}</Label>
        {description ? (
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {description}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {values.length === 0 ? (
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            No items yet.
          </span>
        ) : (
          values.map((v, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
              style={{
                borderColor: "var(--border-subtle)",
                backgroundColor: "var(--surface-2)",
                color: "var(--text-primary)",
              }}
            >
              <input
                aria-label={`${label} item ${i + 1}`}
                value={v}
                onChange={(e) => updateAt(i, e.target.value)}
                className="bg-transparent outline-none"
                style={{ color: "var(--text-primary)" }}
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${label.toLowerCase()} item ${i + 1}`}
                className="rounded-full p-0.5 hover:bg-[var(--surface-3)]"
              >
                <X className="size-3" />
              </button>
            </span>
          ))
        )}
      </div>
      <AddItemInput onAdd={add} placeholder={placeholder} id={inputId} />
    </div>
  );
}

// ============================================================
// Object array editor — generic list of objects with a render-prop
// for each row. Used for benefits, useCases, outcomes, faqs, etc.
// ============================================================
export interface ObjectArrayEditorProps<T> {
  label: string;
  description?: string;
  values: T[];
  onChange: (next: T[]) => void;
  /** Renders a single row's editor. Receives the value and an updater. */
  renderRow: (
    value: T,
    update: (patch: Partial<T>) => void
  ) => ReactNode;
  /** Title shown on each row card. */
  getRowTitle?: (value: T, idx: number) => string;
  /** Factory for a new empty row. */
  makeNew: () => T;
  newLabel?: string;
  /** Max rows allowed. */
  max?: number;
}

export function ObjectArrayEditor<T>({
  label,
  description,
  values,
  onChange,
  renderRow,
  getRowTitle,
  makeNew,
  newLabel = "Add row",
  max,
}: ObjectArrayEditorProps<T>) {
  function add() {
    if (max && values.length >= max) return;
    onChange([...values, makeNew()]);
  }
  function removeAt(idx: number) {
    onChange(values.filter((_, i) => i !== idx));
  }
  function updateAt(idx: number, patch: Partial<T>) {
    onChange(values.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  }
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs">{label}</Label>
        {description ? (
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {description}
          </span>
        ) : null}
      </div>
      <div className="space-y-2">
        {values.length === 0 ? (
          <p className="text-[11px] italic" style={{ color: "var(--text-muted)" }}>
            No entries yet.
          </p>
        ) : (
          values.map((v, i) => (
            <Card
              key={i}
              className="border-dashed"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <CardHeader className="py-2">
                <CardTitle
                  className="text-[11px] uppercase tracking-wide"
                  style={{ color: "var(--text-muted)" }}
                >
                  {getRowTitle ? getRowTitle(v, i) : `Item ${i + 1}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 py-3">
                {renderRow(v, (patch) => updateAt(i, patch))}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[var(--danger)]"
                    onClick={() => removeAt(i)}
                  >
                    <Trash2 className="size-3" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={add}
        disabled={!!max && values.length >= max}
      >
        <Plus className="size-3.5" />
        {newLabel}
      </Button>
    </div>
  );
}

// ============================================================
// Multi-select chips — pick from a list of options (e.g.
// relatedServiceSlugs).
// ============================================================
export interface MultiSelectChipsProps {
  label: string;
  description?: string;
  values: string[];
  options: { value: string; label: string }[];
  onChange: (next: string[]) => void;
  emptyText?: string;
}

export function MultiSelectChips({
  label,
  description,
  values,
  options,
  onChange,
  emptyText = "No options available.",
}: MultiSelectChipsProps) {
  function toggle(v: string) {
    if (values.includes(v)) {
      onChange(values.filter((x) => x !== v));
    } else {
      onChange([...values, v]);
    }
  }
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs">{label}</Label>
        {description ? (
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {description}
          </span>
        ) : null}
      </div>
      {options.length === 0 ? (
        <p className="text-[11px] italic" style={{ color: "var(--text-muted)" }}>
          {emptyText}
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {options.map((opt) => {
            const selected = values.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                aria-pressed={selected}
                className="rounded-full border px-2.5 py-0.5 text-[11px] transition-colors"
                style={{
                  borderColor: selected
                    ? "var(--accent-bright)"
                    : "var(--border-subtle)",
                  backgroundColor: selected
                    ? "var(--accent-bright)"
                    : "transparent",
                  color: selected
                    ? "var(--primary-foreground)"
                    : "var(--text-secondary)",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// LabeledInput — convenience Input + Label combo
// ============================================================
export function LabeledInput({
  label,
  hint,
  inputId,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={inputId} className="text-xs">
          {label}
        </Label>
        {hint ? (
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {hint}
          </span>
        ) : null}
      </div>
      <Input id={inputId} {...props} />
    </div>
  );
}

export function LabeledTextarea({
  label,
  hint,
  textareaId,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  textareaId?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={textareaId} className="text-xs">
          {label}
        </Label>
        {hint ? (
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {hint}
          </span>
        ) : null}
      </div>
      <Textarea id={textareaId} {...props} />
    </div>
  );
}

// ============================================================
// Add-item input (Enter or comma to add)
// ============================================================
function AddItemInput({
  onAdd,
  placeholder,
  id,
}: {
  onAdd: (value: string) => void;
  placeholder?: string;
  id?: string;
}) {
  return (
    <Input
      id={id}
      placeholder={placeholder}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === ",") {
          e.preventDefault();
          const target = e.target as HTMLInputElement;
          onAdd(target.value);
          target.value = "";
        }
      }}
      className="h-8 text-xs"
    />
  );
}
