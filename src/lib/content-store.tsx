"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Announcement,
  Article,
  BrandSettings,
  ContentState,
  CookiePreferences,
  Faq,
  FooterLinkGroup,
  FormDefinition,
  GlobalSettings,
  Inquiry,
  InquiryStatus,
  LegalPage,
  MediaAsset,
  NavItem,
  PageContent,
  Project,
  PublishedPageSnapshot,
  Service,
  SocialLink,
  TeamMember,
  Testimonial,
} from "@/lib/types";
import { seedData } from "@/lib/seed-data";

const STORAGE_KEY = "techstar:content:v1";
const COOKIE_KEY = "techstar:cookies:v1";
const SAVE_DEBOUNCE_MS = 300;

// ============================================================
// CONTEXT SHAPE
// ============================================================
interface ContentStoreContextValue {
  state: ContentState;
  isDirty: boolean;
  lastSavedAt: string | null;
  // Read hooks (data lookups)
  getService: (slug: string) => Service | undefined;
  getServices: () => Service[];
  getProject: (slug: string) => Project | undefined;
  getArticle: (slug: string) => Article | undefined;
  getAnnouncement: () => Announcement | undefined;
  getBrand: () => BrandSettings;
  getGlobalSettings: () => GlobalSettings;
  getInquiries: () => Inquiry[];
  getMedia: () => MediaAsset[];
  getPage: (slug: string) => PageContent | undefined;
  // Mutations
  updateBrand: (partial: Partial<BrandSettings>) => void;
  updateService: (slug: string, partial: Partial<Service>) => void;
  upsertService: (service: Service) => void;
  deleteService: (slug: string) => void;
  updateProject: (slug: string, partial: Partial<Project>) => void;
  upsertProject: (project: Project) => void;
  deleteProject: (slug: string) => void;
  updateArticle: (slug: string, partial: Partial<Article>) => void;
  upsertArticle: (article: Article) => void;
  deleteArticle: (slug: string) => void;
  upsertInquiry: (inquiry: Inquiry) => void;
  updateInquiryStatus: (id: string, status: InquiryStatus) => void;
  deleteInquiry: (id: string) => void;
  upsertMedia: (media: MediaAsset) => void;
  deleteMedia: (id: string) => void;
  upsertPage: (page: PageContent) => void;
  deletePage: (slug: string) => void;
  updatePage: (slug: string, partial: Partial<PageContent>) => void;
  updatePageSections: (slug: string, sections: PageContent["sections"]) => void;
  publishPage: (slug: string) => void;
  unpublishPage: (slug: string) => void;
  updateAnnouncement: (id: string, partial: Partial<Announcement>) => void;
  upsertAnnouncement: (a: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  updateGlobalSettings: (partial: Partial<GlobalSettings>) => void;
  // Team / Faqs / Testimonials / Social / Nav / Footer / Legal / Forms
  upsertTeam: (m: TeamMember) => void;
  deleteTeam: (id: string) => void;
  upsertFaq: (f: Faq) => void;
  deleteFaq: (id: string) => void;
  upsertTestimonial: (t: Testimonial) => void;
  deleteTestimonial: (id: string) => void;
  upsertSocial: (s: SocialLink) => void;
  deleteSocial: (id: string) => void;
  updateNavigation: (nav: NavItem[]) => void;
  updateFooterLinks: (groups: FooterLinkGroup[]) => void;
  upsertLegalPage: (p: LegalPage) => void;
  upsertForm: (f: FormDefinition) => void;
  deleteForm: (id: string) => void;
  importJson: (json: ContentState) => void;
  exportJson: () => ContentState;
  resetToSeed: () => void;
  // Cookie preferences
  cookiePrefs: CookiePreferences;
  setCookiePrefs: (prefs: CookiePreferences) => void;
}

const ContentStoreContext = createContext<ContentStoreContextValue | null>(null);

// Deep clone helper (state is plain JSON-safe)
function clone<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

const DEFAULT_COOKIE_PREFS: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: true,
};

// ============================================================
// PROVIDER
// ============================================================
export function ContentStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContentState>(() => clone(seedData));
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [cookiePrefs, setCookiePrefsState] = useState<CookiePreferences>(DEFAULT_COOKIE_PREFS);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Hydrate from localStorage on mount ----
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ContentState;
        // Light sanity check
        if (parsed && parsed.services && parsed.brand) {
          setState(parsed);
        }
      }
      const cookieRaw = window.localStorage.getItem(COOKIE_KEY);
      if (cookieRaw) {
        setCookiePrefsState(JSON.parse(cookieRaw) as CookiePreferences);
      }
    } catch {
      // fall back to seed
    }
    setHydrated(true);
  }, []);

  // ---- Persist (debounced) ----
  useEffect(() => {
    if (!hydrated) return;
    setIsDirty(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setLastSavedAt(new Date().toISOString());
        setIsDirty(false);
      } catch {
        // quota / unavailable
      }
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, hydrated]);

  // ---- Cookie prefs persistence ----
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(COOKIE_KEY, JSON.stringify(cookiePrefs));
    } catch {
      // ignore
    }
  }, [cookiePrefs, hydrated]);

  // ============================================================
  // READ LOOKUPS (memoized)
  // ============================================================
  const getService = useCallback(
    (slug: string) => state.services.find((s) => s.slug === slug),
    [state.services]
  );
  const getServices = useCallback(() => state.services, [state.services]);
  const getProject = useCallback(
    (slug: string) => state.projects.find((p) => p.slug === slug),
    [state.projects]
  );
  const getArticle = useCallback(
    (slug: string) => state.articles.find((a) => a.slug === slug),
    [state.articles]
  );
  const getAnnouncement = useCallback(
    () => state.announcements.find((a) => a.active) || undefined,
    [state.announcements]
  );
  const getBrand = useCallback(() => state.brand, [state.brand]);
  const getGlobalSettings = useCallback(() => state.globalSettings, [state.globalSettings]);
  const getInquiries = useCallback(() => state.inquiries, [state.inquiries]);
  const getMedia = useCallback(() => state.media, [state.media]);
  const getPage = useCallback(
    (slug: string) => state.pages.find((p) => p.slug === slug),
    [state.pages]
  );

  // ============================================================
  // MUTATIONS
  // ============================================================
  const updateBrand = useCallback((partial: Partial<BrandSettings>) => {
    setState((prev) => ({ ...prev, brand: { ...prev.brand, ...partial } }));
  }, []);

  const updateService = useCallback((slug: string, partial: Partial<Service>) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.slug === slug ? { ...s, ...partial } : s)),
    }));
  }, []);

  const upsertService = useCallback((service: Service) => {
    setState((prev) => {
      const exists = prev.services.some((s) => s.slug === service.slug);
      return {
        ...prev,
        services: exists
          ? prev.services.map((s) => (s.slug === service.slug ? service : s))
          : [...prev.services, service],
      };
    });
  }, []);

  const deleteService = useCallback((slug: string) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.slug !== slug),
    }));
  }, []);

  const updateProject = useCallback((slug: string, partial: Partial<Project>) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.slug === slug ? { ...p, ...partial } : p)),
    }));
  }, []);

  const upsertProject = useCallback((project: Project) => {
    setState((prev) => {
      const exists = prev.projects.some((p) => p.slug === project.slug);
      return {
        ...prev,
        projects: exists
          ? prev.projects.map((p) => (p.slug === project.slug ? project : p))
          : [...prev.projects, project],
      };
    });
  }, []);

  const deleteProject = useCallback((slug: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.slug !== slug),
    }));
  }, []);

  const updateArticle = useCallback((slug: string, partial: Partial<Article>) => {
    setState((prev) => ({
      ...prev,
      articles: prev.articles.map((a) => (a.slug === slug ? { ...a, ...partial } : a)),
    }));
  }, []);

  const upsertArticle = useCallback((article: Article) => {
    setState((prev) => {
      const exists = prev.articles.some((a) => a.slug === article.slug);
      return {
        ...prev,
        articles: exists
          ? prev.articles.map((a) => (a.slug === article.slug ? article : a))
          : [...prev.articles, article],
      };
    });
  }, []);

  const deleteArticle = useCallback((slug: string) => {
    setState((prev) => ({
      ...prev,
      articles: prev.articles.filter((a) => a.slug !== slug),
    }));
  }, []);

  const upsertInquiry = useCallback((inquiry: Inquiry) => {
    setState((prev) => {
      const exists = prev.inquiries.some((i) => i.id === inquiry.id);
      return {
        ...prev,
        inquiries: exists
          ? prev.inquiries.map((i) => (i.id === inquiry.id ? inquiry : i))
          : [inquiry, ...prev.inquiries],
      };
    });
  }, []);

  const updateInquiryStatus = useCallback((id: string, status: InquiryStatus) => {
    setState((prev) => ({
      ...prev,
      inquiries: prev.inquiries.map((i) => (i.id === id ? { ...i, status } : i)),
    }));
  }, []);

  const deleteInquiry = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      inquiries: prev.inquiries.filter((i) => i.id !== id),
    }));
  }, []);

  const upsertMedia = useCallback((media: MediaAsset) => {
    setState((prev) => {
      const exists = prev.media.some((m) => m.id === media.id);
      return {
        ...prev,
        media: exists
          ? prev.media.map((m) => (m.id === media.id ? media : m))
          : [media, ...prev.media],
      };
    });
  }, []);

  const deleteMedia = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      media: prev.media.filter((m) => m.id !== id),
    }));
  }, []);

  const upsertPage = useCallback((page: PageContent) => {
    setState((prev) => {
      const exists = prev.pages.some((p) => p.slug === page.slug);
      return {
        ...prev,
        pages: exists
          ? prev.pages.map((p) => (p.slug === page.slug ? page : p))
          : [...prev.pages, page],
      };
    });
  }, []);

  const deletePage = useCallback((slug: string) => {
    setState((prev) => ({
      ...prev,
      pages: prev.pages.filter((p) => p.slug !== slug),
    }));
  }, []);

  const updatePage = useCallback((slug: string, partial: Partial<PageContent>) => {
    setState((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.slug === slug
          ? { ...p, ...partial, updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  }, []);

  const updatePageSections = useCallback(
    (slug: string, sections: PageContent["sections"]) => {
      setState((prev) => ({
        ...prev,
        pages: prev.pages.map((p) =>
          p.slug === slug
            ? { ...p, sections, updatedAt: new Date().toISOString() }
            : p
        ),
      }));
    },
    []
  );

  const publishPage = useCallback((slug: string) => {
    const stamp = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.slug !== slug) return p;
        const snapshot: PublishedPageSnapshot = {
          title: p.title,
          excerpt: p.excerpt,
          bodyHtml: p.bodyHtml,
          featuredImage: p.featuredImage,
          authorId: p.authorId,
          seo: p.seo ? { ...p.seo } : { title: p.title },
          publishedAt: stamp,
        };
        return {
          ...p,
          status: "published" as const,
          publishedAt: stamp,
          updatedAt: stamp,
          publishedSnapshot: snapshot,
          // Phase 4 visual builder — capture the working sections as the
          // last-published snapshot so the public preview route renders
          // a stable version even as the user keeps editing the draft.
          publishedSections: p.sections ? p.sections.map((s) => ({ ...s })) : [],
        };
      }),
    }));
  }, []);

  const unpublishPage = useCallback((slug: string) => {
    const stamp = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.slug === slug
          ? { ...p, status: "archived" as const, updatedAt: stamp, publishedSections: [] }
          : p
      ),
    }));
  }, []);

  const updateAnnouncement = useCallback(
    (id: string, partial: Partial<Announcement>) => {
      setState((prev) => ({
        ...prev,
        announcements: prev.announcements.map((a) =>
          a.id === id ? { ...a, ...partial } : a
        ),
      }));
    },
    []
  );

  const upsertAnnouncement = useCallback((a: Announcement) => {
    setState((prev) => {
      const exists = prev.announcements.some((x) => x.id === a.id);
      // Single-active rule: when the incoming announcement is active,
      // deactivate all others. Otherwise leave active flags alone.
      const announcements = exists
        ? prev.announcements.map((x) =>
            x.id === a.id
              ? a
              : a.active
              ? { ...x, active: false }
              : x
          )
        : a.active
        ? [...prev.announcements.map((x) => ({ ...x, active: false })), a]
        : [...prev.announcements, a];
      return { ...prev, announcements };
    });
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((a) => a.id !== id),
    }));
  }, []);

  // ---- Team ----
  const upsertTeam = useCallback((m: TeamMember) => {
    setState((prev) => {
      const exists = prev.team.some((x) => x.id === m.id);
      return {
        ...prev,
        team: exists
          ? prev.team.map((x) => (x.id === m.id ? m : x))
          : [...prev.team, m],
      };
    });
  }, []);

  const deleteTeam = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      team: prev.team.filter((m) => m.id !== id),
    }));
  }, []);

  // ---- FAQs ----
  const upsertFaq = useCallback((f: Faq) => {
    setState((prev) => {
      const exists = prev.faqs.some((x) => x.id === f.id);
      return {
        ...prev,
        faqs: exists
          ? prev.faqs.map((x) => (x.id === f.id ? f : x))
          : [...prev.faqs, f],
      };
    });
  }, []);

  const deleteFaq = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== id),
    }));
  }, []);

  // ---- Testimonials ----
  const upsertTestimonial = useCallback((t: Testimonial) => {
    setState((prev) => {
      const exists = prev.testimonials.some((x) => x.id === t.id);
      return {
        ...prev,
        testimonials: exists
          ? prev.testimonials.map((x) => (x.id === t.id ? t : x))
          : [...prev.testimonials, t],
      };
    });
  }, []);

  const deleteTestimonial = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((t) => t.id !== id),
    }));
  }, []);

  // ---- Social links (live on globalSettings.socials) ----
  const upsertSocial = useCallback((s: SocialLink) => {
    setState((prev) => {
      const socials = prev.globalSettings.socials;
      const exists = socials.some((x) => x.id === s.id);
      const next = exists
        ? socials.map((x) => (x.id === s.id ? s : x))
        : [...socials, s];
      return {
        ...prev,
        globalSettings: { ...prev.globalSettings, socials: next },
      };
    });
  }, []);

  const deleteSocial = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        socials: prev.globalSettings.socials.filter((s) => s.id !== id),
      },
    }));
  }, []);

  // ---- Navigation ----
  const updateNavigation = useCallback((nav: NavItem[]) => {
    setState((prev) => ({ ...prev, navigation: nav }));
  }, []);

  const updateFooterLinks = useCallback((groups: FooterLinkGroup[]) => {
    setState((prev) => ({ ...prev, footerLinks: groups }));
  }, []);

  // ---- Legal pages ----
  const upsertLegalPage = useCallback((p: LegalPage) => {
    setState((prev) => {
      const exists = prev.legalPages.some((x) => x.slug === p.slug);
      return {
        ...prev,
        legalPages: exists
          ? prev.legalPages.map((x) => (x.slug === p.slug ? p : x))
          : [...prev.legalPages, p],
      };
    });
  }, []);

  // ---- Forms ----
  const upsertForm = useCallback((f: FormDefinition) => {
    setState((prev) => {
      const exists = prev.forms.some((x) => x.id === f.id);
      return {
        ...prev,
        forms: exists
          ? prev.forms.map((x) => (x.id === f.id ? f : x))
          : [...prev.forms, f],
      };
    });
  }, []);

  const deleteForm = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      forms: prev.forms.filter((f) => f.id !== id),
    }));
  }, []);

  const updateGlobalSettings = useCallback((partial: Partial<GlobalSettings>) => {
    setState((prev) => ({
      ...prev,
      globalSettings: { ...prev.globalSettings, ...partial },
    }));
  }, []);

  const importJson = useCallback((json: ContentState) => {
    setState(clone(json));
  }, []);

  const exportJson = useCallback(() => clone(state), [state]);

  const resetToSeed = useCallback(() => {
    setState(clone(seedData));
  }, []);

  const setCookiePrefs = useCallback((prefs: CookiePreferences) => {
    setCookiePrefsState({ ...prefs, savedAt: new Date().toISOString() });
  }, []);

  const value = useMemo<ContentStoreContextValue>(
    () => ({
      state,
      isDirty,
      lastSavedAt,
      getService,
      getServices,
      getProject,
      getArticle,
      getAnnouncement,
      getBrand,
      getGlobalSettings,
      getInquiries,
      getMedia,
      getPage,
      updateBrand,
      updateService,
      upsertService,
      deleteService,
      updateProject,
      upsertProject,
      deleteProject,
      updateArticle,
      upsertArticle,
      deleteArticle,
      upsertInquiry,
      updateInquiryStatus,
      deleteInquiry,
      upsertMedia,
      deleteMedia,
      upsertPage,
      deletePage,
      updatePage,
      updatePageSections,
      publishPage,
      unpublishPage,
      updateAnnouncement,
      upsertAnnouncement,
      deleteAnnouncement,
      updateGlobalSettings,
      upsertTeam,
      deleteTeam,
      upsertFaq,
      deleteFaq,
      upsertTestimonial,
      deleteTestimonial,
      upsertSocial,
      deleteSocial,
      updateNavigation,
      updateFooterLinks,
      upsertLegalPage,
      upsertForm,
      deleteForm,
      importJson,
      exportJson,
      resetToSeed,
      cookiePrefs,
      setCookiePrefs,
    }),
    [
      state,
      isDirty,
      lastSavedAt,
      getService,
      getServices,
      getProject,
      getArticle,
      getAnnouncement,
      getBrand,
      getGlobalSettings,
      getInquiries,
      getMedia,
      getPage,
      updateBrand,
      updateService,
      upsertService,
      deleteService,
      updateProject,
      upsertProject,
      deleteProject,
      updateArticle,
      upsertArticle,
      deleteArticle,
      upsertInquiry,
      updateInquiryStatus,
      deleteInquiry,
      upsertMedia,
      deleteMedia,
      upsertPage,
      deletePage,
      updatePage,
      updatePageSections,
      publishPage,
      unpublishPage,
      updateAnnouncement,
      upsertAnnouncement,
      deleteAnnouncement,
      updateGlobalSettings,
      upsertTeam,
      deleteTeam,
      upsertFaq,
      deleteFaq,
      upsertTestimonial,
      deleteTestimonial,
      upsertSocial,
      deleteSocial,
      updateNavigation,
      updateFooterLinks,
      upsertLegalPage,
      upsertForm,
      deleteForm,
      importJson,
      exportJson,
      resetToSeed,
      cookiePrefs,
      setCookiePrefs,
    ]
  );

  return (
    <ContentStoreContext.Provider value={value}>{children}</ContentStoreContext.Provider>
  );
}

// ============================================================
// HOOKS
// ============================================================
export function useContentStore() {
  const ctx = useContext(ContentStoreContext);
  if (!ctx) {
    throw new Error("useContentStore must be used within <ContentStoreProvider>");
  }
  return ctx;
}

export function useContent() {
  return useContentStore().state;
}

export function useService(slug: string | undefined) {
  const ctx = useContentStore();
  return slug ? ctx.getService(slug) : undefined;
}

export function useServices() {
  return useContentStore().getServices();
}

export function useProject(slug: string | undefined) {
  const ctx = useContentStore();
  return slug ? ctx.getProject(slug) : undefined;
}

export function useIndustry(slug: string | undefined) {
  const ctx = useContentStore();
  return slug ? ctx.state.industries.find((i) => i.slug === slug) : undefined;
}

export function useAuthor(id: string | undefined) {
  const ctx = useContentStore();
  return id ? ctx.state.authors.find((a) => a.id === id) : undefined;
}

export function useTeam() {
  return useContentStore().state.team;
}

export function useIndustries() {
  return useContentStore().state.industries;
}

export function useServiceCategories() {
  return useContentStore().state.serviceCategories;
}

export function useFaqs() {
  return useContentStore().state.faqs;
}

export function useArticles() {
  return useContentStore().state.articles;
}

export function useAuthors() {
  return useContentStore().state.authors;
}

export function useProjects() {
  return useContentStore().state.projects;
}

export function useArticle(slug: string | undefined) {
  const ctx = useContentStore();
  return slug ? ctx.getArticle(slug) : undefined;
}

export function useAnnouncement() {
  return useContentStore().getAnnouncement();
}

export function useBrand() {
  return useContentStore().getBrand();
}

export function useGlobalSettings() {
  return useContentStore().getGlobalSettings();
}

export function useInquiries() {
  return useContentStore().getInquiries();
}

export function useMedia() {
  return useContentStore().getMedia();
}

export function usePage(slug: string | undefined) {
  const ctx = useContentStore();
  return slug ? ctx.getPage(slug) : undefined;
}

export function usePages() {
  return useContentStore().state.pages;
}

export function useFooterLinks() {
  return useContentStore().state.footerLinks;
}

export function useForms() {
  return useContentStore().state.forms;
}

export function useLegalPages() {
  return useContentStore().state.legalPages;
}

export function useLegalPage(slug: string | undefined) {
  const ctx = useContentStore();
  return slug ? ctx.state.legalPages.find((p) => p.slug === slug) : undefined;
}

export function useTestimonials() {
  return useContentStore().state.testimonials;
}

export function useNavigation() {
  return useContentStore().state.navigation;
}
