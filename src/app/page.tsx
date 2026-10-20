"use client";

import dynamic from "next/dynamic";

import { HashRouter, useRouter } from "@/lib/router";
import { ContentStoreProvider } from "@/lib/content-store";
import { AnnouncementStrip } from "@/components/site/AnnouncementStrip";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BackToTop } from "@/components/site/BackToTop";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { FloatingConsultation } from "@/components/site/FloatingConsultation";
import { CookieBanner } from "@/components/site/CookieBanner";
import { OfflineState } from "@/components/site/OfflineState";
import { CommandPaletteMount } from "@/components/site/CommandPalette";
import { HomePage } from "@/components/pages/HomePage";
import { AboutPage } from "@/components/pages/AboutPage";
import { ServicesIndexPage } from "@/components/pages/ServicesIndexPage";
import { ServiceDetailPage } from "@/components/pages/ServiceDetailPage";
import { IndustriesIndexPage } from "@/components/pages/IndustriesIndexPage";
import { IndustryDetailPage } from "@/components/pages/IndustryDetailPage";
import { ProjectsIndexPage } from "@/components/pages/ProjectsIndexPage";
import { ProjectDetailPage } from "@/components/pages/ProjectDetailPage";
import { InsightsIndexPage } from "@/components/pages/InsightsIndexPage";
import { ArticleDetailPage } from "@/components/pages/ArticleDetailPage";
import { ContactPage } from "@/components/pages/ContactPage";
import { FaqPage } from "@/components/pages/FaqPage";
import { PrivacyPage } from "@/components/pages/PrivacyPage";
import { TermsPage } from "@/components/pages/TermsPage";
import { CookiePreferencesPage } from "@/components/pages/CookiePreferencesPage";
import { NotFoundPage } from "@/components/pages/NotFoundPage";
import { ComingSoonPage } from "@/components/pages/ComingSoonPage";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoginPage } from "@/components/admin/LoginPage";
import { DashboardHome } from "@/components/admin/DashboardHome";
import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";
import { PageEditor } from "@/components/admin/PageEditor";
import { PagesTable } from "@/components/admin/PagesTable";
import { ServicesTable } from "@/components/admin/ServicesTable";
import { ServiceEditor } from "@/components/admin/ServiceEditor";
import { ProjectsTable } from "@/components/admin/ProjectsTable";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { ArticlesTable } from "@/components/admin/ArticlesTable";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { TeamTable } from "@/components/admin/TeamTable";
import { FaqsTable } from "@/components/admin/FaqsTable";
import { TestimonialsTable } from "@/components/admin/TestimonialsTable";
import { NavigationTable } from "@/components/admin/NavigationTable";
import { CtasTable } from "@/components/admin/CtasTable";
import { InquiriesTable } from "@/components/admin/InquiriesTable";
import { AnnouncementsTable } from "@/components/admin/AnnouncementsTable";
import { SeoTable } from "@/components/admin/SeoTable";
import { SocialTable } from "@/components/admin/SocialTable";
import { LegalTable } from "@/components/admin/LegalTable";
import { LegalEditor } from "@/components/admin/LegalEditor";
import { CookieSettings } from "@/components/admin/CookieSettings";
import { FormsTable } from "@/components/admin/FormsTable";
// Phase 4 — visual builder + media + settings
import { VisualBuilder } from "@/components/admin/VisualBuilder";
import { VisualBuilderOverview } from "@/components/admin/VisualBuilderOverview";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { PreviewPage } from "@/components/pages/PreviewPage";

// Lazy-load the interactive network globe on its dedicated route
const NetworkGlobePage = dynamic(
  () => import("@/components/pages/NetworkGlobePage").then((m) => m.NetworkGlobePage),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="eyebrow">Loading network globe…</div>
      </div>
    ),
  }
);

export default function Page() {
  return (
    <ContentStoreProvider>
      <HashRouter>
        <AppShell />
      </HashRouter>
    </ContentStoreProvider>
  );
}

function AppShell() {
  const { parsed } = useRouter();

  // Admin routes get their own shell — no public chrome.
  if (parsed.isAdmin) {
    // Login page is full-screen and unwrapped (no shell, no guard).
    if (parsed.path === "/admin/login") {
      return <LoginPage />;
    }
    // All other admin routes render through the AdminShell (sidebar + topbar).
    return <AdminShell>{dispatchAdminRoute(parsed)}</AdminShell>;
  }

  return (
    <div className="app-shell">
      <ScrollProgress />
      {/* Wrap announcement strip + header in a single fixed-position top
          stack so they don't conflict. Previously the Header was
          `position: fixed` while the AnnouncementStrip was in normal
          flow — the fixed Header overlapped the announcement. Now the
          shared container is fixed at top:0; the announcement sits
          above the header inside it; when dismissed the announcement
          height collapses to 0 and only the header remains. */}
      <div className="fixed inset-x-0 top-0 z-40 flex flex-col">
        <AnnouncementStrip />
        <Header />
      </div>
      <main id="main" className="flex-1">
        <RouteRenderer />
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

function dispatchAdminRoute(parsed: ReturnType<typeof useRouter>["parsed"]) {
  const segments = parsed.segments;

  // /admin → dashboard
  if (parsed.path === "/admin") {
    return <DashboardHome />;
  }

  // /admin/login (full-screen, no shell)
  if (parsed.path === "/admin/login") {
    return <LoginPage />;
  }

  // Page editor: /admin/pages/:slug
  if (segments.length === 3 && segments[1] === "pages") {
    return <PageEditor slug={decodeURIComponent(segments[2])} />;
  }

  // Service detail editor: /admin/services/:slug
  if (segments.length === 3 && segments[1] === "services") {
    return <ServiceEditor slug={decodeURIComponent(segments[2])} />;
  }

  // Project detail editor: /admin/projects/:slug
  if (segments.length === 3 && segments[1] === "projects") {
    return <ProjectEditor slug={decodeURIComponent(segments[2])} />;
  }

  // Article detail editor: /admin/articles/:slug
  if (segments.length === 3 && segments[1] === "articles") {
    return <ArticleEditor slug={decodeURIComponent(segments[2])} />;
  }

  // Legal editor: /admin/legal/:slug
  if (segments.length === 3 && segments[1] === "legal") {
    return <LegalEditor slug={decodeURIComponent(segments[2])} />;
  }

  // Visual builder: /admin/builder/:slug (BEFORE generic dispatch)
  if (segments.length === 3 && segments[1] === "builder") {
    return <VisualBuilder slug={decodeURIComponent(segments[2])} />;
  }

  // Top-level admin sections
  switch (parsed.path) {
    case "/admin/pages":
      return <PagesTable />;
    case "/admin/services":
      return <ServicesTable />;
    case "/admin/projects":
      return <ProjectsTable />;
    case "/admin/articles":
      return <ArticlesTable />;
    case "/admin/team":
      return <TeamTable />;
    case "/admin/faqs":
      return <FaqsTable />;
    case "/admin/testimonials":
      return <TestimonialsTable />;
    case "/admin/navigation":
      return <NavigationTable />;
    case "/admin/ctas":
      return <CtasTable />;
    case "/admin/inquiries":
      return <InquiriesTable />;
    case "/admin/announcements":
      return <AnnouncementsTable />;
    case "/admin/seo":
      return <SeoTable />;
    case "/admin/social":
      return <SocialTable />;
    case "/admin/legal":
      return <LegalTable />;
    case "/admin/cookie":
      return <CookieSettings />;
    case "/admin/forms":
      return <FormsTable />;
    case "/admin/builder":
      return <VisualBuilderOverview />;
    case "/admin/media":
      return <MediaLibrary />;
    case "/admin/settings":
      return <SettingsPanel />;
    default:
      // Any unknown admin path lands here — give a Phase 4-style
      // placeholder so the link isn't a dead end.
      return <AdminPlaceholder path={parsed.path} phase="4" />;
  }
}

function RouteRenderer() {
  const { parsed } = useRouter();

  switch (parsed.name) {
    case "home":
      return <HomePage />;
    case "about":
      return <AboutPage />;
    case "services":
      return <ServicesIndexPage />;
    case "serviceDetail":
      return <ServiceDetailPage slug={parsed.params.slug} />;
    case "industries":
      return <IndustriesIndexPage />;
    case "industryDetail":
      return <IndustryDetailPage slug={parsed.params.slug} />;
    case "projects":
      return <ProjectsIndexPage />;
    case "projectDetail":
      return <ProjectDetailPage slug={parsed.params.slug} />;
    case "insights":
      return <InsightsIndexPage />;
    case "articleDetail":
      return <ArticleDetailPage slug={parsed.params.slug} />;
    case "contact":
      return <ContactPage />;
    case "faq":
      return <FaqPage />;
    case "privacy":
      return <PrivacyPage />;
    case "terms":
      return <TermsPage />;
    case "cookiePreferences":
      return <CookiePreferencesPage />;
    case "network":
      return <NetworkGlobePage />;
    case "preview":
      return <PreviewPage slug={parsed.params.slug} />;
    case "careers":
      return (
        <ComingSoonPage
          title="Careers"
          description="Careers at Techstar — full job board, role pages, and application flow arrive in a future phase. For now, contact us at hello@techstar.example and tell us how you'd like to contribute."
        />
      );
    case "notFound":
      return <NotFoundPage />;
    default:
      return <NotFoundPage />;
  }
}
