// ============================================================
// TECHSTAR — SECTION LIBRARY
// Catalog of insertable section types for the Phase 4 visual builder.
// Each entry declares the type, name, description, icon, variants,
// and a `defaultData` factory used when a new section is inserted.
// ============================================================

import type { SectionLibraryItem, SectionType } from "@/lib/types";

export const SECTION_LIBRARY: SectionLibraryItem[] = [
  {
    type: "hero",
    name: "Hero",
    description: "Headline-led hero with eyebrow, supporting copy, and primary CTA. Used at the top of a page.",
    icon: "Sparkles",
    variants: ["editorial", "centered", "split"],
    defaultData: () => ({
      eyebrow: "Integrated security · Infrastructure · Intelligence",
      heading: "Intelligent protection. Connected infrastructure.",
      body:
        "Techstar designs, deploys, and operates integrated security, networking, and life-safety systems — engineered as one program.",
      primaryCtaLabel: "Explore our solutions",
      primaryCtaHref: "#/services",
      secondaryCtaLabel: "Talk to an expert",
      secondaryCtaHref: "#/contact",
    }),
  },
  {
    type: "split-image",
    name: "Split image",
    description: "Asymmetric two-column layout: image on one side, eyebrow + heading + body + CTA on the other.",
    icon: "PanelsTopLeft",
    variants: ["left-image", "right-image", "stacked"],
    defaultData: () => ({
      eyebrow: "Eyebrow",
      heading: "Headline goes here",
      body:
        "Supporting copy. Use two to three short sentences with a clear single intent — this is editorial, not a brochure.",
      image: "https://placehold.co/1200x900/0A0F1F/3B82F6?text=Techstar",
      imageAlt: "Descriptive alt text",
      ctaLabel: "Call to action",
      ctaHref: "#/contact",
    }),
  },
  {
    type: "services-grid",
    name: "Services — grid",
    description: "Compact grid of all services from the content store, with icons and short taglines.",
    icon: "LayoutGrid",
    variants: ["grid", "compact"],
    defaultData: () => ({}),
  },
  {
    type: "services-editorial",
    name: "Services — editorial",
    description: "Editorial layout: flagship services called out with detailed cards, remaining services listed inline.",
    icon: "Newspaper",
    variants: ["flagship", "list"],
    defaultData: () => ({}),
  },
  {
    type: "infrastructure-diagram",
    name: "Infrastructure diagram",
    description: "Interactive ring diagram showing how perimeter, building, floor, asset, and data layers stack.",
    icon: "Target",
    variants: ["rings", "stack"],
    defaultData: () => ({}),
  },
  {
    type: "stats",
    name: "Stats",
    description: "Editorial stat band with optional count-up animation. Clearly mark illustrative figures.",
    icon: "BarChart3",
    variants: ["default", "condensed"],
    defaultData: () => ({
      stats: [
        { value: "24/7", label: "Monitoring operations" },
        { value: "8", label: "Core service domains" },
        { value: "1,200+", label: "Devices integrated", illustrative: true },
        { value: "99.9%", label: "Target system uptime", illustrative: true },
      ],
    }),
  },
  {
    type: "logos",
    name: "Logos",
    description: "Marquee of illustrative partner brands. Clearly labeled illustrative.",
    icon: "GalleryVerticalEnd",
    variants: ["default", "static"],
    defaultData: () => ({
      heading: "Illustrative partner brands",
    }),
  },
  {
    type: "testimonials",
    name: "Testimonials",
    description: "Auto-advancing quote carousel. Illustrative quotes — replace before launch.",
    icon: "Quote",
    variants: ["slider", "stacked"],
    defaultData: () => ({}),
  },
  {
    type: "projects",
    name: "Projects",
    description: "Featured projects grid pulled from the content store. Filters by featured flag.",
    icon: "Building2",
    variants: ["grid", "list"],
    defaultData: () => ({}),
  },
  {
    type: "articles",
    name: "Articles",
    description: "Carousel of the most recent published articles.",
    icon: "FileText",
    variants: ["carousel", "list"],
    defaultData: () => ({}),
  },
  {
    type: "gallery",
    name: "Gallery",
    description: "Asymmetric image gallery. Reads the `images` array from section data.",
    icon: "Images",
    variants: ["masonry", "grid"],
    defaultData: () => ({
      heading: "Gallery",
      images: [
        { url: "https://placehold.co/800x600/0A0F1F/3B82F6?text=Gallery+1", alt: "Gallery image 1" },
        { url: "https://placehold.co/800x600/11182A/22D3EE?text=Gallery+2", alt: "Gallery image 2" },
        { url: "https://placehold.co/800x600/060A14/60A5FA?text=Gallery+3", alt: "Gallery image 3" },
        { url: "https://placehold.co/800x600/18203A/10B981?text=Gallery+4", alt: "Gallery image 4" },
      ],
    }),
  },
  {
    type: "video",
    name: "Video",
    description: "Responsive video embed. Accepts YouTube URLs or direct mp4 links.",
    icon: "Video",
    variants: ["youtube", "mp4"],
    defaultData: () => ({
      heading: "Watch",
      body: "Short caption describing the video.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      posterImage: "",
    }),
  },
  {
    type: "before-after",
    name: "Before / After",
    description: "Slider comparing two images (before and after). Pure CSS + pointer events.",
    icon: "SplitSquareHorizontal",
    variants: ["slider", "stacked"],
    defaultData: () => ({
      heading: "Before / after",
      beforeImage: "https://placehold.co/1200x800/11182A/EF4444?text=Before",
      beforeAlt: "Before",
      afterImage: "https://placehold.co/1200x800/0A0F1F/10B981?text=After",
      afterAlt: "After",
    }),
  },
  {
    type: "accordion",
    name: "Accordion",
    description: "Generic accordion (NOT FAQ-specific). Reads `items` from section data.",
    icon: "ChevronsDownUp",
    variants: ["single", "multi"],
    defaultData: () => ({
      heading: "Accordion",
      items: [
        { title: "First item", body: "Body copy for the first accordion item." },
        { title: "Second item", body: "Body copy for the second accordion item." },
        { title: "Third item", body: "Body copy for the third accordion item." },
      ],
    }),
  },
  {
    type: "timeline",
    name: "Timeline",
    description: "Vertical or horizontal timeline with labels and descriptions.",
    icon: "GitCommitVertical",
    variants: ["vertical", "horizontal"],
    defaultData: () => ({
      heading: "How we work",
      items: [
        { label: "Discover", description: "We map your facility, your risks, your operations, and your worst-day assumptions." },
        { label: "Design", description: "Coverage, identity, network, and lifecycle specified as one system." },
        { label: "Deploy", description: "Disciplined installation against the design — coordinated, documented, and verified." },
        { label: "Support", description: "Operated 24/7 against the worst day of your year." },
      ],
    }),
  },
  {
    type: "cta",
    name: "CTA band",
    description: "Full-width call-to-action band with primary + secondary buttons.",
    icon: "Megaphone",
    variants: ["centered", "split"],
    defaultData: () => ({
      eyebrow: "Let's design your security posture",
      heading: "One conversation. One accountable partner.",
      body:
        "Tell us about your facility and the outcomes you actually need. We will propose a path forward — no automated funnel, no commitment, no theatre. Just the design.",
      primaryCtaLabel: "Request a consultation",
      primaryCtaHref: "#/contact",
      secondaryCtaLabel: "Explore solutions",
      secondaryCtaHref: "#/services",
    }),
  },
  {
    type: "contact-form",
    name: "Contact form",
    description: "Standard contact form with name, email, phone, service, message. Submissions stay local (demo).",
    icon: "Mail",
    variants: ["default", "split"],
    defaultData: () => ({
      heading: "Talk to Techstar",
      body: "Send us a message — we'll respond within one business day.",
      submitLabel: "Send message",
    }),
  },
  {
    type: "map",
    name: "Map",
    description: "Map placeholder (SVG) or iframe embed. Clearly labeled sample location.",
    icon: "MapPin",
    variants: ["placeholder", "embed"],
    defaultData: () => ({
      heading: "Service area",
      body: "Sample address — replace before launch.",
      embedUrl: "",
    }),
  },
  {
    type: "custom-html",
    name: "Custom HTML",
    description: "Raw HTML block. Sanitized before render — script/iframe/inline-event handlers are stripped.",
    icon: "Code2",
    variants: ["raw"],
    defaultData: () => ({
      html: "<div style=\"padding:2rem;border:1px dashed #94a3b8;border-radius:0.5rem;text-align:center\">Custom HTML block — edit in the inspector.</div>",
    }),
  },
];

/**
 * Resolve a section type to its library entry. Returns undefined if not found.
 */
export function getSectionLibraryItem(type: SectionType): SectionLibraryItem | undefined {
  return SECTION_LIBRARY.find((i) => i.type === type);
}
