"use client";

import type { Section, SectionType } from "@/lib/types";

// Reused home-page section renderers — these read from the content
// store (services, testimonials, etc.) and render the same fixed
// editorial layout the public home page shows.
import { HeroSection } from "@/components/sections/HeroSection";
import { CtaBandSection } from "@/components/sections/CtaBandSection";
import { ServicesOverviewSection } from "@/components/sections/ServicesOverviewSection";
import { InfrastructureDiagramSection } from "@/components/sections/InfrastructureDiagramSection";
import { CapabilitiesStatsSection } from "@/components/sections/CapabilitiesStatsSection";
import { LogoMarqueeSection } from "@/components/sections/LogoMarqueeSection";
import { TestimonialsSliderSection } from "@/components/sections/TestimonialsSliderSection";
import { FeaturedProjectsSection } from "@/components/sections/FeaturedProjectsSection";
import { ProcessTimelineSection } from "@/components/sections/ProcessTimelineSection";
import { InsightsCarouselSection } from "@/components/sections/InsightsCarouselSection";

// New minimal builder section renderers — these read from
// `section.data` so the inspector can edit them end-to-end.
import { SplitImageSection } from "./sections/SplitImageSection";
import { ServicesGridSection } from "./sections/ServicesGridSection";
import { ServicesEditorialSection } from "./sections/ServicesEditorialSection";
import { GallerySection } from "./sections/GallerySection";
import { VideoSection } from "./sections/VideoSection";
import { BeforeAfterSection } from "./sections/BeforeAfterSection";
import { AccordionSection } from "./sections/AccordionSection";
import { TimelineSection } from "./sections/TimelineSection";
import { ContactFormSection } from "./sections/ContactFormSection";
import { MapSection } from "./sections/MapSection";
import { CustomHtmlSection } from "./sections/CustomHtmlSection";

interface SectionRendererProps {
  sections: Section[];
  /**
   * When true, the renderer will render placeholder blocks for hidden
   * sections (with reduced opacity + "Hidden" label) so the builder
   * canvas can show their position. When false (default), hidden
   * sections are skipped entirely.
   */
  showHiddenPlaceholders?: boolean;
}

const WIDTH_CLASSES: Record<string, string> = {
  narrow: "max-w-3xl",
  default: "max-w-[1320px]",
  normal: "max-w-[1320px]",
  wide: "max-w-[1536px]",
  full: "max-w-none",
};

const SPACING_CLASSES: Record<string, string> = {
  compact: "py-8 sm:py-10",
  normal: "py-12 sm:py-16",
  spacious: "py-16 sm:py-24",
  relaxed: "py-20 sm:py-28",
};

const ALIGNMENT_CLASSES: Record<string, string> = {
  left: "text-left",
  center: "text-center mx-auto",
  right: "text-right ml-auto",
};

/**
 * SectionRenderer iterates a `Section[]` array and dispatches each entry
 * to its matching renderer. The dispatch is split into:
 *
 * - Type-matched renderers (the case statement below) — these either
 *   reuse existing home-page sections (which read from the content
 *   store) or render minimal data-driven builder sections.
 * - Wrapper handling for visibility, spacing, alignment, themeVariant,
 *   and width — applied uniformly around every section.
 * - A fallback "Unknown section type" block for types not in the enum.
 *
 * The public preview route (`#/preview/:slug`) renders a page's
 * published (or draft when `?preview=true`) sections via this
 * component. The visual builder's center canvas uses the same
 * component to live-preview the draft as the user edits.
 */
export function SectionRenderer({
  sections,
  showHiddenPlaceholders = false,
}: SectionRendererProps) {
  if (!sections || sections.length === 0) {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center p-12 text-center"
        style={{ color: "var(--text-muted)" }}
      >
        <div>
          <p className="text-sm">This page has no sections yet.</p>
          <p className="mt-1 text-xs">
            Open the page in the visual builder and click &ldquo;Insert section&rdquo; to add one.
          </p>
        </div>
      </div>
    );
  }
  return (
    <>
      {sections.map((section) => (
        <SectionWrapper
          key={section.id}
          section={section}
          showPlaceholder={showHiddenPlaceholders}
        />
      ))}
    </>
  );
}

function SectionWrapper({
  section,
  showPlaceholder,
}: {
  section: Section;
  showPlaceholder: boolean;
}) {
  const width = section.settings?.width ?? "default";
  const spacing = section.settings?.spacing ?? "normal";
  const alignment = section.settings?.alignment;
  const themeVariant = section.settings?.themeVariant ?? "default";

  // Skip rendering hidden sections entirely on the public site.
  if (section.visible === false && !showPlaceholder) return null;

  // Hidden section placeholder (only when builder canvas requests it)
  if (section.visible === false && showPlaceholder) {
    return (
      <div
        className="relative"
        style={{ opacity: 0.45 }}
        aria-hidden={false}
      >
        <div
          className="border-y-2 border-dashed"
          style={{ borderColor: "var(--border-strong)" }}
        >
          <div className={`mx-auto px-4 py-8 sm:px-6 lg:px-8 ${WIDTH_CLASSES[width] ?? WIDTH_CLASSES.default}`}>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-wide"
              style={{
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
              }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: "var(--text-muted)" }} />
              Hidden section · {section.type}
            </span>
            <div className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Visible on this section&apos;s inspector — toggle visibility to show.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Theme variant wrapper
  const themeStyle: React.CSSProperties =
    themeVariant === "inverted"
      ? { backgroundColor: "var(--bg-deep)", color: "var(--text-primary)" }
      : themeVariant === "muted"
      ? { backgroundColor: "var(--bg-navy)", color: "var(--text-primary)" }
      : {};

  return (
    <div
      className={`section-wrap ${SPACING_CLASSES[spacing] ?? SPACING_CLASSES.normal}`}
      style={themeStyle}
      data-section-id={section.id}
      data-section-type={section.type}
    >
      <div
        className={[
          "px-4 sm:px-6 lg:px-8",
          WIDTH_CLASSES[width] ?? WIDTH_CLASSES.default,
          alignment ? ALIGNMENT_CLASSES[alignment] ?? "" : "",
        ].join(" ")}
      >
        <SectionContent section={section} />
      </div>
    </div>
  );
}

function SectionContent({ section }: { section: Section }) {
  const data = section.data as Record<string, unknown>;
  switch (section.type as SectionType) {
    case "hero":
      return <HeroSection />;
    case "cta":
      return <CtaBandSection />;
    case "services-grid":
      return <ServicesGridSection />;
    case "services-editorial":
      return section.variant === "list" ? <ServicesGridSection /> : <ServicesOverviewSection />;
    case "infrastructure-diagram":
      return <InfrastructureDiagramSection />;
    case "stats":
      // Reuse the home-page stats section when no `data.stats` is configured.
      // Otherwise render a minimal data-driven stats grid.
      return data.stats ? <MinimalStatsGrid data={data} /> : <CapabilitiesStatsSection />;
    case "logos":
      return <LogoMarqueeSection />;
    case "testimonials":
      return <TestimonialsSliderSection />;
    case "projects":
      return <FeaturedProjectsSection />;
    case "timeline":
      return <TimelineSection data={data} />;
    case "articles":
      return <InsightsCarouselSection />;
    case "split-image":
      return <SplitImageSection data={data} variant={section.variant} />;
    case "gallery":
      return <GallerySection data={data} />;
    case "video":
      return <VideoSection data={data} />;
    case "before-after":
      return <BeforeAfterSection data={data} />;
    case "accordion":
      return <AccordionSection data={data} />;
    case "contact-form":
      return <ContactFormSection data={data} />;
    case "map":
      return <MapSection data={data} />;
    case "custom-html":
      return <CustomHtmlSection data={data} />;
    default: {
      // Unknown section type — render a clearly-labeled placeholder so
      // the user knows the section exists but can't be displayed.
      // Use `never`-cast to help TS understand the switch is exhaustive.
      const _exhaustive: never = section.type;
      void _exhaustive;
      return <UnknownSectionType type={String(section.type)} />;
    }
  }
}

function UnknownSectionType({ type }: { type: string }) {
  return (
    <div
      className="rounded-lg border border-dashed p-6 text-center"
      style={{
        borderColor: "var(--danger, #ef4444)",
        backgroundColor: "color-mix(in srgb, var(--danger, #ef4444) 6%, var(--surface-1))",
      }}
    >
      <p
        className="text-sm font-semibold"
        style={{ color: "var(--danger, #ef4444)" }}
      >
        Unknown section type — cannot render
      </p>
      <p className="mt-1 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
        type = &ldquo;{type}&rdquo;
      </p>
      <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
        This section type is not in the SectionRenderer dispatch table.
        Either remove the section or extend the renderer to support it.
      </p>
    </div>
  );
}

// Local minimal stats renderer used when `data.stats` is provided —
// renders a clean 4-up stat grid without count-up animation (so it
// reflects inspector edits immediately).
function MinimalStatsGrid({ data }: { data: Record<string, unknown> }) {
  const stats = (data.stats as Array<{ value: string; label: string; illustrative?: boolean }>) ?? [];
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {stats.map((s, i) => (
        <div key={i} className="text-center">
          <div
            className="font-display font-semibold tracking-tight"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            {s.value}
          </div>
          <div className="mt-2 text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            {s.label}
            {s.illustrative ? <span aria-hidden> · Illustrative</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
