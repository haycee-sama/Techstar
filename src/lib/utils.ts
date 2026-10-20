import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// FORMATTERS
// ============================================================

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(input: string | Date, fmt: "short" | "long" | "iso" = "long"): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (isNaN(d.getTime())) return "";
  if (fmt === "iso") return d.toISOString();
  if (fmt === "short") {
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function readingTime(html: string): number {
  // Strip HTML tags, count words, divide by 220 wpm
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 220));
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error("Clipboard API unavailable"));
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ============================================================
// HTML SANITIZATION (lightweight, demo-grade)
// Strips <script>, on* attributes, javascript: URLs.
// Content is from seed/localStorage only — clearly demo.
// ============================================================
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  // Strip <script>...</script> blocks (case-insensitive, multiline)
  let out = html.replace(/<script\b[^<]*(?:>|<\/script>)/gi, "");
  // Strip <iframe>, <object>, <embed>, <style> blocks
  out = out.replace(/<(iframe|object|embed|style)\b[^<]*(?:>|<\/\1>)/gi, "");
  // Strip event handler attributes (on*)
  out = out.replace(/\son\w+="[^"]*"/gi, "");
  out = out.replace(/\son\w+='[^']*'/gi, "");
  out = out.replace(/\son\w+=[^\s>]+/gi, "");
  // Strip javascript: URLs in href/src
  out = out.replace(/(href|src)\s*=\s*["']?\s*javascript:[^"']*/gi, "$1=\"#\"");
  return out;
}

// ============================================================
// Color helper for tinted backgrounds from a hex color
// ============================================================
export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================
// Compact id generator (for client-only ids)
// ============================================================
export function makeId(prefix: string = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Human-readable file-size formatter (1024-based). Used by the
 * upload dialog and media library to surface blob sizes.
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  const value = bytes / Math.pow(1024, i);
  const digits = i === 0 ? 0 : value < 10 ? 1 : 0;
  return `${value.toFixed(digits)} ${units[i]}`;
}
