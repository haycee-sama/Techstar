"use client";

import { type ReactNode } from "react";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { AnnouncementStrip } from "@/components/site/AnnouncementStrip";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BackToTop } from "@/components/site/BackToTop";
import { FloatingConsultation } from "@/components/site/FloatingConsultation";
import { CookieBanner } from "@/components/site/CookieBanner";
import { OfflineState } from "@/components/site/OfflineState";
import { CommandPaletteMount } from "@/components/site/CommandPalette";

/**
 * Public-site layout — wraps every public route (`/`, `/about`, `/services`,
 * `/services/[slug]`, etc.) with the shared site chrome: scroll progress,
 * announcement strip + header (stacked in one fixed-position top container),
 * main content, footer, back-to-top, floating consultation, cookie banner,
 * offline state, command palette.
 *
 * Lives in a Next.js route group `(public)` so the directory grouping
 * doesn't affect URLs — pages inside still serve clean paths like
 * `/about`, `/services/cctv-video-surveillance`, etc.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <ScrollProgress />
      {/* Shared fixed-position top stack — announcement strip above the
          header inside one container so they don't conflict. */}
      <div className="fixed inset-x-0 top-0 z-40 flex flex-col">
        <AnnouncementStrip />
        <Header />
      </div>
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <BackToTop />
      <FloatingConsultation />
      <CookieBanner />
      <OfflineState />
      <CommandPaletteMount />
    </div>
  );
}
