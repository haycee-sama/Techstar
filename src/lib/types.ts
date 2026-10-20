// ============================================================
// TECHSTAR — CONTENT DATA MODEL
// Single source of truth for the entire site (Phase 1-4).
// ============================================================

export type ThemeName = "dark" | "light";

export type Slug = string;

export interface SeoMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export interface Cta {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost" | "outline";
}

export interface SocialLink {
  id: string;
  platform: "linkedin" | "twitter" | "youtube" | "github" | "instagram" | "facebook" | "rss";
  url: string;
  handle?: string;
}

export interface ServiceCategory {
  slug: Slug;
  name: string;
  group: "Security" | "Infrastructure" | "Smart Building";
  description: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  categorySlug: Slug; // service slug or "general"
}

export interface Service {
  slug: Slug;
  categorySlug: Slug;
  title: string;
  tagline: string;
  overview: string; // 3-4 paragraph editorial copy (use \n\n between paragraphs)
  heroMedia?: string; // media id or URL
  benefits: { title: string; description: string }[];
  capabilities: string[];
  process: {
    discover: string;
    design: string;
    deploy: string;
    support: string;
  };
  useCases: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  relatedServiceSlugs: Slug[];
  cta?: Cta;
  seo: SeoMeta;
  icon?: string; // lucide icon name string
  status?: "active" | "coming-soon" | "retired";
}

export interface Industry {
  slug: Slug;
  name: string;
  tagline: string;
  overview: string;
  challenges: string[];
  recommendedServiceSlugs: Slug[];
  illustrativeExample: {
    title: string;
    description: string;
  };
  icon?: string;
  coverImage?: string;
}

export interface Project {
  slug: Slug;
  title: string;
  client: string;
  location: string;
  year: number;
  categories: string[];
  challenge: string; // multi-paragraph
  solution: string;
  implementation: string;
  outcomes: { label: string; value: string }[];
  gallery: string[];
  relatedProjectSlugs: Slug[];
  status: "completed" | "ongoing" | "planned";
  coverImage?: string;
  illustrative: true; // always true for proposal demo
  featured?: boolean;
}

export interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  social: SocialLink[];
}

export interface Article {
  slug: Slug;
  title: string;
  excerpt: string;
  body: string; // HTML (TipTap-compatible)
  authorId: string;
  publishedAt: string; // ISO date
  readingMinutes: number;
  tags: string[];
  categorySlug: Slug;
  coverImage?: string;
  seo: SeoMeta;
  status: "published" | "draft";
  featured?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  social: SocialLink[];
  order?: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  illustrative: true;
}

/**
 * Legal page (Privacy Policy, Terms of Service, Cookie Policy).
 * Body is markdown source (rendered with react-markdown on the public side).
 */
export interface LegalPage {
  slug: Slug;
  title: string;
  /** Markdown source. */
  body: string;
  updatedAt: string;
}

/**
 * Admin-configurable form definition. Phase 3b persists these to the
 * content store; public form rendering will consume them in Phase 4+.
 */
export interface FormFieldDefinition {
  id: string;
  label: string;
  /** HTML input type — text, email, tel, textarea, select, checkbox, radio. */
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "radio";
  name: string;
  required: boolean;
  placeholder?: string;
  /** For select/radio — list of option labels. */
  options?: string[];
  /** Optional validation hint (e.g. "min 30 chars"). */
  validationHint?: string;
}

export interface FormDefinition {
  id: string;
  title: string;
  description?: string;
  /** Where this form lives on the public site. */
  placement: "contact" | "newsletter" | "consultation" | "footer";
  fields: FormFieldDefinition[];
  submitLabel: string;
  /** Where the form submits to (demo: just toast). */
  submitEndpoint?: string;
  active: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  children?: {
    label: string;
    href: string;
    description?: string;
    group?: string;
  }[];
}

export interface FooterLinkGroup {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}

export interface Announcement {
  id: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
  active: boolean;
  startAt?: string;
  endAt?: string;
}

export type InquiryStatus = "new" | "in-review" | "qualified" | "won" | "lost" | "archived";

export interface Inquiry {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  location?: string;
  serviceSlug?: Slug;
  projectType?: string;
  budget?: string;
  message: string;
  preferredContact?: "email" | "phone" | "either";
  consent: boolean;
  status: InquiryStatus;
  createdAt: string;
}

export interface CookiePreferences {
  essential: true; // always true
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  savedAt?: string;
}

export interface MediaAsset {
  id: string;
  type: "image" | "video" | "document" | "audio";
  url: string;
  title: string;
  description?: string;
  alt: string;
  width?: number;
  height?: number;
  fileName?: string;
  createdAt: string;
  tags?: string[];
}

export interface BrandSettings {
  companyName: string;
  tagline: string;
  shortDescription: string;
  /**
   * Logo treatment. Extended in Phase 4 to support full / mark-only /
   * wordmark-only variants. Legacy "default" is treated as "full".
   */
  logoVariant: "default" | "full" | "mark-only" | "wordmark-only";
  colors: {
    primary: string;
    accent: string;
    accentCyan: string;
    /** Phase 4 — extended palette. Optional for backward compatibility. */
    accentBright?: string;
    bgDeep?: string;
    bgNavy?: string;
    /**
     * Phase 4b — text color tokens. Optional for backward compatibility
     * with seed/export files that don't carry them yet; the settings
     * panel surfaces color pickers for each. When omitted, the
     * globals.css defaults continue to apply.
     */
    textPrimary?: string;
    textSecondary?: string;
    textMuted?: string;
  };
  typography: {
    display: string;
    body: string;
  };
}

export interface GlobalSettings {
  brand: BrandSettings;
  contact: {
    email: string;
    phone: string;
    addressSample: string;
    hours: { day: string; hours: string }[];
    /** Optional map embed URL (Google Maps iframe, OpenStreetMap, etc.). */
    mapEmbedUrl?: string;
  };
  socials: SocialLink[];
  defaultSeo: SeoMeta;
  /** Canonical base URL used to construct absolute URLs (e.g. https://techstar.example). */
  canonicalBaseUrl?: string;
  /** Default robots directive (`index,follow` by default). */
  robotsDirective?: string;
  /** Phase 4 — extended header/footer variants. Legacy "default" still supported. */
  headerVariant: "default" | "full" | "minimal" | "with-announcement";
  footerVariant: "default" | "full" | "minimal";
  cookieText: string;
  cookieConsentExpiryDays?: number;
  /**
   * Phase 4b — default cookie consent categories shown pre-checked
   * when the cookie banner first appears. Necessary is always on
   * regardless (it can't be opted out of). Used by the cookie banner
   * to seed the default checkboxes.
   */
  defaultCookiePrefs?: {
    analyticsDefaultOff: boolean;
    marketingDefaultOff: boolean;
    functionalDefaultOn: boolean;
  };
  ctas: {
    primary: Cta;
    secondary?: Cta;
    /** Optional floating CTA (right-edge chat-style button). */
    floating?: Cta;
    /** Optional contact-section CTA. */
    contact?: Cta;
  };
  /** Phase 4 — default header/footer variants for newly created pages. */
  defaultPageLayout?: {
    header: GlobalSettings["headerVariant"];
    footer: GlobalSettings["footerVariant"];
  };
}

/**
 * Section types supported by the Phase 4 visual builder. Each type maps to
 * a renderer entry in `src/components/builder/SectionRenderer.tsx` and to a
 * library entry in `src/lib/section-library.ts`. The home page (HomePage)
 * composes section components directly and does NOT read from
 * `PageContent.sections` — the builder preview route (`#/preview/:slug`)
 * is what renders sections from this array.
 */
export type SectionType =
  | "hero"
  | "split-image"
  | "services-grid"
  | "services-editorial"
  | "infrastructure-diagram"
  | "stats"
  | "logos"
  | "testimonials"
  | "projects"
  | "articles"
  | "gallery"
  | "video"
  | "before-after"
  | "accordion"
  | "timeline"
  | "cta"
  | "contact-form"
  | "map"
  | "custom-html";

export interface SectionSettings {
  spacing?: "compact" | "normal" | "spacious" | "relaxed";
  alignment?: "left" | "center" | "right";
  themeVariant?: "default" | "inverted" | "muted";
  width?: "narrow" | "default" | "normal" | "wide" | "full";
}

export interface Section<TData = Record<string, unknown>> {
  id: string;
  type: SectionType;
  variant?: string;
  data: TData;
  visible: boolean;
  settings: SectionSettings;
}

export type PageStatus = "draft" | "published" | "archived";

/**
 * Snapshot of the published version of a page. Captured at publish time and
 * kept around so the editor can show "live" vs "draft" comparisons and so
 * the public site can render the published version (Phase 3b wiring).
 */
export interface PublishedPageSnapshot {
  title: string;
  excerpt?: string;
  bodyHtml?: string;
  featuredImage?: string;
  authorId?: string;
  seo: SeoMeta;
  publishedAt: string;
}

export interface PageContent {
  slug: Slug;
  title: string;
  status: PageStatus;
  sections: Section[];
  seo: SeoMeta;
  publishedAt?: string;
  updatedAt: string;
  // ---- Phase 3a editor-managed fields ----
  /** Short editorial summary (shown in listings + feeds). Optional. */
  excerpt?: string;
  /**
   * Rich-text body. Stored as the markdown source produced by the
   * `@mdxeditor/editor` WYSIWYG. Despite the `Html` suffix (kept per Phase 3a
   * brief so the Phase 4 visual builder can consume the same field), the
   * contents are markdown — render with `react-markdown` on the public side.
   */
  bodyHtml?: string;
  /** Featured/cover image — either a MediaAsset id or a URL string. */
  featuredImage?: string;
  /** Author id (matches `Author.id`). */
  authorId?: string;
  /** Last-published snapshot. Captured when status transitions to `published`. */
  publishedSnapshot?: PublishedPageSnapshot;
  /**
   * Phase 4 — last-published section array. Captured when the visual
   * builder's "Publish" action runs. The public preview route
   * (`#/preview/:slug`) renders this array; the `?preview=true` query
   * renders the working `sections` draft instead.
   */
  publishedSections?: Section[];
}

export interface SectionLibraryItem {
  type: SectionType;
  name: string;
  description: string;
  /** Lucide icon name (resolved by SectionLibraryIcon helper). */
  icon: string;
  variants: string[];
  /** Factory returning a fresh default `data` object for this section type. */
  defaultData: () => Record<string, unknown>;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "administrator" | "editor" | "viewer";
  // Demo only — clearly labeled. No real auth in Phase 1-4.
  demoNote: string;
}

export interface AnalyticsSample {
  // Clearly labeled sample analytics data for the dashboard demo.
  label: string;
  period: string;
  metrics: {
    label: string;
    value: number;
    delta?: number;
    illustrative?: boolean;
  }[];
  timeseries?: { label: string; value: number }[];
  demoNote: string;
}

// ============================================================
// ROOT CONTENT STATE
// ============================================================
export interface ContentState {
  brand: BrandSettings;
  services: Service[];
  serviceCategories: ServiceCategory[];
  industries: Industry[];
  projects: Project[];
  articles: Article[];
  authors: Author[];
  team: TeamMember[];
  testimonials: Testimonial[];
  faqs: Faq[];
  navigation: NavItem[];
  footerLinks: FooterLinkGroup[];
  announcements: Announcement[];
  inquiries: Inquiry[];
  media: MediaAsset[];
  pages: PageContent[];
  legalPages: LegalPage[];
  forms: FormDefinition[];
  globalSettings: GlobalSettings;
}
