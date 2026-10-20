# Task 4a — Phase 4a Visual Builder + SectionRenderer + Preview route

## Summary

Phase 4a is **complete and lint-clean**. All required files were already on disk
from a prior parallel pass; this pass verified end-to-end functionality, fixed
the lint errors that the previous pass left in place, enabled the Visual Builder
sidebar entry, and confirmed the routes work.

## Concrete work performed in this pass

1. **Lint error #1 — `SectionNavigator.tsx`: PascalCase `Icon` created during
   render (`react-hooks/static-components`).**
   - Replaced the `const Icon = getSectionIcon(section.type); <Icon />` pattern
     inside `NavigatorRow` (a separate component, so the rule fires) with a
     module-level `<SectionTypeIcon type={section.type} className=... style=... />`
     wrapper that uses `createElement(getSectionIcon(type), …)` to avoid the
     PascalCase-variable-as-JSX pattern entirely.

2. **Lint error #2 — `BeforeAfterSection.tsx`: `ref.current?.clientWidth`
   accessed during render (`react-hooks/refs`).**
   - The inner `<img>` was reading `ref.current?.clientWidth` inline to size
     itself to the container (it sits inside a clipping div sized to `pos%`).
     Replaced with a `containerWidth` state synced via `ResizeObserver` in
     `useEffect`, then rendered the inner `<img>` with
     `style={{ width: containerWidth ? \`${containerWidth}px\` : "100%" }}`.
     Same UX, no ref access during render.

3. **Lint error #3 — `VisualBuilder.tsx`: `draftRef.current = draft` written
   during render (`react-hooks/refs`).**
   - Wrapped the sync in `useEffect(() => { draftRef.current = draft; }, [draft])`
     (matching the existing `dirtyRef` pattern just above).

4. **Lint error #4 — `VisualBuilder.tsx`: 7×
   `react-hooks/preserve-manual-memoization` errors** (auto-revealed by `--fix`
   removing the now-unused `eslint-disable` directives on each `useCallback`).
   The compiler inferred `commitSections` as a missing dependency for every
   `useCallback` that called it.
   - Converted the plain `function commit(next)` and
     `function commitSections(next)` declarations into proper `useCallback`s
     with stable dependency arrays, then added `commitSections` to the
     dependency arrays of `updateSection`, `addSection`, `deleteSection`,
     `duplicateSection`, `toggleVisibility`, `reorder`, and `moveSection`.

5. **Sidebar wiring — `src/components/admin/nav-config.ts`:**
   - Removed `disabled: true, hint: "Phase 4"` from the **Visual builder** item
     so it's now a live link.
   - Bumped the **Media** and **Settings** items' hints from `"Phase 4"` to
     `"Phase 4b"` to match the brief (kept `disabled: true`).

## What's in place from the prior pass (verified, untouched)

- `src/components/builder/SectionRenderer.tsx` — full dispatch over all 17
  `SectionType` variants (reuses HeroSection / CtaBandSection / ServicesOverview /
  InfrastructureDiagram / CapabilitiesStats / LogoMarquee / TestimonialsSlider /
  FeaturedProjects / ProcessTimeline / InsightsCarousel for the home-page-backed
  types; renders the 11 data-driven builder sections from
  `src/components/builder/sections/*`). Honors `visible=false`, spacing,
  alignment, width, themeVariant. Renders a labeled placeholder for hidden
  sections when `showHiddenPlaceholders=true` (builder canvas uses this).
  Renders an "Unknown section type" block for types not in the enum.
- `src/lib/section-library.ts` — 19 entries with `type`, `name`, `description`,
  `icon`, `variants`, and `defaultData()` factory.
- `src/components/admin/VisualBuilder.tsx` — 3-pane layout with sticky
  `ViewportToolbar` (inline-editable title, viewport toggle Desktop/Tablet/Mobile,
  Undo/Redo, Save draft, Publish/Unpublish, Preview, Help dialog, status
  indicator). Left rail `SectionNavigator` (dnd-kit sortable with
  PointerSensor + KeyboardSensor + TouchSensor), right rail
  `PropertiesInspector` (data-driven field editor: text/textarea/URL/image via
  `MediaPickerDialog`/array editors for stats+items+images/layout Selects/
  visibility checkbox). Mobile collapses to single pane with two `Sheet`
  triggers. Undo/redo with `Ctrl+Z` / `Ctrl+Shift+Z`. Debounced save 500ms +
  debounced history push 400ms (max 50). `beforeunload` + hash-change-away
  guard via `ConfirmDialog`. Honesty chip + Help dialog explaining scope.
- `src/components/admin/VisualBuilderOverview.tsx` — list of all
  builder-editable pages with status badge, section count, last-updated,
  "Open builder" + "Preview" buttons. Stats cards. Empty state. "New page"
  button that creates a fresh `PageContent` and routes into the editor.
- `src/components/admin/InsertSectionPanel.tsx` — Dialog grid of all library
  items, each with variant chips. Click chip → inserts Section with that
  variant + defaultData at end (or after current selection) + selects it +
  closes dialog.
- `src/components/admin/PropertiesInspector.tsx` — data-driven inspector
  (FieldEditor switches on field name + value shape), ArrayField for
  stats/items/images, ImageField using `MediaPickerDialog`, layout Selects.
- `src/components/admin/ViewportToolbar.tsx` — toolbar + ViewportToggle +
  StatusIndicator (relative-time, 30s tick) + HelpDialog.
- `src/components/admin/SectionNavigator.tsx` — dnd-kit sortable list, row
  with drag handle + index + icon + name + variant + visibility toggle +
  duplicate + delete buttons.
- `src/components/pages/PreviewPage.tsx` — reads `?preview=true` from hash,
  renders `page.sections` (draft) when true, else `page.publishedSections`.
  Shows dismissible yellow "Preview" banner in preview mode. Shows archived
  notice when status is "archived". Shows "No published snapshot yet" when no
  published sections exist. All states offer "Open in builder" link.
- `src/lib/router.tsx` — `preview` + `adminBuilder` + `adminBuilderEdit`
  routes already wired with breadcrumbs + `noindex: true`.
- `src/app/page.tsx` — already imports + dispatches:
  - `case "/admin/builder"` → `<VisualBuilderOverview />`
  - `segments.length === 3 && segments[1] === "builder"` → `<VisualBuilder slug={...} />`
  - `case "preview"` (RouteRenderer) → `<PreviewPage slug={parsed.params.slug} />`
- `src/components/builder/sections/*` — 11 minimal data-driven renderers for
  SplitImage, ServicesGrid, ServicesEditorial, Gallery, Video, BeforeAfter,
  Accordion, Timeline, ContactForm, Map, CustomHtml.

## Verification

- `bun run lint` → exit code 0, **0 errors, 0 warnings**.
- Dev server on port 3000 (started detached): `GET /` returns 200 in ~17s
  (first-compile), then 200 in ~80ms thereafter. `GET /#/admin/builder`,
  `GET /#/admin/builder/test`, `GET /#/preview/test` all return 200 (hash
  routes are client-side; same HTML served as `/`).
- No compile or runtime errors in `dev.log`.
- Seed data ships 10 `PageContent` records (`home` with 10 sections, `about`
  with 4 sections, the rest empty) so the builder is non-empty out of the box
  and the overview shows real cards.

## What Phase 4b needs to know

- **Media + Settings sidebar items remain `disabled: true, hint: "Phase 4b"`**
  in `src/components/admin/nav-config.ts`. The `MediaLibrary.tsx` and
  `SettingsPanel.tsx` files already exist on disk as full components (likely
  from the same prior parallel pass), and `src/app/page.tsx` already dispatches
  `/admin/media` → `<MediaLibrary />` and `/admin/settings` → `<SettingsPanel />`
  so a direct-URL visit still works. Phase 4b just needs to flip the sidebar
  items to enabled and decide whether to keep, extend, or replace the existing
  implementations.
- **SectionRenderer + SectionLibrary are the single source of truth** for
  builder-editable section types. Adding a new type requires (1) adding it to
  `SectionType` in `src/lib/types.ts`, (2) adding a `case` in
  `SectionRenderer.tsx`'s `SectionContent` dispatch, and (3) adding an entry
  to `SECTION_LIBRARY` in `src/lib/section-library.ts`. Optional: a new
  data-driven renderer at `src/components/builder/sections/<Name>Section.tsx`.
- **The `PageContent.publishedSections` field** (added by Phase 3 to
  `src/lib/types.ts`) is what `#/preview/:slug` (without `?preview=true`)
  renders. `publishPage(slug)` in `content-store.tsx` snapshots
  `sections → publishedSections` and sets `status='published' + publishedAt`.
  `unpublishPage(slug)` sets `status='archived'` (preserves both arrays).
- **The `usePages()` hook** (added by Phase 3 to `content-store.tsx`) is the
  read API for the overview; `upsertPage(page)` is the create API used by the
  overview's "New page" button.
- **VisualBuilder + PropertiesInspector use `draftRef` (kept in sync via
  useEffect) and `dirtyRef`** so the debounced-save closure can read the
  latest draft without re-creating the timer. Any new mutation that needs
  to read the latest draft should go through `commitSections(next)` /
  `commit({...draft, title})` — those already wire history + save +
  dirty-ref updates correctly.
- **InsightsCarouselSection, TestimonialsSliderSection, LogoMarqueeSection,
  ServicesOverviewSection, FeaturedProjectsSection, ProcessTimelineSection,
  InfrastructureDiagramSection, CapabilitiesStatsSection** — these home-page
  section renderers are reused by SectionRenderer. They read from the content
  store (services, testimonials, articles, projects, etc.) so a builder
  page composed of these sections always reflects the latest content-store
  data, not a snapshot. Section-level `data` is ignored for these types.
- **Reduced-motion:** all reused home-page sections honor
  `useReducedMotion()`; the new data-driven builder sections in
  `src/components/builder/sections/*` use `framer-motion`'s `motion.div` with
  `whileInView` + `viewport={{ once: true }}`. No infinite animation runs
  when reduced motion is on.
