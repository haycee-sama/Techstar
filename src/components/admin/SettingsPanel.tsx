"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  Phone,
  Link2,
  Search,
  PanelTop,
  Megaphone,
  Cookie,
  LayoutTemplate,
  Settings,
  RefreshCw,
  Database,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Link } from "@/lib/router";
import {
  useContentStore,
  useBrand,
  useGlobalSettings,
} from "@/lib/content-store";
import type {
  BrandSettings,
  GlobalSettings,
  MediaAsset,
  SocialLink,
} from "@/lib/types";
import { makeId } from "@/lib/utils";
import { DangerZoneCard } from "./DangerZoneCard";
import { ImportExportCard } from "./ImportExportCard";
import { ColorField } from "./ColorField";
import { MediaPickerDialog } from "./MediaPickerDialog";

const ADMIN_APPEARANCE_KEY = "techstar:admin:preferences";
const ADMIN_THEME_KEY = "techstar:admin:theme";

interface AdminAppearanceState {
  theme: "light" | "dark" | "system";
  sidebarDefaultCollapsed: boolean;
  denseTables: boolean;
}

const DEFAULT_APPEARANCE: AdminAppearanceState = {
  theme: "light",
  sidebarDefaultCollapsed: false,
  denseTables: false,
};

const TYPOGRAPHY_PRESETS = [
  { value: "Inter+Space Grotesk", label: "Inter + Space Grotesk" },
  { value: "Inter+JetBrains Mono", label: "Inter + JetBrains Mono" },
  { value: "system-ui+system-ui", label: "System Sans" },
];

const ROBOTS_PRESETS = [
  { value: "index, follow", label: "index, follow" },
  { value: "noindex, follow", label: "noindex, follow" },
  { value: "index, nofollow", label: "index, nofollow" },
  { value: "noindex, nofollow", label: "noindex, nofollow" },
];

/**
 * Day-of-week options for the contact-hours editor. Includes both
 * single-day entries and the two most common ranges the seed data
 * uses (`Mon – Fri`, `Sat – Sun`). The `Custom` option lets authors
 * type free-form values like "Public holidays" when none of the
 * presets fit.
 */
const DOW_PRESETS = [
  "Mon – Fri",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
  "Sat – Sun",
  "Daily",
  "Custom",
];

/**
 * Social platforms shown in the inline social link editor. The
 * underlying `SocialLink.platform` union is wider (also includes
 * `rss`); these are the platforms the brief calls for plus a
 * sensible default for new rows. The dedicated Social admin table
 * at `#/admin/social` is the full CRUD surface for power users.
 */
const SOCIAL_PLATFORMS: { value: SocialLink["platform"]; label: string }[] = [
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "github", label: "GitHub" },
];

/**
 * Phase 4 — Global settings panel. 11 tabs cover brand, contact,
 * social, SEO, header/footer variants, CTAs, cookie, default page
 * layouts, admin appearance, demo content reset, and data export /
 * import. Every save shows a sonner toast; every destructive action
 * shows a ConfirmDialog.
 */
export function SettingsPanel() {
  const [tab, setTab] = useState("brand");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <div
          className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          <Settings className="size-3.5" aria-hidden />
          Phase 4 · Global settings
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Configure brand, contact info, SEO, layout variants, and the
          admin appearance. All saves are local — refresh-safe.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList
          className="flex h-auto w-full flex-wrap justify-start gap-1"
          style={{ height: "auto" }}
        >
          <TabsTrigger value="brand" className="gap-1.5"><Palette className="size-3.5" />Brand</TabsTrigger>
          <TabsTrigger value="contact" className="gap-1.5"><Phone className="size-3.5" />Contact</TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5"><Link2 className="size-3.5" />Social</TabsTrigger>
          <TabsTrigger value="seo" className="gap-1.5"><Search className="size-3.5" />SEO</TabsTrigger>
          <TabsTrigger value="layout" className="gap-1.5"><PanelTop className="size-3.5" />Header/Footer</TabsTrigger>
          <TabsTrigger value="ctas" className="gap-1.5"><Megaphone className="size-3.5" />CTAs</TabsTrigger>
          <TabsTrigger value="cookie" className="gap-1.5"><Cookie className="size-3.5" />Cookie</TabsTrigger>
          <TabsTrigger value="pages" className="gap-1.5"><LayoutTemplate className="size-3.5" />Default layouts</TabsTrigger>
          <TabsTrigger value="admin" className="gap-1.5"><Settings className="size-3.5" />Admin</TabsTrigger>
          <TabsTrigger value="reset" className="gap-1.5"><RefreshCw className="size-3.5" />Reset</TabsTrigger>
          <TabsTrigger value="data" className="gap-1.5"><Database className="size-3.5" />Export/Import</TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="mt-4">
          <BrandTab />
        </TabsContent>
        <TabsContent value="contact" className="mt-4">
          <ContactTab />
        </TabsContent>
        <TabsContent value="social" className="mt-4">
          <SocialTab />
        </TabsContent>
        <TabsContent value="seo" className="mt-4">
          <SeoTab />
        </TabsContent>
        <TabsContent value="layout" className="mt-4">
          <LayoutTab />
        </TabsContent>
        <TabsContent value="ctas" className="mt-4">
          <CtasTab />
        </TabsContent>
        <TabsContent value="cookie" className="mt-4">
          <CookieTab />
        </TabsContent>
        <TabsContent value="pages" className="mt-4">
          <DefaultLayoutsTab />
        </TabsContent>
        <TabsContent value="admin" className="mt-4">
          <AdminAppearanceTab />
        </TabsContent>
        <TabsContent value="reset" className="mt-4">
          <DangerZoneCard />
        </TabsContent>
        <TabsContent value="data" className="mt-4">
          <ImportExportCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// BRAND TAB
// ============================================================
function BrandTab() {
  const brand = useBrand();
  const { updateBrand } = useContentStore();
  const [draft, setDraft] = useState<BrandSettings>(brand);

  useEffect(() => setDraft(brand), [brand]);

  // Apply CSS variables live as the user edits colors (preview only).
  // The public site picks the values up on save through the content
  // store, since `useBrand()` re-renders on state change.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (draft.colors.accent) root.style.setProperty("--accent", draft.colors.accent);
    if (draft.colors.accentCyan) root.style.setProperty("--accent-cyan", draft.colors.accentCyan);
    if (draft.colors.accentBright ?? draft.colors.accent) root.style.setProperty("--accent-bright", draft.colors.accentBright ?? draft.colors.accent);
    if (draft.colors.bgDeep) root.style.setProperty("--bg-deep", draft.colors.bgDeep);
    if (draft.colors.bgNavy) root.style.setProperty("--bg-navy", draft.colors.bgNavy);
    if (draft.colors.textPrimary) root.style.setProperty("--text-primary", draft.colors.textPrimary);
    if (draft.colors.textSecondary) root.style.setProperty("--text-secondary", draft.colors.textSecondary);
    if (draft.colors.textMuted) root.style.setProperty("--text-muted", draft.colors.textMuted);
  }, [draft.colors]);

  function save() {
    updateBrand(draft);
    toast.success("Brand settings saved.");
  }

  function setTypography(preset: string) {
    const [display, body] = preset.split("+");
    setDraft({ ...draft, typography: { display, body } });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Brand</CardTitle>
        <CardDescription>
          Company name, tagline, logo treatment, brand colors, and
          typography. Color changes apply live to this admin screen
          and to the public site on next visit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="brand-name" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Company name
            </Label>
            <Input
              id="brand-name"
              value={draft.companyName}
              onChange={(e) => setDraft({ ...draft, companyName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brand-tagline" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Tagline
            </Label>
            <Input
              id="brand-tagline"
              value={draft.tagline}
              onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="brand-desc" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Short description
          </Label>
          <Textarea
            id="brand-desc"
            value={draft.shortDescription}
            onChange={(e) => setDraft({ ...draft, shortDescription: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Logo variant
          </Label>
          <Select
            value={draft.logoVariant === "default" ? "full" : draft.logoVariant}
            onValueChange={(v) => setDraft({ ...draft, logoVariant: v as BrandSettings["logoVariant"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full (mark + wordmark)</SelectItem>
              <SelectItem value="mark-only">Mark only</SelectItem>
              <SelectItem value="wordmark-only">Wordmark only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <Label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Brand colors
            </Label>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Color changes apply immediately to the public site via CSS variables.
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ColorField
              label="Background deep"
              cssVar="--bg-deep"
              value={draft.colors.bgDeep ?? "#0A0F1F"}
              onChange={(v) => setDraft({ ...draft, colors: { ...draft.colors, bgDeep: v } })}
            />
            <ColorField
              label="Background navy"
              cssVar="--bg-navy"
              value={draft.colors.bgNavy ?? "#141923"}
              onChange={(v) => setDraft({ ...draft, colors: { ...draft.colors, bgNavy: v } })}
            />
            <ColorField
              label="Accent"
              cssVar="--accent"
              value={draft.colors.accent}
              onChange={(v) => setDraft({ ...draft, colors: { ...draft.colors, accent: v } })}
            />
            <ColorField
              label="Accent bright"
              cssVar="--accent-bright"
              value={draft.colors.accentBright ?? draft.colors.accent}
              onChange={(v) => setDraft({ ...draft, colors: { ...draft.colors, accentBright: v } })}
            />
            <ColorField
              label="Accent cyan"
              cssVar="--accent-cyan"
              value={draft.colors.accentCyan}
              onChange={(v) => setDraft({ ...draft, colors: { ...draft.colors, accentCyan: v } })}
            />
            <ColorField
              label="Text primary"
              cssVar="--text-primary"
              value={draft.colors.textPrimary ?? "#F4F5F7"}
              onChange={(v) => setDraft({ ...draft, colors: { ...draft.colors, textPrimary: v } })}
            />
            <ColorField
              label="Text secondary"
              cssVar="--text-secondary"
              value={draft.colors.textSecondary ?? "#A1A6B0"}
              onChange={(v) => setDraft({ ...draft, colors: { ...draft.colors, textSecondary: v } })}
            />
            <ColorField
              label="Text muted"
              cssVar="--text-muted"
              value={draft.colors.textMuted ?? "#6B7280"}
              onChange={(v) => setDraft({ ...draft, colors: { ...draft.colors, textMuted: v } })}
            />
          </div>
          <BrandColorPreview colors={draft.colors} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Typography
          </Label>
          <Select
            value={`${draft.typography.display}+${draft.typography.body}`}
            onValueChange={setTypography}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPOGRAPHY_PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SaveButton onClick={save} />
      </CardContent>
    </Card>
  );
}

function BrandColorPreview({
  colors,
}: {
  colors: BrandSettings["colors"];
}) {
  const bg = colors.bgNavy ?? "#141923";
  const deep = colors.bgDeep ?? "#0A0F1F";
  const accent = colors.accent ?? "#3B82F6";
  const accentBright = colors.accentBright ?? accent;
  const accentCyan = colors.accentCyan ?? "#22D3EE";
  const textPrimary = colors.textPrimary ?? "#F4F5F7";
  const textSecondary = colors.textSecondary ?? "#A1A6B0";
  const textMuted = colors.textMuted ?? "#6B7280";
  return (
    <div
      className="overflow-hidden rounded-md border"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div
        className="px-3 py-3"
        style={{
          background: `linear-gradient(135deg, ${deep} 0%, ${bg} 60%)`,
          color: textPrimary,
        }}
      >
        <p
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ color: accentCyan }}
        >
          Live preview
        </p>
        <h3
          className="mt-1 font-display text-base font-semibold tracking-tight"
          style={{ color: textPrimary }}
        >
          Techstar brand colors
        </h3>
        <p className="mt-0.5 text-[11px]" style={{ color: textSecondary }}>
          A short editorial sentence in the secondary text color.
        </p>
        <p className="mt-1 text-[10px]" style={{ color: textMuted }}>
          Muted caption text for fine print.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className="inline-flex h-6 items-center rounded px-2 text-[10px] font-medium"
            style={{ backgroundColor: accent, color: "#FFFFFF" }}
          >
            Primary button
          </span>
          <span
            className="inline-flex h-6 items-center rounded px-2 text-[10px] font-medium"
            style={{ backgroundColor: accentBright, color: "#FFFFFF" }}
          >
            Bright button
          </span>
          <span
            className="inline-flex h-6 items-center rounded border px-2 text-[10px] font-medium"
            style={{ borderColor: accentCyan, color: accentCyan }}
          >
            Outlined
          </span>
        </div>
      </div>
      <div
        className="flex flex-wrap items-center gap-1 px-3 py-2 text-[10px]"
        style={{ backgroundColor: "var(--surface-1)", color: "var(--text-muted)" }}
      >
        Swatches:
        {[
          ["Bg deep", deep],
          ["Bg navy", bg],
          ["Accent", accent],
          ["Accent bright", accentBright],
          ["Accent cyan", accentCyan],
          ["Text", textPrimary],
          ["Secondary", textSecondary],
          ["Muted", textMuted],
        ].map(([label, hex]) => (
          <span
            key={label}
            className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5"
            style={{ borderColor: "var(--border-subtle)" }}
            title={`${label}: ${hex}`}
          >
            <span
              className="size-3 rounded-sm"
              aria-hidden
              style={{ backgroundColor: hex, outline: "1px solid rgba(0,0,0,0.15)" }}
            />
            <span className="font-mono">{hex}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// CONTACT TAB
// ============================================================
function ContactTab() {
  const gs = useGlobalSettings();
  const { updateGlobalSettings } = useContentStore();
  const [draft, setDraft] = useState<GlobalSettings>(gs);

  useEffect(() => setDraft(gs), [gs]);

  function save() {
    updateGlobalSettings(draft);
    toast.success("Contact settings saved.");
  }

  /**
   * Split an existing `hours` string like "07:00 – 19:00" or "09:00-17:00"
   * (or non-time values like "Closed (monitoring 24/7)") into separate
   * open / close time inputs. Anything that doesn't split cleanly falls
   * back to keeping the full string in the open field — the user can
   * type free-form values like "Closed" there too.
   */
  function splitHours(
    raw: string
  ): { open: string; close: string } {
    if (!raw) return { open: "", close: "" };
    // Try the en-dash separator first, then the ASCII hyphen.
    const parts = raw.split(/\s*(?:–|-|—)\s*/);
    if (parts.length >= 2) {
      return { open: parts[0].trim(), close: parts.slice(1).join(" – ").trim() };
    }
    return { open: raw.trim(), close: "" };
  }

  /**
   * Recombine open/close back into the single `hours` string. We keep
   * the format "HH:MM – HH:MM" so seed data and saved rows remain
   * backward-compatible with anything reading `contact.hours[i].hours`
   * as a single string.
   */
  function joinHours(open: string, close: string): string {
    const o = open.trim();
    const c = close.trim();
    if (!o && !c) return "";
    if (!c) return o;
    if (!o) return c;
    return `${o} – ${c}`;
  }

  function updateHours(
    i: number,
    next: Partial<{ day: string; open: string; close: string }>
  ) {
    const hours = draft.contact.hours.slice();
    const current = hours[i];
    const split = splitHours(current.hours);
    const open = next.open ?? split.open;
    const close = next.close ?? split.close;
    hours[i] = {
      day: next.day ?? current.day,
      hours: joinHours(open, close),
    };
    setDraft({ ...draft, contact: { ...draft.contact, hours } });
  }

  function addHour() {
    setDraft({
      ...draft,
      contact: { ...draft.contact, hours: [...draft.contact.hours, { day: "", hours: "" }] },
    });
  }

  function removeHour(i: number) {
    setDraft({
      ...draft,
      contact: {
        ...draft.contact,
        hours: draft.contact.hours.filter((_, idx) => idx !== i),
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Contact</CardTitle>
        <CardDescription>
          Email, phone, sample address, business hours, and optional map
          embed URL. The address is clearly labeled sample — replace before
          launch.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="contact-email" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Email
            </Label>
            <Input
              id="contact-email"
              type="email"
              value={draft.contact.email}
              onChange={(e) => setDraft({ ...draft, contact: { ...draft.contact, email: e.target.value } })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-phone" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Phone
            </Label>
            <Input
              id="contact-phone"
              type="tel"
              value={draft.contact.phone}
              onChange={(e) => setDraft({ ...draft, contact: { ...draft.contact, phone: e.target.value } })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-address" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Sample address
          </Label>
          <Input
            id="contact-address"
            value={draft.contact.addressSample}
            onChange={(e) => setDraft({ ...draft, contact: { ...draft.contact, addressSample: e.target.value } })}
          />
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Sample — replace before launch.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-map" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Map embed URL (optional)
          </Label>
          <Input
            id="contact-map"
            value={draft.contact.mapEmbedUrl ?? ""}
            onChange={(e) => setDraft({ ...draft, contact: { ...draft.contact, mapEmbedUrl: e.target.value } })}
            placeholder="https://www.google.com/maps/embed?…"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Business hours
          </Label>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Each row: a day-of-week preset, an open time, and a close time.
            Times accept any text — type &ldquo;Closed&rdquo; to mark a day off.
            Pick &ldquo;Custom&rdquo; for unusual day labels (e.g. public holidays).
          </p>
          <div className="space-y-1.5">
            {draft.contact.hours.map((h, i) => {
              const split = splitHours(h.hours);
              const isCustomDay =
                h.day !== "" && !DOW_PRESETS.includes(h.day);
              const dayValue = isCustomDay ? "Custom" : h.day;
              return (
                <div
                  key={i}
                  className="rounded-md border p-2"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={dayValue}
                      onValueChange={(v) =>
                        updateHours(i, {
                          day: v === "Custom" ? h.day || "" : v,
                        })
                      }
                    >
                      <SelectTrigger
                        className="h-8 w-[150px] shrink-0 text-xs"
                        aria-label={`Day for row ${i + 1}`}
                      >
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOW_PRESETS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={split.open}
                      onChange={(e) => updateHours(i, { open: e.target.value })}
                      className="h-8 min-w-[100px] flex-1 text-xs"
                      placeholder="07:00"
                      aria-label={`Open time for row ${i + 1}`}
                    />
                    <Input
                      value={split.close}
                      onChange={(e) => updateHours(i, { close: e.target.value })}
                      className="h-8 min-w-[100px] flex-1 text-xs"
                      placeholder="19:00"
                      aria-label={`Close time for row ${i + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-[var(--danger,#ef4444)]"
                      onClick={() => removeHour(i)}
                      aria-label={`Remove hours row ${i + 1}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  {isCustomDay ? (
                    <div className="mt-2 flex items-center gap-2">
                      <Label
                        htmlFor={`hours-custom-${i}`}
                        className="text-[10px] uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Custom label
                      </Label>
                      <Input
                        id={`hours-custom-${i}`}
                        value={h.day}
                        onChange={(e) => updateHours(i, { day: e.target.value })}
                        className="h-8 flex-1 text-xs"
                        placeholder="e.g. Public holidays"
                        aria-label={`Custom day label for row ${i + 1}`}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <Button variant="outline" size="sm" onClick={addHour} className="gap-1.5">
            <Plus className="size-3.5" />
            Add row
          </Button>
        </div>

        <SaveButton onClick={save} />
      </CardContent>
    </Card>
  );
}

// ============================================================
// SOCIAL TAB
// ============================================================
function SocialTab() {
  const gs = useGlobalSettings();
  const { updateGlobalSettings } = useContentStore();
  const [draft, setDraft] = useState<GlobalSettings>(gs);

  useEffect(() => setDraft(gs), [gs]);

  function save() {
    // Reconcile: drop rows that have no URL or platform.
    const cleaned = draft.socials.filter(
      (s) => s.platform && s.url.trim().length > 0
    );
    updateGlobalSettings({ socials: cleaned });
    setDraft({ ...draft, socials: cleaned });
    toast.success(`Saved ${cleaned.length} social ${cleaned.length === 1 ? "link" : "links"}.`);
  }

  function addSocial() {
    const next: SocialLink = {
      id: makeId("social"),
      platform: "twitter",
      url: "",
    };
    setDraft({ ...draft, socials: [...draft.socials, next] });
  }

  function updateSocial(id: string, partial: Partial<SocialLink>) {
    setDraft({
      ...draft,
      socials: draft.socials.map((s) =>
        s.id === id ? { ...s, ...partial } : s
      ),
    });
  }

  function removeSocial(id: string) {
    setDraft({
      ...draft,
      socials: draft.socials.filter((s) => s.id !== id),
    });
  }

  /**
   * Some legacy rows may carry a platform that isn't in our preset list
   * (e.g. `rss`). Those still render — the Select shows the preset list
   * but we display the actual platform value as a small chip so the
   * author can see and edit it via the dedicated table.
   */
  function platformLabel(platform: SocialLink["platform"]): string {
    return (
      SOCIAL_PLATFORMS.find((p) => p.value === platform)?.label ?? platform
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Social links</CardTitle>
        <CardDescription>
          Inline editor for the most common platforms. Each row saves a
          platform + URL. A full CRUD table for advanced cases (handles,
          ordering, RSS feeds) lives at{" "}
          <Link to="/admin/social" className="underline">
            #/admin/social
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {draft.socials.length === 0 ? (
          <div
            className="rounded-md border border-dashed p-4 text-center text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            No social links yet. Click &ldquo;Add&rdquo; to add your first.
          </div>
        ) : (
          <div className="space-y-1.5">
            {draft.socials.map((s) => {
              const isPreset = SOCIAL_PLATFORMS.some((p) => p.value === s.platform);
              return (
                <div
                  key={s.id}
                  className="flex flex-col gap-2 rounded-md border p-2 sm:flex-row sm:items-center"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <Select
                    value={isPreset ? s.platform : "__other__"}
                    onValueChange={(v) => {
                      if (v === "__other__") return; // no-op
                      updateSocial(s.id, { platform: v as SocialLink["platform"] });
                    }}
                  >
                    <SelectTrigger
                      className="h-8 w-full shrink-0 text-xs sm:w-[180px]"
                      aria-label={`Platform for ${s.id}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_PLATFORMS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                      {!isPreset ? (
                        <SelectItem value="__other__">
                          Other ({s.platform})
                        </SelectItem>
                      ) : null}
                    </SelectContent>
                  </Select>
                  <Input
                    value={s.url}
                    onChange={(e) => updateSocial(s.id, { url: e.target.value })}
                    className="h-8 flex-1 text-xs"
                    placeholder="https://twitter.com/techstar"
                    aria-label={`URL for ${platformLabel(s.platform)}`}
                  />
                  <a
                    href={s.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    aria-label={`Open ${platformLabel(s.platform)} link in new tab`}
                    onClick={(e) => {
                      if (!s.url) e.preventDefault();
                    }}
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-[var(--danger,#ef4444)]"
                    onClick={() => removeSocial(s.id)}
                    aria-label={`Delete ${platformLabel(s.platform)} link`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex items-center justify-between gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={addSocial} className="gap-1.5">
            <Plus className="size-3.5" />
            Add
          </Button>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/social">Open full social table</Link>
            </Button>
            <SaveButton onClick={save} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// SEO TAB
// ============================================================
function SeoTab() {
  const gs = useGlobalSettings();
  const { updateGlobalSettings } = useContentStore();
  const [draft, setDraft] = useState<GlobalSettings>(gs);
  const [ogPickerOpen, setOgPickerOpen] = useState(false);

  useEffect(() => setDraft(gs), [gs]);

  function save() {
    updateGlobalSettings(draft);
    toast.success("Default SEO settings saved.");
  }

  function handleOgPick(media: MediaAsset | null) {
    if (media) {
      setDraft({
        ...draft,
        defaultSeo: { ...draft.defaultSeo, ogImage: media.url },
      });
      toast.success(`OG image set to "${media.title}"`);
    } else {
      setDraft({
        ...draft,
        defaultSeo: { ...draft.defaultSeo, ogImage: undefined },
      });
      toast.success("OG image cleared");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Default SEO</CardTitle>
        <CardDescription>
          Applied to every page that doesn&apos;t override its own SEO
          metadata. Page-level overrides still take precedence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="seo-title" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Default title
          </Label>
          <Input
            id="seo-title"
            value={draft.defaultSeo.title ?? ""}
            onChange={(e) => setDraft({ ...draft, defaultSeo: { ...draft.defaultSeo, title: e.target.value } })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seo-desc" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Default description
          </Label>
          <Textarea
            id="seo-desc"
            value={draft.defaultSeo.description ?? ""}
            onChange={(e) => setDraft({ ...draft, defaultSeo: { ...draft.defaultSeo, description: e.target.value } })}
            rows={3}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Default OG image
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOgPickerOpen(true)}
                className="gap-1.5"
                aria-label="Pick default OG image from media library"
              >
                <ImageIcon className="size-3.5" />
                {draft.defaultSeo.ogImage ? "Change" : "Choose from library"}
              </Button>
              {draft.defaultSeo.ogImage ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-[var(--danger,#ef4444)]"
                  onClick={() => handleOgPick(null)}
                  aria-label="Clear OG image"
                >
                  <X className="size-3.5" />
                </Button>
              ) : null}
            </div>
            {draft.defaultSeo.ogImage ? (
              <div
                className="overflow-hidden rounded-md border"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <img
                  src={draft.defaultSeo.ogImage}
                  alt="Default OG image preview"
                  className="aspect-[1200/630] w-full bg-[var(--surface-2)] object-cover"
                  loading="lazy"
                />
                <p
                  className="truncate px-2 py-1 text-[10px] font-mono"
                  style={{ color: "var(--text-muted)" }}
                >
                  {draft.defaultSeo.ogImage}
                </p>
              </div>
            ) : (
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                Recommended size: 1200 × 630. The default applies to every
                page without a page-level OG image override.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seo-canonical" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Canonical base URL
            </Label>
            <Input
              id="seo-canonical"
              value={draft.canonicalBaseUrl ?? ""}
              onChange={(e) => setDraft({ ...draft, canonicalBaseUrl: e.target.value })}
              placeholder="https://techstar.example"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seo-robots" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Robots directive
          </Label>
          <Select
            value={draft.robotsDirective ?? "index, follow"}
            onValueChange={(v) => setDraft({ ...draft, robotsDirective: v })}
          >
            <SelectTrigger id="seo-robots"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROBOTS_PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <SaveButton onClick={save} />

        <MediaPickerDialog
          open={ogPickerOpen}
          onOpenChange={setOgPickerOpen}
          value={draft.defaultSeo.ogImage}
          onSelect={handleOgPick}
          confirmLabel="Use as default OG"
        />
      </CardContent>
    </Card>
  );
}

// ============================================================
// LAYOUT TAB
// ============================================================
function LayoutTab() {
  const gs = useGlobalSettings();
  const { updateGlobalSettings } = useContentStore();
  const [draft, setDraft] = useState<GlobalSettings>(gs);

  useEffect(() => setDraft(gs), [gs]);

  function save() {
    updateGlobalSettings(draft);
    toast.success("Header/footer variants saved.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Header / Footer variants</CardTitle>
        <CardDescription>
          Choose global chrome variants. Some themes may not implement
          every variant — the site falls back to the default when an
          unknown variant is requested.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Header variant
            </Label>
            <Select
              value={draft.headerVariant}
              onValueChange={(v) => setDraft({ ...draft, headerVariant: v as GlobalSettings["headerVariant"] })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="full">Full (with mega-menu + announcement)</SelectItem>
                <SelectItem value="minimal">Minimal (logo + nav + CTA)</SelectItem>
                <SelectItem value="with-announcement">With announcement strip</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Footer variant
            </Label>
            <Select
              value={draft.footerVariant}
              onValueChange={(v) => setDraft({ ...draft, footerVariant: v as GlobalSettings["footerVariant"] })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="full">Full (multi-column + newsletter)</SelectItem>
                <SelectItem value="minimal">Minimal (single-row)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <HeaderFooterPreview
          headerVariant={draft.headerVariant}
          footerVariant={draft.footerVariant}
        />

        <SaveButton onClick={save} />
      </CardContent>
    </Card>
  );
}

/**
 * Tiny live preview snippet for the header/footer variants. This is a
 * text-based representation of what each variant renders — not a pixel-
 * perfect mock — so the author can sanity-check which variant is
 * active without leaving the Settings tab.
 */
function HeaderFooterPreview({
  headerVariant,
  footerVariant,
}: {
  headerVariant: GlobalSettings["headerVariant"];
  footerVariant: GlobalSettings["footerVariant"];
}) {
  // Normalise legacy "default" → equivalent variant label so the
  // preview still renders something useful.
  const headerLabel =
    headerVariant === "default" ? "Default" : (
      headerVariant === "full" ? "Full chrome" :
      headerVariant === "minimal" ? "Minimal" :
      headerVariant === "with-announcement" ? "With announcement" :
      "Default"
    );
  const footerLabel =
    footerVariant === "default" ? "Default footer" : (
      footerVariant === "full" ? "Full footer" :
      footerVariant === "minimal" ? "Minimal footer" :
      "Default footer"
    );

  const showAnnouncement =
    headerVariant === "with-announcement" || headerVariant === "full";

  return (
    <div
      className="overflow-hidden rounded-md border text-[11px]"
      style={{
        borderColor: "var(--border-subtle)",
        backgroundColor: "var(--surface-1)",
        color: "var(--text-muted)",
      }}
      aria-label="Layout preview"
    >
      <div className="border-b px-3 py-1.5" style={{ borderColor: "var(--border-subtle)" }}>
        <span className="font-mono uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          Preview ·
        </span>{" "}
        <span style={{ color: "var(--text-secondary)" }}>{headerLabel}</span>
        {" + "}
        <span style={{ color: "var(--text-secondary)" }}>{footerLabel}</span>
      </div>
      {showAnnouncement ? (
        <div
          className="flex items-center justify-between gap-2 px-3 py-1 text-[10px]"
          style={{
            backgroundColor: "var(--accent)",
            color: "#FFFFFF",
          }}
        >
          <span className="truncate">Announcement strip — limited-time offer or notice.</span>
          <span className="shrink-0 underline">Learn more →</span>
        </div>
      ) : null}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{
          backgroundColor: "var(--surface-2)",
          color: "var(--text-primary)",
        }}
      >
        <span className="flex items-center gap-2">
          <span
            className="size-3 rounded-sm"
            style={{ backgroundColor: "var(--accent)" }}
            aria-hidden
          />
          <span className="text-[11px] font-semibold tracking-tight">TECHSTAR</span>
          {headerVariant === "minimal" ? null : (
            <span
              className="ml-3 hidden gap-2 sm:flex"
              style={{ color: "var(--text-muted)" }}
            >
              <span>Services</span>
              <span>Industries</span>
              <span>Insights</span>
            </span>
          )}
        </span>
        <span
          className="inline-flex h-5 items-center rounded px-2 text-[10px] font-medium"
          style={{ backgroundColor: "var(--accent-bright)", color: "#FFFFFF" }}
        >
          {headerVariant === "minimal" ? "→" : "Contact"}
        </span>
      </div>
      <div
        className="px-3 py-6 text-center"
        style={{ backgroundColor: "var(--bg-deep)", color: "var(--text-secondary)" }}
      >
        Page content
      </div>
      <div
        className="px-3 py-2"
        style={{
          backgroundColor: "var(--surface-2)",
          color: "var(--text-muted)",
        }}
      >
        {footerVariant === "minimal" ? (
          <div className="flex items-center justify-between text-[10px]">
            <span>© Techstar</span>
            <span>Privacy · Terms</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-4">
            <div>
              <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>Services</p>
              <p>Security</p>
              <p>Infrastructure</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>Company</p>
              <p>About</p>
              <p>Careers</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>Resources</p>
              <p>Insights</p>
              <p>Projects</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>Newsletter</p>
              <p>Subscribe →</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CTAS TAB
// ============================================================
function CtasTab() {
  const gs = useGlobalSettings();
  const { updateGlobalSettings } = useContentStore();
  const [draft, setDraft] = useState<GlobalSettings>(gs);

  useEffect(() => setDraft(gs), [gs]);

  function save() {
    updateGlobalSettings(draft);
    toast.success("CTA settings saved.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">CTAs</CardTitle>
        <CardDescription>
          Default call-to-action labels and destinations for the header,
          footer, floating button, and contact section.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CtaEditor
          title="Primary CTA (header)"
          cta={draft.ctas.primary}
          onChange={(c) => setDraft({ ...draft, ctas: { ...draft.ctas, primary: c } })}
        />
        <CtaEditor
          title="Secondary CTA"
          cta={draft.ctas.secondary ?? { label: "", href: "" }}
          onChange={(c) => setDraft({ ...draft, ctas: { ...draft.ctas, secondary: c } })}
        />
        <CtaEditor
          title="Floating CTA (right-edge)"
          cta={draft.ctas.floating ?? { label: "", href: "" }}
          onChange={(c) => setDraft({ ...draft, ctas: { ...draft.ctas, floating: c } })}
        />
        <CtaEditor
          title="Contact-section CTA"
          cta={draft.ctas.contact ?? { label: "", href: "" }}
          onChange={(c) => setDraft({ ...draft, ctas: { ...draft.ctas, contact: c } })}
        />
        <SaveButton onClick={save} />
      </CardContent>
    </Card>
  );
}

function CtaEditor({
  title,
  cta,
  onChange,
}: {
  title: string;
  cta: { label: string; href: string; variant?: string };
  onChange: (c: { label: string; href: string; variant?: string }) => void;
}) {
  return (
    <div className="rounded-md border p-3" style={{ borderColor: "var(--border-subtle)" }}>
      <h4 className="mb-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
        {title}
      </h4>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Label
          </Label>
          <Input
            value={cta.label}
            onChange={(e) => onChange({ ...cta, label: e.target.value })}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Destination (href)
          </Label>
          <Input
            value={cta.href}
            onChange={(e) => onChange({ ...cta, href: e.target.value })}
            className="h-8 text-xs"
            placeholder="#/contact"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COOKIE TAB
// ============================================================
function CookieTab() {
  const gs = useGlobalSettings();
  const { updateGlobalSettings } = useContentStore();
  const [draft, setDraft] = useState<GlobalSettings>(gs);

  useEffect(() => setDraft(gs), [gs]);

  function save() {
    updateGlobalSettings(draft);
    toast.success("Cookie preferences saved.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Cookie preferences</CardTitle>
        <CardDescription>
          Banner copy, default consent categories, and consent expiry.
          The dedicated cookie policy table is at{" "}
          <Link to="/admin/cookie" className="underline">#/admin/cookie</Link>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="cookie-text" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Cookie banner text
          </Label>
          <Textarea
            id="cookie-text"
            value={draft.cookieText}
            onChange={(e) => setDraft({ ...draft, cookieText: e.target.value })}
            rows={3}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cookie-expiry" className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Consent expiry (days)
          </Label>
          <Input
            id="cookie-expiry"
            type="number"
            min={1}
            value={draft.cookieConsentExpiryDays ?? 180}
            onChange={(e) => setDraft({ ...draft, cookieConsentExpiryDays: Number(e.target.value) })}
            className="h-8 w-32"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Default consent preferences
          </Label>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Categories pre-checked when the cookie banner first appears.
            <strong className="mx-1">Necessary</strong>
            is always on and cannot be opted out of.
          </p>
          <div
            className="rounded-md border p-3 space-y-2"
            style={{
              borderColor: "var(--border-subtle)",
              backgroundColor: "var(--surface-2)",
            }}
          >
            <CookiePrefRow
              label="Necessary"
              description="Required for the site to function. Always on."
              checked
              disabled
              onChange={() => undefined}
            />
            <CookiePrefRow
              label="Analytics"
              description="Traffic analytics (off by default)."
              checked={
                (draft.defaultCookiePrefs?.analyticsDefaultOff ?? true) === false
              }
              onChange={(c) =>
                setDraft({
                  ...draft,
                  defaultCookiePrefs: {
                    analyticsDefaultOff: !c,
                    marketingDefaultOff: draft.defaultCookiePrefs?.marketingDefaultOff ?? true,
                    functionalDefaultOn: draft.defaultCookiePrefs?.functionalDefaultOn ?? true,
                  },
                })
              }
            />
            <CookiePrefRow
              label="Marketing"
              description="Personalised ad tracking (off by default)."
              checked={
                (draft.defaultCookiePrefs?.marketingDefaultOff ?? true) === false
              }
              onChange={(c) =>
                setDraft({
                  ...draft,
                  defaultCookiePrefs: {
                    analyticsDefaultOff: draft.defaultCookiePrefs?.analyticsDefaultOff ?? true,
                    marketingDefaultOff: !c,
                    functionalDefaultOn: draft.defaultCookiePrefs?.functionalDefaultOn ?? true,
                  },
                })
              }
            />
            <CookiePrefRow
              label="Functional"
              description="Extras like theme toggle and saved forms (on by default)."
              checked={draft.defaultCookiePrefs?.functionalDefaultOn ?? true}
              onChange={(c) =>
                setDraft({
                  ...draft,
                  defaultCookiePrefs: {
                    analyticsDefaultOff: draft.defaultCookiePrefs?.analyticsDefaultOff ?? true,
                    marketingDefaultOff: draft.defaultCookiePrefs?.marketingDefaultOff ?? true,
                    functionalDefaultOn: c,
                  },
                })
              }
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/cookie">Open cookie settings</Link>
          </Button>
          <SaveButton onClick={save} />
        </div>
      </CardContent>
    </Card>
  );
}

function CookiePrefRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={`cookie-pref-${label.toLowerCase()}`}
      className="flex items-center gap-3 text-xs"
      style={{ color: "var(--text-primary)" }}
    >
      <Checkbox
        id={`cookie-pref-${label.toLowerCase()}`}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange(v === true)}
      />
      <span className="flex-1">
        <span className="font-medium">{label}</span>
        <span className="ml-1.5" style={{ color: "var(--text-muted)" }}>
          — {description}
        </span>
      </span>
    </label>
  );
}

// ============================================================
// DEFAULT LAYOUTS TAB
// ============================================================
function DefaultLayoutsTab() {
  const gs = useGlobalSettings();
  const { updateGlobalSettings } = useContentStore();
  const [draft, setDraft] = useState<GlobalSettings>(gs);

  useEffect(() => setDraft(gs), [gs]);

  function save() {
    updateGlobalSettings(draft);
    toast.success("Default page layouts saved.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Default page layouts</CardTitle>
        <CardDescription>
          The header/footer variant applied to newly created pages by
          default. Existing pages keep their current setting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Default header
            </Label>
            <Select
              value={draft.defaultPageLayout?.header ?? draft.headerVariant}
              onValueChange={(v) =>
                setDraft({
                  ...draft,
                  defaultPageLayout: {
                    header: v as GlobalSettings["headerVariant"],
                    footer: draft.defaultPageLayout?.footer ?? draft.footerVariant,
                  },
                })
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="with-announcement">With announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Default footer
            </Label>
            <Select
              value={draft.defaultPageLayout?.footer ?? draft.footerVariant}
              onValueChange={(v) =>
                setDraft({
                  ...draft,
                  defaultPageLayout: {
                    header: draft.defaultPageLayout?.header ?? draft.headerVariant,
                    footer: v as GlobalSettings["footerVariant"],
                  },
                })
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SaveButton onClick={save} />
      </CardContent>
    </Card>
  );
}

// ============================================================
// ADMIN APPEARANCE TAB
// ============================================================
function AdminAppearanceTab() {
  const { theme: nextThemeValue, setTheme } = useTheme();
  const [appearance, setAppearance] = useState<AdminAppearanceState>(DEFAULT_APPEARANCE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ADMIN_APPEARANCE_KEY);
      if (raw) {
        setAppearance({ ...DEFAULT_APPEARANCE, ...JSON.parse(raw) });
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist on change AND apply the theme immediately via next-themes
  // setTheme so the user sees the effect without leaving Settings.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(ADMIN_APPEARANCE_KEY, JSON.stringify(appearance));
      // Mirror the theme into the admin's theme key. AdminTopbar reads
      // this on next mount to restore the user's preferred theme.
      window.localStorage.setItem(ADMIN_THEME_KEY, appearance.theme);
      // Apply immediately via next-themes. setTheme handles the
      // "system" case (resolves to OS preference) and updates the
      // document class + localStorage `theme` key that next-themes
      // owns.
      setTheme(appearance.theme);
      toast.success("Admin appearance saved.");
    } catch {
      // ignore
    }
  }, [appearance, hydrated, setTheme]);

  if (!hydrated) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Loading…
          </p>
        </CardContent>
      </Card>
    );
  }

  // next-themes returns undefined on first render before hydration —
  // show a placeholder chip when we don't yet know the resolved theme.
  const resolved = nextThemeValue ?? appearance.theme;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Admin appearance</CardTitle>
        <CardDescription>
          Theme, sidebar default state, and table density for the admin
          console. Persists to localStorage; theme applies instantly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Admin theme
          </Label>
          <Select
            value={appearance.theme}
            onValueChange={(v) => setAppearance({ ...appearance, theme: v as AdminAppearanceState["theme"] })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Resolved now:{" "}
            <span className="font-mono">{resolved}</span>. Theme is
            applied instantly via <code className="mx-0.5 rounded bg-black/10 px-1 py-0.5">next-themes</code>.
          </p>
        </div>

        <ToggleRow
          label="Sidebar default collapsed"
          description="When set, the sidebar starts collapsed on each admin visit."
          checked={appearance.sidebarDefaultCollapsed}
          onChange={(c) => setAppearance({ ...appearance, sidebarDefaultCollapsed: c })}
        />
        <ToggleRow
          label="Dense tables"
          description="Tighter row padding in CRUD tables (more rows per screen)."
          checked={appearance.denseTables}
          onChange={(c) => setAppearance({ ...appearance, denseTables: c })}
        />

        <div
          className="rounded-md border p-3 text-[11px]"
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--surface-2)",
            color: "var(--text-muted)",
          }}
        >
          <p>
            <Badge variant="outline" className="mr-2 text-[10px]">Tip</Badge>
            Theme is mirrored to the
            <code className="mx-1 rounded bg-black/10 px-1 py-0.5">techstar:admin:theme</code>
            key so AdminTopbar restores it on next mount. Sidebar
            collapse / dense tables are read by the shell on mount
            (next admin visit).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h4 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {label}
        </h4>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      </div>
      <Switch checked={checked} onCheckedChange={(c) => onChange(c === true)} />
    </div>
  );
}

function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} className="gap-1.5">
      <Save className="size-3.5" />
      Save changes
    </Button>
  );
}
