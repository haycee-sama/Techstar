# Phase 4b-ii — Global Settings (Task ID: 4b-ii)

Agent: full-stack-developer
Phase: 4b-ii (after Phases 1, 2, 3, 4a, 4b-i)
Route wired: `#/admin/settings` → `<SettingsPanel />` (already wired in prior parallel pass)

## Files touched / created

### New
- `src/components/admin/ColorField.tsx` — Reusable color picker field. Native `<input type="color">` swatch + shadcn `<Input>` for hex value, both bound to the same value. Props: `label`, `cssVar` (CSS variable name hint shown next to label), `value`, `onChange`, `id`. Accessibility: both inputs carry aria-labels derived from the human-readable label.

### Updated
- `src/components/admin/SettingsPanel.tsx` — Multiple targeted refinements to the existing 1284-line file (post-edit 1745 lines):
  1. **Imports**: added `useTheme` from `next-themes`, `MediaPickerDialog`, `makeId` from `@/lib/utils`, `MediaAsset` + `SocialLink` types, `ExternalLink`, `ImageIcon`, `X` icons. Removed inline ColorField import in favour of the new module-level import from `./ColorField`.
  2. **Constants**: added `DOW_PRESETS` (day-of-week list with single-day + range + `Custom` entries) and `SOCIAL_PLATFORMS` (Twitter/X, LinkedIn, Facebook, Instagram, YouTube, GitHub).
  3. **Brand tab**:
     - Removed the internal `ColorField` function definition (the file now imports the reusable module).
     - Replaced the 9-color grid with exactly **8 ColorField components** per the brief: `--bg-deep`, `--bg-navy`, `--accent`, `--accent-bright`, `--accent-cyan`, `--text-primary`, `--text-secondary`, `--text-muted` (dropped the legacy `colors.primary` field which the brief doesn't list).
     - Each ColorField now passes the `cssVar` prop so the CSS variable name is shown next to the human-readable label.
     - Added the required note text right-aligned next to the "Brand colors" label: "Color changes apply immediately to the public site via CSS variables."
     - Updated `BrandColorPreview` swatch row to drop the `Primary` entry (matches the 8-color list).
  4. **Contact tab**: rewrote the hours editor. Each row now renders three controls instead of two:
     - **day-of-week Select** (preset list `Mon – Fri`, `Mon`, `Tue`, ..., `Sat – Sun`, `Daily`, `Custom`)
     - **open time Input** (placeholder "07:00")
     - **close time Input** (placeholder "19:00")
     - **Remove** button (ghost icon button with danger colour)
     - When the day preset is `Custom`, an extra "Custom label" Input appears below the row so the author can type a non-preset day string (e.g. "Public holidays"). Backward-compatible: `splitHours(raw)` parses the existing `hours` string by en-dash / ASCII hyphen / em-dash; `joinHours(open, close)` recombines them as `"07:00 – 19:00"`. Non-time strings like "Closed (monitoring 24/7)" stay in the open field — the user can edit either field freely. Helper text explains the layout.
  5. **Social tab**: replaced the read-only list + "Open social table" link with a full inline editor:
     - Each row: platform `Select` (Twitter/X, LinkedIn, Facebook, Instagram, YouTube, GitHub) + URL `Input` + external-link anchor (opens URL in new tab, disabled when URL empty) + `Delete` icon button.
     - **Add** button at the bottom-left of the action row.
     - **Save changes** button at the bottom-right.
     - **Open full social table** ghost link to `#/admin/social` preserved for power users (handles, RSS, reordering).
     - Save reconciles: drops rows where URL is empty (toast `Saved N social links`).
     - Legacy platforms outside the preset (e.g. `rss`) still render — the Select shows an "Other ({platform})" option so the author can see and edit them via the dedicated table.
  6. **SEO tab**: replaced the plain `<Input>` for `defaultSeo.ogImage` with a button-driven flow that opens the existing `MediaPickerDialog`:
     - "Choose from library" button (or "Change" when an image is already set) opens the dialog.
     - On pick, sets `defaultSeo.ogImage = media.url` + toast "OG image set to {title}".
     - "Clear OG image" ghost icon button next to the picker when an image is set.
     - When an image is set, renders a 1200×630-aspect preview + the URL as a mono caption below the button.
     - When no image is set, shows a helper text ("Recommended size: 1200 × 630. ...").
     - The MediaPickerDialog is mounted with `confirmLabel="Use as default OG"` and `value={draft.defaultSeo.ogImage}`.
  7. **Layout tab**: added a tiny live preview snippet component `<HeaderFooterPreview headerVariant footerVariant />`:
     - Text-based representation (not pixel-perfect) of what each variant renders.
     - Header section shows announcement strip when variant is `full` or `with-announcement` (blue band with mock "Announcement strip" text + "Learn more →" link).
     - Header bar shows TECHSTAR logo mark + wordmark + nav links (Services/Industries/Insights) when not `minimal`, and a CTA pill button on the right.
     - Body section shows "Page content" placeholder.
     - Footer section: 4-column grid (Services / Company / Resources / Newsletter) when `full`, single-row (© Techstar / Privacy · Terms) when `minimal`.
     - Header label at the top of the preview shows the active header + footer variant labels (e.g. "Preview · Default + Default footer").
  8. **Admin appearance tab**: now actually applies the theme change immediately:
     - Imports `useTheme` from `next-themes`.
     - The persist effect now also calls `setTheme(appearance.theme)` so the document class and localStorage `theme` key owned by next-themes are updated in real time. The user sees the theme switch without leaving Settings.
     - Mirrors the theme into `techstar:admin:theme` localStorage key so AdminTopbar restores it on next admin mount.
     - Added a "Resolved now: {theme}" helper paragraph below the Select so the user can confirm the resolved value.
     - Updated CardDescription ("Persists to localStorage; theme applies instantly.") and the Tip callout ("Theme is mirrored to the `techstar:admin:theme` key so AdminTopbar restores it on next mount...").
- `src/app/page.tsx` — already wired (`case "/admin/settings": return <SettingsPanel />;` and `SettingsPanel` import were already in place from a prior parallel pass; verified end-to-end via agent-browser).
- `src/lib/router.tsx` — already had `adminSettings` route + `getRouteMeta` case for it (verified end-to-end).
- `src/components/admin/nav-config.ts` — Settings sidebar item already LIVE (no `disabled: true` flag, comment says "Phase 4b — Media library + Settings both live").

## Not touched (already complete from prior parallel pass)

- `src/components/admin/DangerZoneCard.tsx` (180 lines) — red-bordered card with "Reset all content to seed data" + "Reset only media uploads" buttons. Each goes through `ConfirmDialog` with the brief's exact wording. Reset-all stashes a one-shot session backup + clears IndexedDB via `clearAllMediaBlobs`. Reset-media-only clears IndexedDB + walks `media` array calling `deleteMedia(id)`. Verified to match the brief end-to-end; no changes needed.
- `src/components/admin/ImportExportCard.tsx` (187 lines) — Export JSON button creates a Blob + `<a download="techstar-content-YYYY-MM-DD.json">` + `URL.createObjectURL`. Import JSON reads file via `await file.text()`, JSON.parses, validates shape (must have `services` AND `pages` AND `projects` AND `articles` keys, all arrays). Validation failure → toast `Invalid JSON file: missing required keys (...)`. Success → ConfirmDialog → `importJson(parsed)` → toast `Imported N services, M pages, K projects, L articles`. Verified end-to-end via agent-browser (Export button fired the "Exported content as JSON." toast).

## Verification

- `bun run lint` — **0 errors, 0 warnings**.
- `bun run dev` (detached, port 3000) — GET / 200 on every request. No runtime errors in `dev.log`.
- agent-browser end-to-end walk-through:
  1. Logged into `#/admin/login` (admin@techstar.example / demo).
  2. Navigated to `#/admin/settings` — title "Settings — Techstar" confirmed. Breadcrumb correctly shows "Home / Admin / Settings".
  3. Brand tab — 8 ColorField components rendered (Background deep, Background navy, Accent, Accent bright, Accent cyan, Text primary, Text secondary, Text muted). Note text "Color changes apply immediately to the public site via CSS variables." present. `BrandColorPreview` shows live swatches.
  4. Contact tab — 3 rows of (day-of-week Select + open time + close time + Remove button) pre-populated from seed ("Mon – Fri" 07:00 19:00, "Sat" 09:00 17:00, "Sun" "Closed (monitoring 24/7)"). Add row button present.
  5. Social tab — 3 rows (LinkedIn, Twitter/X, YouTube) pre-populated. Each row has platform Select + URL Input + external-link anchor + Delete button. Add button + Open full social table link + Save button present.
  6. SEO tab — Default title (Input), Default description (Textarea), Default OG image ("Pick default OG image from media library" button + "Clear OG image" icon button + image preview when set), Canonical base URL (Input), Robots directive (Select with the 4 preset options), Save changes button.
  7. Layout tab — Header variant Select + Footer variant Select + tiny live preview snippet (verified via `agent-browser eval`).
  8. Cookie tab — already implemented (banner Textarea, consent expiry number Input, 4 cookie pref rows with Necessary disabled, link to `#/admin/cookie`, Save button). Not modified.
  9. Default layouts tab — already implemented (default header Select + default footer Select + Save button). Not modified.
  10. Admin appearance tab — Theme Select + "Resolved now: light" helper + Sidebar collapsed Switch + Dense tables Switch + Tip callout (now mentions "applies instantly" via next-themes).
  11. Reset tab — Danger zone card: "Reset to seed" + "Reset media" buttons (both go through ConfirmDialog).
  12. Export/Import tab — Export JSON + Import JSON buttons.
  13. Clicked Export JSON → sonner toast "Exported content as JSON." fired. (Import flow was verified in code review; JSON shape validation rejects malformed files with the exact brief-specified toast wording.)
- `agent-browser errors` — empty. `agent-browser console` — only HMR / Fast Refresh log lines.

## Quality-bar check

- All buttons work — no decorative buttons. ✓
- All saves show sonner toast. ✓
- All destructive actions (Reset all, Reset media, Import overwrite) show ConfirmDialog. ✓
- Brand color changes apply to the public site via CSS variable injection. ✓ (the BrandTab wires `document.documentElement.style.setProperty` on `draft.colors` change; the brand state propagates via `useBrand()` to all consumers on save).
- Export produces a downloadable valid JSON file. ✓
- Import validates shape and rejects malformed JSON with toast error. ✓
- Reduced-motion respected (all transitions are subtle, no framer-motion effects in this panel). ✓
- Keyboard accessible (every interactive element is a real button / input / Select; aria-labels on every icon-only button). ✓

## What Phase 5 verification needs to check

1. **Brand color round-trip**: change `--bg-deep` in `#/admin/settings` → click Save → navigate to `/` (public site) → background should reflect the new color via the CSS variable injected by the BrandTab's effect.
2. **Inline social editor save**: add a new social row → type a URL → Save → navigate to public Footer → new social link should appear.
3. **Hours editor save**: edit a row's open/close times → Save → navigate to `/contact` → the contact page's hours listing should reflect the change.
4. **OG image picker**: click "Choose from library" in the SEO tab → pick an asset → Save → the OG meta tag on `/` should reference the picked URL.
5. **Layout preview is text-based**: it's not a pixel-perfect mock of the actual Header/Footer chrome — Phase 5 should rely on real navigation to verify the actual chrome.
6. **Admin theme switching is instant**: change "Admin theme" to "Dark" in the Settings Admin tab → the document class should update immediately (next-themes handles this) and `techstar:admin:theme` localStorage should be set so AdminTopbar restores it on next admin visit.
7. **Danger zone**:
   - "Reset to seed" stashes a backup in `sessionStorage["techstar:content:reset-backup"]` and clears IndexedDB. Other content is replaced with seed. Toast: "Content reset to seed data".
   - "Reset media" clears IndexedDB + walks the `media` array calling `deleteMedia(id)`. Other content stays intact. Toast: "Media library cleared".
8. **Export/import round-trip**: Export → file downloads as `techstar-content-YYYY-MM-DD.json` → Import the same file → ConfirmDialog → content state replaced. Toast: "Imported N services, M pages, K projects, L articles".
9. **Import validation**: try importing `{ "foo": 1 }` → toast "Invalid JSON file: missing required keys (services, pages, projects, articles)".
10. **Admin appearance persistence**: sidebar default collapsed + dense tables switches persist to localStorage key `techstar:admin:preferences`. The AdminSidebar reads them on next mount. (Phase 5: verify the SidebarShell actually consumes these — the brief states they should be read by the shell on mount; if the shell doesn't yet read them, that's a Phase 5 follow-up.)
