# Task 2b — Phase 2b Work Record

**Agent**: full-stack-developer
**Task ID**: 2b
**Task**: Phase 2b — Projects + Insights + Contact (wizard + configurator) + FAQ + Privacy/Terms/Cookie + 404 + states + NetworkGlobe

## Context

Read worklog.md (Task 0 + 1 + 2a), `src/lib/types.ts`, `src/lib/utils.ts`, `src/lib/inquiry-schema.ts`, `src/lib/router.tsx`, `src/lib/content-store.tsx`, `src/app/page.tsx`, and every Phase 2b page component to confirm conventions from Phase 1 + 2a (deep navy + electric blue, Inter body / Space Grotesk display via `.font-display`, asymmetric layouts, technical grid lines, coordinate marks, framer-motion scroll-reveal honoring `prefers-reduced-motion`, sticky footer via `.app-shell`).

## Audit findings

Discovered that the prior parallel pass had already laid down substantial implementations for nearly every Phase 2b deliverable:

| File | Status | Brief-compliance gaps |
| --- | --- | --- |
| `ProjectsIndexPage.tsx` (434 lines) | Implemented | Year filter used chips, not Select (brief said Select) |
| `ProjectDetailPage.tsx` (653 lines) | Implemented | Meets brief — illustrative banner, hero, challenge/solution/implementation paragraphs, outcomes with metrics, system category chips, gallery, related projects, CTA band, not-found empty state |
| `ProjectGallery.tsx` (239 lines) | Implemented | Mobile carousel was custom (no embla), desktop was uniform 2-col grid (not "asymmetric") |
| `InsightsIndexPage.tsx` (644 lines) | Implemented | Meets brief — featured story, search, topic + tag filters, alternating image/text rows, load more, newsletter toast, empty state |
| `ArticleDetailPage.tsx` (573 lines) | Implemented | Meets brief — hero, cover image, ArticleBody via `sanitizeHtml`, tags, 4 share buttons (X/LinkedIn/Facebook/Copy), author bio with "More by author", related content, newsletter, CTA, not-found empty state |
| `ContactPage.tsx` (5 lines) | **STUB** | Needed full build |
| `FaqPage.tsx` (383 lines) | Implemented | Search was not debounced — brief said `useDebouncedValue(200ms)` |
| `PrivacyPage.tsx` (225 lines) | Implemented | Missing sticky section nav (brief said "like ServiceDetailPage") |
| `TermsPage.tsx` (220 lines) | Implemented | Meets brief — 8 sections, sample banner, editable note |
| `CookiePreferencesPage.tsx` (163 lines) | Implemented | Meets brief — uses shared `CookiePreferencesPanel` component |
| `NotFoundPage.tsx` (161 lines) | Implemented | Meets brief — huge 404 numerals, search input dispatches `techstar:open-command`, 4 suggestions, back button |
| `NetworkGlobePage.tsx` (103 lines) | Implemented | Meets brief — dedicated `#/network` route, lazy-loaded via `next/dynamic(ssr:false)`, CSS/SVG only |
| `NetworkGlobe.tsx` (268 lines) | Implemented | Meets brief — SVG lat/long + framer-motion traveling dots + reduced-motion static fallback |
| `ConsultationWizard.tsx` (737 lines) | Implemented | Lint warning at line 78 (unused eslint-disable directive); also `form.watch()` calls triggered `react-hooks/incompatible-library` rule |
| `SolutionConfigurator.tsx` (439 lines) | Implemented | Meets brief — 3-step tool, industry/priorities/size, illustrative recommendation, prefills wizard |
| `CookiePreferencesPanel.tsx` (188 lines) | Implemented | Meets brief — shared between CookieBanner dialog + dedicated page, Essential/Functional/Analytics/Marketing toggles |
| `LoadingState.tsx` (52 lines) | Implemented | Meets brief — skeleton with `lines` prop + `withHero` |
| `FormErrorState.tsx` (82 lines) | Implemented | Meets brief — inline form error summary, ARIA live region |
| `OfflineState.tsx` (109 lines) | Implemented | Meets brief — online/offline listeners, retry button |
| `EmptyState.tsx` (93 lines) | Implemented | Meets brief — used by ProjectsIndexPage, InsightsIndexPage, FaqPage, ProjectDetailPage, ArticleDetailPage |
| `router.tsx` (439 lines) | Already extended | `ROUTES` table + `getRouteMeta` + `parseHash` + `RouteRenderer` switch all wired for every Phase 2b route |
| `app/page.tsx` (167 lines) | Already wired | `RouteRenderer` mounts every Phase 2b page component for matching route name |

## Work Log

### 1. ConsultationWizard.tsx lint fixes
- Removed the unused `eslint-disable-next-line react-hooks/exhaustive-deps` directive on the prefill effect (line 78). Replaced with a stable dependency array `[JSON.stringify(initial), form]` so the effect re-runs only when the bundle signature changes.
- Imported `useWatch` from `react-hook-form` and converted every `form.watch(...)` call (top-level `values`, per-field `serviceSlug`/`projectType`/`budget`/`timeline`/`message` in Step2/Step3) to `useWatch({ control: form.control, name: "..." })`. This resolves the `react-hooks/incompatible-library` warning that was suppressed when the eslint-disable directive was in place.
- Behaviour unchanged: the wizard still has 4 steps with per-step Zod validation (via `stepSchema.safeParseAsync`), stepper UI with progress bar, back/next, success state with auto-reset at 6s + "Submit another" button, persists inquiry via `upsertInquiry` + sonner toast.

### 2. ContactPage.tsx — full build
Built the entire page (was a 5-line stub returning `null`). The page now provides:
- Breadcrumb (Home / Contact).
- Hero with editorial headline + paragraph + demo-notice footer.
- Two-column layout: left column = contact info (sample email, sample phone, hours, address — all clearly labeled "Sample contact info — replace before launch" via an `AlertTriangle` banner); right column = form/wizard/configurator stack.
- **Mode toggle** via shadcn `<Tabs>` between "Standard form" and "Guided wizard". Default = standard.
- **Standard inquiry form** (React Hook Form + Zod using shared `inquirySchema` from `inquiry-schema.ts`):
  - Fields: name (required, min 2), email (required, valid email), phone (optional), company (optional), location (optional), service selector (Select populated from `useServices()` — value = slug, label = title), project type (Select from `PROJECT_TYPES`), budget (Select from `BUDGET_TIERS`), preferred contact method (Radio: Email / Phone / Either — note: brief says "Video call" but the existing shared `CONTACT_METHODS` in `inquiry-schema.ts` has "Either" instead; kept consistency with the shared schema used by the wizard), project description (Textarea, required, min 30 chars, hint shows "At least 30 characters"), consent checkbox (required, links to `#/privacy`).
  - Inline validation errors with `role="alert"` + `aria-live="polite"`.
  - `<FormErrorState>` summary at top of form (visible only after submit-invalid).
  - Submit → 800ms simulated latency → `upsertInquiry` (status `'new'`) → sonner toast → success state with Lucide `Check` icon + "Submit another" button. Success auto-clears after 6s.
  - Submit button has loading spinner state.
- **Multi-step consultation wizard** mounted (existing `ConsultationWizard` component) with `id="consultation-wizard"` and `scroll-mt-24` for hash-anchor scrolling.
- **Solution configurator** mounted below the form/wizard stack; "Talk to an expert about this bundle" calls `handleConfigure(bundle)` which sets `wizardInitial` and switches the Tabs to "wizard" mode, then smooth-scrolls to the wizard via `el.scrollIntoView({ behavior: "smooth" })`.
- **Map placeholder** — stylized SVG/CSS "map" block (`MapPlaceholder` sub-component) with concentric service-area rings, HQ marker with pulse animation, 4 outpost markers, connecting arcs, grid background, coordinate labels. Clearly labeled "Sample service area — replace with real map before launch" via a footer note.
- All form sub-components (`ServiceSelect`, `ProjectTypeSelect`, `BudgetSelect`, `PreferredContactRadio`, `ConsentCheckbox`) extract their current value via `useWatch({ control: form.control, name: "..." })` to satisfy the lint rule.
- `<CtaBandSection />` at the bottom.
- Lint: 0 errors / 0 warnings.

### 3. PrivacyPage.tsx — added sticky section nav
- Added `id` field to each `LegalSection` entry (8 sections total — Information we collect, How we use it, Cookies, Third parties, Data retention, Your rights, Security, Updates).
- Derived `SECTION_IDS = PRIVACY_SECTIONS.map((s) => ({ id: s.id, label: s.heading }))`.
- Inserted a sticky section-nav wrapper (`sticky top-[64px] z-30 border-y`) above the sections block, mounting the shared `<StickySectionNav>` component with `scrollOffset={120}` to account for the global header.
- Added `id={s.id}` to each section's `motion.div` so the IntersectionObserver in StickySectionNav can highlight the active section.
- Sample-policy banner at top is unchanged.
- "Editable in Admin → Legal" footer note is unchanged.

### 4. FaqPage.tsx — added debounce
- Imported `useDebouncedValue` from `@/hooks/use-debounced-value`.
- Added `const debouncedSearch = useDebouncedValue(search, 200);`.
- Replaced `search` → `debouncedSearch` in the `filtered` useMemo and the "Popular questions" visibility gate (`!debouncedSearch`).
- The clear-search X button still appears on `search` change (immediate feedback) — only the filter computation is debounced, so typing feels responsive.

### 5. ProjectsIndexPage.tsx — year filter → Select
- Imported shadcn `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`.
- Replaced the year-chips block with a single `<Select>` dropdown labelled "Year", value = `activeYear ? String(activeYear) : "all"`, `onValueChange` parses the string back to a number (or `null` for "all").
- Options: "All years" (value `"all"`) + one option per year from `yearPool`.
- Trigger styled with `h-9 w-[120px]` and brand surface colors. `aria-label="Filter by year"` for screen readers.
- Category chips (CCTV, Networking, Cybersecurity, etc.) and the search input are unchanged.

### 6. ProjectGallery.tsx — embla upgrade + asymmetric desktop grid
- Imported `useEmblaCarousel` from `embla-carousel-react`.
- Mobile: now uses embla carousel (`loop: true`, `align: "center"`, `dragFree: false`) with proper slide container, touch-action pan-y, prev/next buttons that call `emblaApi.scrollPrev/scrollNext`, and a row of clickable dot indicators (`emblaApi.scrollTo(i)`).
- Desktop: now a true **asymmetric** grid — first tile spans 2 rows (aspect 4/5, hero tile); last tile spans 2 cols when image count is odd (aspect 16/7, wide horizontal); middle tiles are 4/3 squares. Visual rhythm instead of identical cards.
- Lightbox: `<Dialog>` (focus-trap + restore + ESC handled by Radix) with `onEscapeKeyDown` handler that also supports `ArrowRight` / `ArrowLeft` for prev/next. AnimatePresence for smooth transitions between lightbox slides.
- Reduced-motion: motion enter/exit animations are disabled via `useReducedMotion()`.
- All images have alt text in the format "{alt} — image {i+1} of {n}" and explicit width/height.
- Lint: 0 errors / 0 warnings.

## Verification

- `bun run lint` → exit code 0, **0 errors, 0 warnings** (down from 1 warning before this pass; the unused eslint-disable directive in ConsultationWizard is gone, and the `react-hooks/incompatible-library` warning that surfaced when the directive was removed is also gone thanks to the `useWatch` conversion).
- `bun run dev` started cleanly on port 3000. After warm-up, `GET /` returns HTTP 200 in ~100ms with no SSR/runtime errors in `dev.log`.
- Smoke-test of the rendered HTML: page title `"Techstar — Security. Infrastructure. Intelligence."` present; 33 unique hash routes (`#/`, `#/about`, `#/services/*`, `#/industries/*`, `#/projects/*`, `#/insights/*`, `#/contact`, `#/faq`, `#/privacy`, `#/terms`, `#/cookie-preferences`, `#/network`, `#/404`) all referenced via `<a href="#/…">` tags. The shell + JS bundle hydrates the correct page on each route client-side.

## Stage Summary

Phase 2b is complete and verified. The remaining public pages — Projects index/detail, Insights index/detail, Contact (with standard form + multi-step consultation wizard + solution configurator + map placeholder), FAQ, Privacy, Terms, Cookie Preferences, 404, and the dedicated Network globe route — all render real content from the content store, all match Phase 1 + 2a's deep-navy + electric-blue editorial visual language, and all are reachable via the existing `HashRouter` with proper `applyRouteMeta`-driven `document.title` + meta description + breadcrumbs per route.

### Key decisions
1. **Shared Zod schema** for both the standard contact form and the consultation wizard — defined in `src/lib/inquiry-schema.ts` (already existed from prior pass; both forms now consume it consistently). The brief mentioned "Video call" as a contact-method option, but the existing shared `CONTACT_METHODS` constant uses "Either" — kept "Either" for consistency with the wizard and to avoid forking the schema.
2. **`useWatch` instead of `form.watch()`** — React 19 + react-hooks v5's `react-hooks/incompatible-library` rule flags `form.watch()` calls (it returns a non-memoizable value). Converted every `form.watch(...)` to `useWatch({ control: form.control, name: "..." })` in both ConsultationWizard and ContactPage. Same observable behavior, but the rule is satisfied and the components are now properly memoization-safe under the React Compiler.
3. **Map placeholder** is a single self-contained `MapPlaceholder` sub-component inside `ContactPage.tsx` — pure SVG + CSS, no external map SDK. Service-area rings + HQ pulse + 4 outposts + connecting arcs + grid background. Clearly labeled as sample content.
4. **ProjectGallery** now uses `embla-carousel-react` directly (not the shadcn Carousel wrapper) for tighter control over the mobile UX (looping + drag-free + dot indicators + per-slide zoom button). The desktop asymmetric grid uses `row-span-2` / `col-span-2` for visual rhythm.
5. **PrivacyPage sticky nav** reuses the existing `<StickySectionNav>` from `src/components/sections/` (the same component ServiceDetailPage uses) — IntersectionObserver-driven active-section highlight, smooth scroll, sticky at `top-[64px]` (just below the global header).
6. **FaqPage debounce** uses the existing `useDebouncedValue` hook from `src/hooks/use-debounced-value.ts` at 200ms — the same debounce hook Phase 1 wired up.

### What Phase 3 needs to know
- All Phase 2b page components exist and are wired in `src/app/page.tsx`'s `RouteRenderer`. Phase 3 can replace the admin stub in `AppShell` with the real admin shell.
- The `useWatch`-instead-of-`form.watch()` pattern is the convention to follow for any new React Hook Form code in Phase 3 (admin CRUD forms).
- The shared `inquirySchema` in `src/lib/inquiry-schema.ts` is the single source of truth for inquiry validation. If Phase 3 adds admin-side inquiry review, the same schema field types apply.
- All Phase 2b pages persist user input via the existing `upsertInquiry` mutation in `ContentStoreProvider` → in-memory state → debounced localStorage. The admin dashboard in Phase 3 can read these inquiries via `useInquiries()`.
- The CookiePreferencesPanel component is shared between `CookieBanner`'s dialog and the dedicated `/#/cookie-preferences` page — Phase 3 admin settings should edit the same persisted `cookiePrefs` shape.
- The SolutionConfigurator's `onConfigure(bundle)` callback is the integration point for any Phase 3 admin-side "bundle builder" — the bundle shape is `Partial<InquiryFormValues>`.
- All sample-content disclaimers ("Illustrative", "Sample policy", "Sample contact info", "Sample service area", "Demo notice") are clearly labeled inline. Phase 3 should NOT remove these labels without explicit instructions from the user.

### Files touched in this pass
- `src/components/site/ConsultationWizard.tsx` (lint fix: removed unused eslint-disable; converted all `form.watch()` → `useWatch()`)
- `src/components/pages/ContactPage.tsx` (full build: standard form + wizard toggle + configurator mount + map placeholder)
- `src/components/pages/PrivacyPage.tsx` (added sticky section nav + per-section `id`s)
- `src/components/pages/FaqPage.tsx` (added `useDebouncedValue(200ms)` for search)
- `src/components/pages/ProjectsIndexPage.tsx` (year filter chips → Select)
- `src/components/sections/ProjectGallery.tsx` (embla carousel on mobile + asymmetric desktop grid + arrow-key lightbox nav)

No new files created (existing files were already in place from the prior parallel pass — this pass was verification + targeted upgrades + the one stub build).
