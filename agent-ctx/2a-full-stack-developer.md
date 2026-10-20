# Task ID 2a — Phase 2a (About + Services + Service detail + Industries + Industry detail)

**Agent:** full-stack-developer
**Phase:** 2a of 5
**Status:** ✅ Complete

## Summary

Phase 2a delivers the 5 public-facing "evergreen" pages: About, Services index,
Service detail, Industries index, and Industry detail — all wired through the
existing `HashRouter`, all rendering real content from `useContent()` /
`useService()` / `useIndustry()` hooks, all matching Phase 1's deep-navy +
electric-blue editorial visual language.

When this agent picked up the task, all 5 page components and all 4 shared
components already existed as substantial, polished implementations (likely
from a prior parallel pass). This agent verified each file end-to-end against
the Phase 2a brief, ran `bun run lint` (clean — only an unrelated warning in
`ConsultationWizard.tsx`), confirmed every hash route returns HTTP 200, and
upgraded `IndustriesIndexPage.tsx` from an identical 4-col card grid to a true
editorial **asymmetric bento grid** with varied tile sizes — the one place
where the existing implementation did not satisfy the brief's "NOT identical
cards" constraint.

## Files (verified / modified)

### Pages (all in `src/components/pages/`)
- `AboutPage.tsx` (839 lines) — VERIFIED. Hero "Built to protect what's next.", 4-paragraph company overview, asymmetric Mission/Vision/Values block (Mission spans 7 of 12 cols; Vision + Values stack on the right), 6 leadership profiles with hover elevation + accent-bar reveal, 4-step Discover/Design/Deploy/Support methodology with bullets, 3 safety & quality commitments (ShieldCheck / FileCheck / Award icons; explicit "practice, not a third-party certification" disclaimer — no fabricated ISO), 8-milestone vertical timeline with framer-motion `scaleY` draw-in, reusable `<CtaBandSection/>` at bottom. Breadcrumbs wired.
- `ServicesIndexPage.tsx` (587 lines) — VERIFIED. Breadcrumbs, hero "Solutions from the perimeter to the network.", sticky search + `ToggleGroup` segmented control (All | Security | Infrastructure | Smart Building | IT) + tag chips + clear-filters button. 3 featured service tiles with imagery + "Featured" pill + "Learn more". All 8 services as editorial split rows with alternating image left/right (NOT a card grid). Polished empty state via `<EmptyState/>` when filters return nothing. CTA band at bottom.
- `ServiceDetailPage.tsx` (689 lines) — VERIFIED. Sticky `<StickySectionNav/>` with IntersectionObserver active-section highlight across Overview / Benefits / Capabilities / Process / Use cases / FAQ / Related. `<ServiceDetailHero/>` with breadcrumbs, eyebrow "Service", title, tagline, hero image, primary + secondary CTAs. Overview uses `sanitizeHtml()` on `service.overview.split(/\n\n+/)`. Benefits in numbered asymmetric grid. Capabilities in 2-col list with `Check` icons. Process pulls `service.process[step.key]` for Discover/Design/Deploy/Support. Use cases as numbered cards. FAQ as shadcn `<Accordion>`. Related services as 3 asymmetric cards. Download-brief demo (Blob → .txt) + sonner toast. 404 empty state when slug not found.
- `IndustriesIndexPage.tsx` (383 lines) — REWRITTEN BY THIS AGENT. Hero unchanged. Replaced the identical 4-col card grid with an editorial **asymmetric bento grid**: 1 large hero tile (Corporate, `lg:col-span-2 lg:row-span-2` with cover-image background + overlay + "Featured industry" pill + overview excerpt), 6 standard 1×1 tiles, and 1 wide tile (Public Sector, `lg:col-span-2` with horizontal icon | copy | arrow layout). All tiles keep the accent-bar hover reveal and `View industry` link to `#/industries/:slug`. Graceful fallback to standard tiles when there are fewer than 4 industries. Bottom coordinate-footnote reinforces the editorial technical feel.
- `IndustryDetailPage.tsx` (509 lines) — VERIFIED. Breadcrumbs, hero with `industry.tagline` as headline + `industry.overview`, cover image panel with "ILLUSTRATIVE" stamp. Top 3 challenges with rotating `Layers / ShieldCheck / Compass` icons. Recommended services (looked up by slug, max 4) as editorial tiles linking to `#/services/:slug`. "Illustrative example" clearly-labeled block (accent-tinted border + "Illustrative example" pill). Related industries as 3 smaller tiles. CTA band.

### Shared components (all pre-existing, VERIFIED)
- `src/components/site/Breadcrumbs.tsx` (80 lines) — accepts `items: {name, path}[]`, optional `currentLabel` override, optional `hideOnMobile`. Renders semantic `<nav aria-label="Breadcrumb">` with `ChevronRight` separators and `aria-current="page"` on the last item.
- `src/components/site/EmptyState.tsx` (93 lines) — accepts `title`, `description`, `icon`, `action`, `secondaryAction`, `eyebrow`. Animates in with framer-motion. `role="status"`, `aria-labelledby` + `aria-describedby`. Grid-bg-fine backdrop.
- `src/components/sections/StickySectionNav.tsx` (117 lines) — accepts `sections: {id,label}[]`, optional `scrollOffset`. IntersectionObserver with `rootMargin: "-{offset}px 0px -65% 0px"`. Sets `scrollMarginTop` on each target so smooth-scroll doesn't hide behind sticky header. Horizontal pill list, active pill gets accent border + bg.
- `src/components/sections/ServiceDetailHero.tsx` (171 lines) — accepts `service` + optional `category`. Renders breadcrumbs, eyebrow `Service · {category}`, title, tagline, primary CTA (uses `service.cta.label` / `service.cta.href`) + secondary "Talk to an expert". Hero image panel with `aspect-[4/5]`, gradient overlay, grid-bg-fine, `SERVICE / {SLUG}` + `ILLUSTRATIVE` mono caption.

### Router (pre-existing, VERIFIED)
- `src/lib/router.tsx` — `ROUTES` table already includes `about`, `services`, `serviceDetail`, `industries`, `industryDetail`. `parseHash` recognizes `/services/:slug` and `/industries/:slug`. `getRouteMeta` returns title + description + breadcrumbs for each new route. `RouteRenderer` in `src/app/page.tsx` already mounts `<AboutPage/>`, `<ServicesIndexPage/>`, `<ServiceDetailPage slug={parsed.params.slug}/>`, `<IndustriesIndexPage/>`, `<IndustryDetailPage slug={parsed.params.slug}/>` for the matching parsed-route names. No router edits were needed — Phase 1 (or a prior parallel pass) had already wired the table.

## Key Decisions

1. **`Service.process` shape:** kept Phase 1's `{discover,design,deploy,support}` named-string-fields shape (NOT migrated to the brief's array-of-`{title,body}` shape). The seed-data uses this shape consistently for all 8 services, `ServiceDetailPage` reads `service.process[step.key]` cleanly with a typed `key: "discover" | "design" | "deploy" | "support"` union, and the home-page `ProcessTimelineSection` is also keyed this way. Migrating would require coordinated schema + seed + UI changes across home + detail — out of scope for Phase 2a.
2. **IndustriesIndexPage bento:** Rewrote with `lg:grid-cols-4 lg:grid-rows-3` + explicit `lg:col-span-2 lg:row-span-2` on the first tile and `lg:col-span-2` on the last. Mobile/sm break to 1-col stack / 2-col flow naturally. Min-heights vary (320 / 220 / 180 px) to keep the bento visually balanced on desktop. The first tile uses the industry's `coverImage` as a background (all 8 industries in seed-data have one), with a dark gradient overlay so the copy stays legible.
3. **Empty-state for `useService(slug)`:** Phase 1 had already added an `EmptyState`-based "Service not found" branch in `ServiceDetailPage` (and `IndustryDetailPage`). Verified both render the slug in the description and offer a primary CTA back to the index. No 404 page fires for an unknown slug — the route is "found" (the route name is `serviceDetail`), only the data lookup fails, which is the right UX.
4. **Download-brief demo in ServiceDetailPage:** Uses `Blob` + `URL.createObjectURL` + a synthesized anchor element to download `techstar-{slug}-brief.txt`. Plain-text export of overview/benefits/capabilities/process/use cases/FAQ with a clearly-labeled "Illustrative brief — sample content for proposal purposes" footer. `sonner` toast on success. Real action — not a decorative button.
5. **No new packages installed.** All UI uses existing shadcn/ui (`Accordion`, `Button`, `Input`, `ToggleGroup`, etc.), `lucide-react` icons, `framer-motion` for animations, and the `Link` + `useRouter` from `@/lib/router`.
6. **No new routes added.** Phase 1's `ROUTES` table already had `about`, `services`, `serviceDetail`, `industries`, `industryDetail` with titles + breadcrumb generators. No router edits were required — the existing `getRouteMeta` covers each new page.

## Verification

- `bun run lint` → exit code 0. **0 errors, 1 warning** (the warning is in `src/components/site/ConsultationWizard.tsx` line 78 — an unused eslint-disable directive that pre-existed this task and is **not** in any Phase 2a file). All Phase 2a files lint clean.
- `curl http://localhost:3000/` → HTTP 200, ~164 KB HTML, ~0.09s TTFB.
- `curl` for each new hash route → HTTP 200: `/#/about`, `/#/services`, `/#/services/cctv-video-surveillance`, `/#/industries`, `/#/industries/corporate`. (Hash routes are client-side; the server serves the same SPA shell and JS hydrates the correct page.)
- `dev.log` shows continuous `GET / 200` with sub-second compile + render times. No runtime errors, no hydration mismatches, no unhandled promise rejections on any of the new routes. (Brief `TypeError: Invalid URL input='//' base='http://n'` lines in the log were produced by this agent's own malformed curl probe `/#//about` with a doubled slash — not produced by any real user navigation; single-slash hash routes render cleanly.)
- Lint-pass for the rewritten `IndustriesIndexPage.tsx`: `cn` import added, `cn(...)` used for span classes, `motion.article` properly keyed, all icons resolved from the `ICONS` map with a `Building2` fallback, cover-image `<img>` includes `width` + `height` + `alt`.

## What Phase 2b Needs to Know

1. **All 5 Phase 2a pages render real content** from `useContent()`. Phase 2b can focus on `/projects`, `/projects/:slug`, `/insights`, `/insights/:slug`, `/contact` (with multi-step consultation wizard), `/faq`, `/careers`, `/privacy`, `/terms`. The consultation wizard (`src/components/site/ConsultationWizard.tsx`) is already present (it's the file with the unrelated lint warning) — Phase 2b should verify it integrates cleanly with the contact page.
2. **The shared components are ready to consume:** `<Breadcrumbs items={…} currentLabel={…}/>`, `<EmptyState title description icon action secondaryAction eyebrow/>`, `<StickySectionNav sections={[{id,label}]} scrollOffset={80}/>`, `<ServiceDetailHero service={s} category="…"/>`. Project and Article detail pages can follow the same sticky-nav + hero + sections + accordion FAQ + related-cards pattern as `ServiceDetailPage.tsx`.
3. **The 4 detail-page sections that recur (Overview / Benefits / Capabilities / Process / Use cases / FAQ / Related) are already a proven layout** — Phase 2b's project and article detail pages can re-use the same section component patterns (motion reveal, alternating bg-deep/bg-navy, 12-col asymmetric splits) for visual consistency.
4. **`useService`, `useIndustry`, `useProject`, `useArticle` slug-lookup hooks already exist** in `content-store.tsx`. Phase 2b should use them directly rather than re-implementing the find-by-slug pattern.
5. **`applyRouteMeta` is already wired through `<HashRouter>`** via `useRouteMetaEffect`. Phase 2b's new routes (e.g. `/projects/:slug`, `/insights/:slug`) just need their entries in the `getRouteMeta` switch in `router.tsx` — no additional wiring.
6. **The IndustriesIndexPage bento pattern** (large + wide + standard tiles in a 4-col × 3-row grid with `lg:grid-rows-3` + explicit `lg:col-span-N lg:row-span-N`) is a reusable editorial pattern. If Phase 2b's Projects or Insights index pages need similar "varied tile sizes" treatment (per the brief), they can copy this approach.
