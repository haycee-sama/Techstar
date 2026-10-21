"use client";

import dynamic from "next/dynamic";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesOverviewSection } from "@/components/sections/ServicesOverviewSection";

// Below-the-fold sections are lazy-loaded into separate chunks so the
// initial JS bundle (and TBT) stays small. SSR is kept on so content
// is in the HTML for SEO + perceived performance — only the client-
// side hydration of these sections is deferred to a separate chunk
// that loads after the main bundle.
const InfrastructureDiagramSection = dynamic(
  () => import("@/components/sections/InfrastructureDiagramSection").then((m) => m.InfrastructureDiagramSection),
  { ssr: true, loading: () => <div className="h-[600px]" aria-hidden /> }
);
const CapabilitiesStatsSection = dynamic(
  () => import("@/components/sections/CapabilitiesStatsSection").then((m) => m.CapabilitiesStatsSection),
  { ssr: true, loading: () => <div className="h-[300px]" aria-hidden /> }
);
const IndustriesCarouselSection = dynamic(
  () => import("@/components/sections/IndustriesCarouselSection").then((m) => m.IndustriesCarouselSection),
  { ssr: true, loading: () => <div className="h-[400px]" aria-hidden /> }
);
const FeaturedProjectsSection = dynamic(
  () => import("@/components/sections/FeaturedProjectsSection").then((m) => m.FeaturedProjectsSection),
  { ssr: true, loading: () => <div className="h-[500px]" aria-hidden /> }
);
const ProcessTimelineSection = dynamic(
  () => import("@/components/sections/ProcessTimelineSection").then((m) => m.ProcessTimelineSection),
  { ssr: true, loading: () => <div className="h-[400px]" aria-hidden /> }
);
const LogoMarqueeSection = dynamic(
  () => import("@/components/sections/LogoMarqueeSection").then((m) => m.LogoMarqueeSection),
  { ssr: true, loading: () => <div className="h-[120px]" aria-hidden /> }
);
const TestimonialsSliderSection = dynamic(
  () => import("@/components/sections/TestimonialsSliderSection").then((m) => m.TestimonialsSliderSection),
  { ssr: true, loading: () => <div className="h-[400px]" aria-hidden /> }
);
const InsightsCarouselSection = dynamic(
  () => import("@/components/sections/InsightsCarouselSection").then((m) => m.InsightsCarouselSection),
  { ssr: true, loading: () => <div className="h-[500px]" aria-hidden /> }
);
const CtaBandSection = dynamic(
  () => import("@/components/sections/CtaBandSection").then((m) => m.CtaBandSection),
  { ssr: true, loading: () => <div className="h-[300px]" aria-hidden /> }
);

export function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesOverviewSection />
      <InfrastructureDiagramSection />
      <CapabilitiesStatsSection />
      <IndustriesCarouselSection />
      <FeaturedProjectsSection />
      <ProcessTimelineSection />
      <LogoMarqueeSection />
      <TestimonialsSliderSection />
      <InsightsCarouselSection />
      <CtaBandSection />
    </>
  );
}
