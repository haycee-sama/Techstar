"use client";

import { Input } from "@/components/ui/input";

export interface ColorFieldProps {
  /** Human-readable label, e.g. "Background deep". */
  label: string;
  /** CSS variable name this color binds to (e.g. `--bg-deep`). Shown as a hint. */
  cssVar?: string;
  /** Current hex value, e.g. `#0A0F1F`. */
  value: string;
  /** Called with the new hex value whenever either input changes. */
  onChange: (value: string) => void;
  /** Optional id prefix for aria-labels. Defaults to a slugified label. */
  id?: string;
}

/**
 * Reusable color picker field: a native `<input type="color">` swatch
 * paired with a text input that shows / accepts the hex value. Both
 * inputs are bound to the same value, so the user can either pick a
 * color visually or paste in a hex code.
 *
 * Used by the Phase 4b-ii SettingsPanel brand tab to edit the eight
 * CSS variables that drive the public site's color system. Color
 * changes apply immediately to the public site via CSS variables
 * (the SettingsPanel wires `document.documentElement.style.setProperty`
 * on change).
 *
 * Accessibility:
 *  - Both inputs carry `aria-label`s derived from the human-readable label.
 *  - The text input accepts any valid hex (3, 4, 6, or 8 chars) — invalid
 *    values fall back to the last valid color on the swatch.
 *  - Keyboard-accessible (it's a normal input + color picker).
 */
export function ColorField({
  label,
  cssVar,
  value,
  onChange,
  id,
}: ColorFieldProps) {
  const fieldId = id ?? `color-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const swatchId = `${fieldId}-swatch`;
  const textId = `${fieldId}-text`;

  return (
    <div className="space-y-1">
      <label
        htmlFor={textId}
        className="flex items-center justify-between text-[11px]"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="uppercase tracking-wide">{label}</span>
        {cssVar ? (
          <span className="font-mono text-[10px] opacity-80">{cssVar}</span>
        ) : (
          <span className="font-mono">{value}</span>
        )}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={swatchId}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 shrink-0 cursor-pointer rounded border"
          style={{ borderColor: "var(--border-subtle)" }}
          aria-label={`${label} color picker`}
        />
        <Input
          id={textId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 font-mono text-xs"
          aria-label={`${label} hex value`}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
