# Techstar — Security. Infrastructure. Intelligence.

A complete, production-ready frontend for a fictional integrated security & infrastructure company, featuring a public multi-page website + admin CMS with visual page builder.

**Live demo:** https://techstar-livid.vercel.app/

## Quick start

```bash
# Install dependencies
bun install

# Start dev server (http://localhost:3000)
bun run dev

# Lint
bun run lint

# Production build
bun run build
```

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack/webpack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui (New York)
- **Animation:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Rich text:** MDX Editor
- **Drag & drop:** @dnd-kit
- **Tables:** TanStack React Table
- **Carousels:** Embla Carousel React
- **Icons:** Lucide React
- **Theme:** next-themes (light / dark / system)
- **Database:** Prisma + SQLite (schema only — public site uses localStorage)

## Project structure

```
src/
  app/
    (public)/           # Public website routes (route group, no URL prefix)
      page.tsx           # Home (/)
      about/             # /about
      services/[slug]/   # /services/cctv-video-surveillance
      industries/[slug] # /industries/corporate
      projects/[slug]   # /projects/meridian-tower
      insights/[slug]   # /insights/designing-video-analytics
      contact/           # /contact
      faq/               # /faq
      privacy/           # /privacy
      terms/             # /terms
      ...
    admin/               # Admin CMS routes
      login/             # /admin/login (no shell)
      page.tsx           # /admin (dashboard)
      pages/[slug]/      # /admin/pages/home (page editor)
      builder/[slug]/    # /admin/builder/home (visual builder)
      media/             # /admin/media (media library)
      settings/          # /admin/settings (global settings)
      ...
    layout.tsx           # Root layout (ThemeProvider + ContentStoreProvider + AppRouter)
    sitemap.ts           # Auto-generated /sitemap.xml
    not-found.tsx        # 404 page
  components/
    brand/              # Techstar logo (inline SVG)
    site/               # Header, Footer, Header, CookieBanner, CommandPalette, etc.
    sections/           # Home page sections (Hero, Services, Stats, Testimonials, etc.)
    pages/              # Page components (HomePage, AboutPage, ServiceDetailPage, etc.)
    admin/              # Admin shell, CRUD tables, editors, DataTable, ConfirmDialog
    builder/            # WYSIWYG section renderer + section library
    ui/                 # shadcn/ui components
  lib/
    types.ts            # Content data model (Service, Project, Article, etc.)
    seed-data.ts        # All initial content (editable via admin)
    content-store.tsx   # React context with localStorage persistence
    router.tsx          # AppRouter (usePathname + next/link wrapper)
    section-library.ts  # WYSIWYG section type registry
    inquiry-schema.ts   # Contact form Zod schema
    seo.ts              # Route meta → document.title + meta tags
  hooks/                # useCountUp, useDebouncedValue, useMediaQuery, etc.
public/
  logo.svg              # Techstar favicon (hex shield mark)
  og-image.svg          # 1200×630 branded OpenGraph image
  manifest.json         # PWA manifest
  robots.txt            # Crawl directives
  placeholders/         # Branded SVG placeholders (license-free)
  media/                # Real images + CREDITS.md (see licensing note below)
```

## Routes

### Public
| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, services, stats, testimonials, insights |
| `/about` | Company overview, leadership, milestones |
| `/services` | Service directory with search + filter |
| `/services/[slug]` | Service detail (8 services: CCTV, Network, Fire, Cyber, Access, Intrusion, Smart, IT) |
| `/industries` | Industries served (8 sectors) |
| `/industries/[slug]` | Industry detail with challenges + recommended services |
| `/projects` | Project portfolio with category filter |
| `/projects/[slug]` | Project case study (illustrative) |
| `/insights` | Article listing with search + topic filter |
| `/insights/[slug]` | Article detail with social sharing |
| `/contact` | Contact form + multi-step consultation wizard + solution configurator |
| `/faq` | Searchable FAQ accordion |
| `/privacy` | Privacy policy (sample) |
| `/terms` | Terms of use (sample) |
| `/cookie-preferences` | Cookie consent management |
| `/network` | Interactive network globe (CSS/SVG) |

### Admin
| Route | Description |
|-------|-------------|
| `/admin/login` | Demo login (any credentials work) |
| `/admin` | Dashboard with sample analytics + recent inquiries |
| `/admin/pages` | Page CRUD table |
| `/admin/pages/[slug]` | Page editor (MDX rich text + SEO + draft/publish) |
| `/admin/services` | Service CRUD |
| `/admin/projects` | Project CRUD |
| `/admin/articles` | Article CRUD |
| `/admin/builder` | Visual page builder overview |
| `/admin/builder/[slug]` | WYSIWYG section editor (add/reorder/edit/publish) |
| `/admin/media` | Media library (IndexedDB upload + alt text) |
| `/admin/settings` | Brand colors, contact, social, SEO, import/export |

## Admin demo access

Navigate to `/admin/login` and enter any email + password. The login is client-side only — no real authentication. Admin edits persist to `localStorage`, not a shared database.

## Theme

Default is **light mode**. The theme toggle (top-right) cycles through:
1. ☀️ Light (always light)
2. 🌙 Dark (always dark)
3. 🖥️ System (follows OS preference)

Theme preference is stored in `localStorage` and survives refreshes.

## Deployment (Vercel)

1. Push to GitHub
2. Import at https://vercel.com/new
3. Vercel auto-detects Next.js 16 — accept defaults
4. Deploy

No environment variables required for the public site. The `DATABASE_URL` in `.env` is for the Prisma schema only (not used by the public site).

## Image licensing

**⚠️ Images in `public/media/` are for demonstration only.** See `public/media/CREDITS.md` for the full source list. Most images are from commercial websites (Alamy, Shutterstock, etc.) and are NOT licensed for production use. Replace with properly licensed photography from [Unsplash](https://unsplash.com), [Pexels](https://pexels.com), or [Pixabay](https://pixabay.com) before launch.

Brand-safe SVG placeholders in `public/placeholders/` are Techstar-original graphics with no copyright concerns.

## Demo limitations (honest disclosure)

| Feature | Status | Limitation |
|---------|--------|------------|
| Admin login | Demo | Client-side only, any credentials work, no real auth |
| Content editing | Demo | Persists to `localStorage` — not shared across devices |
| Form submission | Demo | Shows success toast, no email actually sent |
| Analytics charts | Demo | Hardcoded sample data |
| Media uploads | Demo | Stored in browser IndexedDB — not cloud-hosted |
| Theme switching | ✅ Production | Persists per-user via `localStorage` |
| Public routing | ✅ Production | Clean URLs, SSR, SEO metadata |
| Carousels | ✅ Production | Embla + keyboard + touch + reduced-motion |
| WYSIWYG builder | ✅ Production | Drag-reorder + inspector + draft/publish + undo/redo |

## License

This project is a demo for proposal purposes. All code is original. Images are sourced from the web and must be replaced before production (see CREDITS.md).
