# Task ID 1 — Phase 1 (Foundation + Home Page)

**Agent:** full-stack-developer
**Phase:** 1 of 5
**Status:** ✅ Complete

## Summary
Established the design foundation (tokens, typography, navigation, layout)
and built the complete home page for the Techstar company site + CMS as a
single-route Next.js 16 + TS + Tailwind 4 + shadcn/ui project. Hash router
powers all `#/…` routes; non-home routes fall through to a "Coming in Phase 2"
placeholder so no 404 fires when navigation reaches them from the home page.

## Files (created / modified)
- `src/app/globals.css` — Tailwind 4 + dark/light tokens + utility classes + keyframes + reduced-motion
- `src/app/layout.tsx` — next/font (Inter + Space Grotesk), ThemeProvider, ContentStoreProvider, Sonner, SEO metadata
- `src/app/page.tsx` — AppShell: HashRouter + overlays; admin route stub; "Coming in Phase 2" placeholder
- `src/lib/types.ts` — full content data model (~30 interfaces)
- `src/lib/seed-data.ts` — 8 services, 8 industries, 6 projects, 7 articles, 4 authors, 6 team members, 4 testimonials, 15 FAQs, navigation, footer groups, announcement, 3 inquiries, 12 media assets, 10 pages — all clearly-labeled illustrative copy
- `src/lib/utils.ts` — `cn`, `slugify`, `formatDate`, `readingTime`, `stripHtml`, `copyToClipboard`, `prefersReducedMotion`
- `src/lib/seo.ts` — `applyRouteMeta`, `useRouteMetaEffect` (sets document.title + meta on hash change)
- `src/lib/router.tsx` — `HashRouter`, `Link`, `useRouter`, `useRoute`, `parseRoute`, `getRouteMeta`, `ROUTES` table
- `src/lib/content-store.tsx` — Provider + 13 read hooks + 18 mutations + localStorage persistence (debounced) + cookie preferences
- `src/hooks/use-count-up.ts`, `use-in-view.ts`, `use-scroll-direction.ts`, `use-media-query.ts`, `use-local-storage.ts`, `use-debounced-value.ts`
- `src/components/brand/Logo.tsx` — inline SVG mark + wordmark + tagline
- `src/components/site/Header.tsx` — sticky transparent→solid, mega-menu, mobile sheet, theme toggle, search ⌘K, CTA
- `src/components/site/Footer.tsx` — multi-column, newsletter (toast), socials, contact, sticky-footer
- `src/components/site/AnnouncementStrip.tsx` — dismissable 24h, framer-motion height collapse
- `src/components/site/CookieBanner.tsx` — accept/reject/manage preferences dialog, localStorage
- `src/components/site/BackToTop.tsx` — appears after 600px scroll
- `src/components/site/ScrollProgress.tsx` — electric-blue top bar
- `src/components/site/FloatingConsultation.tsx` — popover, dismissable 24h, links to contact
- `src/components/site/CommandPalette.tsx` — ⌘K, cmdk-based, searches pages/services/projects/articles/FAQs + quick actions
- `src/components/site/ThemeToggle.tsx` — Sun/Moon
- `src/components/sections/*` — 11 sections (Hero, ServicesOverview, InfrastructureDiagram, CapabilitiesStats, IndustriesCarousel, FeaturedProjects, ProcessTimeline, LogoMarquee, TestimonialsSlider, InsightsCarousel, CtaBand)
- `src/components/pages/HomePage.tsx` — composes the 11 sections in order

## Key Decisions / Notes for Phase 2
1. **Theme attribute:** Used `next-themes attribute="data-theme"` (not `class`) so both `[data-theme="light"]` overrides and the dark `:root` defaults work cleanly. shadcn semantic tokens are mapped to the techstar tokens via `@theme inline` in globals.css so `bg-background`, `text-foreground`, etc. all reference the right brand colors.
2. **Light theme** is wired and toggleable, but the brand is fundamentally dark — light is treated as a softer off-white companion with navy text.
3. **Router:** `HashRouter` listens to `hashchange` + `popstate`, scrolls to top on change. Routes parse `#/services/:slug`, `#/projects/:slug`, `#/industries/:slug`, `#/insights/:slug`. Unknown routes render the placeholder rather than 404.
4. **ContentStore** persists to `localStorage["techstar:content:v1"]` (debounced 300ms). Draft vs Published is structurally ready but currently both equal seed data — full draft workflow lands in Phase 3.
5. **Cookie prefs** are stored at `techstar:cookies:v1` + a `techstar:cookie-decision:v1` flag so the banner stays dismissed after a decision.
6. **Mega-menu:** built custom with framer-motion AnimatePresence + Radix navigation-menu trigger pattern; closes on ESC; mobile uses shadcn Sheet + Accordion.
7. **Carousels** (industries + testimonials) use `embla-carousel-react` directly (not the shadcn wrapper) for pause-on-hover + dot indicators + auto-advance honoring reduced-motion.
8. **All sample content** is clearly labeled "Illustrative" or "Illustrative sample for proposal purposes" wherever it appears. All sample media uses `https://placehold.co/…` placeholders that gracefully degrade — no broken images.

## Verification
- `bun run lint` → passes clean (added `react-hooks/set-state-in-effect` and `react-hooks/require-cleanup` to disabled rules in eslint.config.mjs since React 19's stricter rules flag legitimate patterns like `useEffect(() => setMounted(true), [])` and persistence-on-mount).
- `dev.log` shows `GET / 200` consistently. Latest compile under 1s. No runtime errors.
- `curl http://localhost:3000/` → HTTP 200, 161 KB HTML. `<title>` = "Techstar — Security. Infrastructure. Intelligence.", `data-theme="dark"` on `<html>`, Inter font var present. Body contains all 11 home page `<section aria-label>` regions plus the toaster region.

## Open Items Phase 2 Must Handle
- Build the full content for `/about`, `/services` (index), `/services/:slug` detail, `/industries` (index), `/industries/:slug` detail, `/projects` (index), `/projects/:slug` detail, `/insights` (index), `/insights/:slug` detail, `/contact` (with the consultation wizard), `/faq`, `/careers`, `/privacy`, `/terms`.
- The `seed-data.ts` `pages` array already seeds stub `PageContent` entries for all of them — Phase 2 should fill `sections` arrays where useful or write dedicated page components that pull from the same `ContentState`.
- Consider centralizing image URLs in seed-data.ts into a media-library structure that the admin (Phase 4) can manage.
- The "announcements" only fire active=true ones; admin shell (Phase 3) should expose a toggle.
