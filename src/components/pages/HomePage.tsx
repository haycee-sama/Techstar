"use client";

import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesOverviewSection } from "@/components/sections/ServicesOverviewSection";
import { InfrastructureDiagramSection } from "@/components/sections/InfrastructureDiagramSection";
import { CapabilitiesStatsSection } from "@/components/sections/CapabilitiesStatsSection";
import { IndustriesCarouselSection } from "@/components/sections/IndustriesCarouselSection";
import { FeaturedProjectsSection } from "@/components/sections/FeaturedProjectsSection";
import { ProcessTimelineSection } from "@/components/sections/ProcessTimelineSection";
import { LogoMarqueeSection } from "@/components/sections/LogoMarqueeSection";
import { TestimonialsSliderSection } from "@/components/sections/TestimonialsSliderSection";
import { InsightsCarouselSection } from "@/components/sections/InsightsCarouselSection";
import { CtaBandSection } from "@/components/sections/CtaBandSection";

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
