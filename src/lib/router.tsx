"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { useGlobalSettings } from "@/lib/content-store";
import { useRouteMetaEffect } from "@/lib/seo";

// ============================================================
// ROUTE TABLE
// ============================================================
export const ROUTES = {
  home: { path: "/", title: "Techstar — Security. Infrastructure. Intelligence." },
  about: { path: "/about", title: "About — Techstar" },
  services: { path: "/services", title: "Services — Techstar" },
  serviceDetail: { path: "/services/:slug", title: "Service — Techstar" },
  industries: { path: "/industries", title: "Industries — Techstar" },
  industryDetail: { path: "/industries/:slug", title: "Industry — Techstar" },
  projects: { path: "/projects", title: "Projects — Techstar" },
  projectDetail: { path: "/projects/:slug", title: "Project — Techstar" },
  insights: { path: "/insights", title: "Insights — Techstar" },
  articleDetail: { path: "/insights/:slug", title: "Insight — Techstar" },
  contact: { path: "/contact", title: "Contact — Techstar" },
  faq: { path: "/faq", title: "FAQ — Techstar" },
  careers: { path: "/careers", title: "Careers — Techstar" },
  privacy: { path: "/privacy", title: "Privacy — Techstar" },
  terms: { path: "/terms", title: "Terms — Techstar" },
  cookiePreferences: { path: "/cookie-preferences", title: "Cookie Preferences — Techstar" },
  network: { path: "/network", title: "Network — Techstar" },
  preview: { path: "/preview/:slug", title: "Preview — Techstar" },
  admin: { path: "/admin", title: "Admin — Techstar" },
  adminLogin: { path: "/admin/login", title: "Admin sign in — Techstar" },
  adminPageEditor: { path: "/admin/pages/:slug", title: "Page editor — Techstar" },
  adminBuilder: { path: "/admin/builder", title: "Visual builder — Techstar" },
  adminBuilderEdit: { path: "/admin/builder/:slug", title: "Page builder — Techstar" },
  adminMedia: { path: "/admin/media", title: "Media library — Techstar" },
  adminSettings: { path: "/admin/settings", title: "Settings — Techstar" },
  notFound: { path: "/404", title: "Page not found — Techstar" },
} as const;

export interface ParsedRoute {
  /** Raw path without leading `#/`, e.g. `/services/cctv` */
  path: string;
  /** Route name e.g. `home`, `serviceDetail` */
  name: keyof typeof ROUTES | "unknown";
  /** Path segments, e.g. `["services", "cctv"]` */
  segments: string[];
  /** Param map e.g. `{ slug: "cctv" }` */
  params: Record<string, string>;
  /** True if the path begins with `/admin` */
  isAdmin: boolean;
}

export interface RouteMetaInfo {
  title: string;
  description: string;
  ogImage?: string;
  breadcrumbs?: { name: string; path: string }[];
  noindex?: boolean;
}

// ============================================================
// PARSING
// ============================================================
function parseHash(hash: string): ParsedRoute {
  let path = (hash || "").replace(/^#/, "");
  // Strip the query string before segment parsing so slugs like
  // `/preview/home?preview=true` parse as slug="home".
  const queryIndex = path.indexOf("?");
  if (queryIndex >= 0) path = path.slice(0, queryIndex);
  if (!path.startsWith("/")) path = "/" + path;
  if (path === "/") path = "/";

  const segments = path.split("/").filter(Boolean);
  const params: Record<string, string> = {};
  let name: keyof typeof ROUTES | "unknown" = "unknown";

  if (segments.length === 0) {
    name = "home";
  } else if (segments[0] === "about") {
    name = "about";
  } else if (segments[0] === "services") {
    if (segments.length >= 2) {
      name = "serviceDetail";
      params.slug = decodeURIComponent(segments[1]);
    } else {
      name = "services";
    }
  } else if (segments[0] === "industries") {
    if (segments.length >= 2) {
      name = "industryDetail";
      params.slug = decodeURIComponent(segments[1]);
    } else {
      name = "industries";
    }
  } else if (segments[0] === "projects") {
    if (segments.length >= 2) {
      name = "projectDetail";
      params.slug = decodeURIComponent(segments[1]);
    } else {
      name = "projects";
    }
  } else if (segments[0] === "insights") {
    if (segments.length >= 2) {
      name = "articleDetail";
      params.slug = decodeURIComponent(segments[1]);
    } else {
      name = "insights";
    }
  } else if (segments[0] === "contact") name = "contact";
  else if (segments[0] === "faq") name = "faq";
  else if (segments[0] === "careers") name = "careers";
  else if (segments[0] === "privacy") name = "privacy";
  else if (segments[0] === "terms") name = "terms";
  else if (segments[0] === "cookie-preferences") name = "cookiePreferences";
  else if (segments[0] === "network") name = "network";
  else if (segments[0] === "preview") {
    if (segments.length >= 2) {
      name = "preview";
      params.slug = decodeURIComponent(segments[1]);
    } else {
      name = "notFound";
    }
  } else if (segments[0] === "admin") {
    if (segments.length === 1) {
      name = "admin";
    } else if (segments.length === 2 && segments[1] === "login") {
      name = "adminLogin";
    } else if (segments.length === 3 && segments[1] === "pages") {
      name = "adminPageEditor";
      params.slug = decodeURIComponent(segments[2]);
    } else if (segments.length === 2 && segments[1] === "builder") {
      name = "adminBuilder";
    } else if (segments.length === 3 && segments[1] === "builder") {
      name = "adminBuilderEdit";
      params.slug = decodeURIComponent(segments[2]);
    } else if (segments.length === 2 && segments[1] === "media") {
      name = "adminMedia";
    } else if (segments.length === 2 && segments[1] === "settings") {
      name = "adminSettings";
    } else {
      // Other admin routes (Phase 3b CRUD tables) are dispatched by
      // the AdminShell, not the public ROUTES table.
      name = "admin";
    }
  } else {
    name = "notFound";
  }

  return {
    path,
    name,
    segments,
    params,
    isAdmin: segments[0] === "admin",
  };
}

export function parseRoute(hash: string): ParsedRoute {
  return parseHash(hash);
}

// ============================================================
// ROUTE META
// ============================================================
export function getRouteMeta(parsed: ParsedRoute): RouteMetaInfo {
  switch (parsed.name) {
    case "home":
      return {
        title: ROUTES.home.title,
        description:
          "Techstar designs, deploys, and operates integrated security, networking, and life-safety systems for organizations that take protection seriously.",
        breadcrumbs: [{ name: "Home", path: "/" }],
      };
    case "about":
      return {
        title: ROUTES.about.title,
        description: "About Techstar — integrated security, infrastructure, and intelligence.",
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ],
      };
    case "services":
      return {
        title: ROUTES.services.title,
        description:
          "Eight service domains covering security, infrastructure, and smart-building systems — engineered as one program.",
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ],
      };
    case "serviceDetail":
      return {
        title: "Service — Techstar",
        description: "Techstar service detail page.",
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Detail", path: `/services/${parsed.params.slug || ""}` },
        ],
      };
    case "industries":
      return {
        title: ROUTES.industries.title,
        description: "Industries served by Techstar.",
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Industries", path: "/industries" },
        ],
      };
    case "industryDetail":
      return {
        title: "Industry — Techstar",
        description: "Techstar industry detail page.",
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Industries", path: "/industries" },
          { name: "Detail", path: `/industries/${parsed.params.slug || ""}` },
        ],
      };
    case "projects":
      return {
        title: ROUTES.projects.title,
        description: "Selected Techstar project case studies (illustrative).",
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
        ],
      };
    case "projectDetail":
      return {
        title: "Project — Techstar",
        description: "Techstar project case study (illustrative).",
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
          { name: "Detail", path: `/projects/${parsed.params.slug || ""}` },
        ],
      };
    case "insights":
      return {
        title: ROUTES.insights.title,
        description: "Editorial insights from Techstar's engineering and operations practice.",
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Insights", path: "/insights" },
        ],
      };
    case "articleDetail":
      return {
        title: "Insight — Techstar",
        description: "Techstar insight article.",
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Insights", path: "/insights" },
          { name: "Article", path: `/insights/${parsed.params.slug || ""}` },
        ],
      };
    case "contact":
      return {
        title: ROUTES.contact.title,
        description: "Talk to Techstar about your security, infrastructure, and life-safety program.",
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ],
      };
    case "faq":
      return {
        title: ROUTES.faq.title,
        description: "Frequently asked questions about working with Techstar.",
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ],
      };
    case "careers":
      return {
        title: ROUTES.careers.title,
        description: "Careers at Techstar.",
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Careers", path: "/careers" },
        ],
      };
    case "privacy":
      return {
        title: ROUTES.privacy.title,
        description: "Privacy notice — Techstar (demo).",
        noindex: true,
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy" },
        ],
      };
    case "terms":
      return {
        title: ROUTES.terms.title,
        description: "Terms of use — Techstar (demo).",
        noindex: true,
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Terms", path: "/terms" },
        ],
      };
    case "cookiePreferences":
      return {
        title: ROUTES.cookiePreferences.title,
        description: "Cookie preferences — Techstar (demo).",
        noindex: true,
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Cookie Preferences", path: "/cookie-preferences" },
        ],
      };
    case "network":
      return {
        title: ROUTES.network.title,
        description: "Interactive network globe — Techstar.",
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Network", path: "/network" },
        ],
      };
    case "notFound":
      return {
        title: ROUTES.notFound.title,
        description: "The page you were looking for could not be found.",
        noindex: true,
        breadcrumbs: [{ name: "404", path: "/404" }],
      };
    case "admin":
      return {
        title: ROUTES.admin.title,
        description: "Techstar admin area (demo).",
        noindex: true,
        breadcrumbs: [{ name: "Admin", path: "/admin" }],
      };
    case "adminLogin":
      return {
        title: ROUTES.adminLogin.title,
        description: "Sign in to the Techstar admin console (demo).",
        noindex: true,
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Admin", path: "/admin" },
          { name: "Sign in", path: "/admin/login" },
        ],
      };
    case "adminPageEditor":
      return {
        title: ROUTES.adminPageEditor.title,
        description: "Techstar page editor (demo).",
        noindex: true,
        breadcrumbs: [
          { name: "Admin", path: "/admin" },
          { name: "Pages", path: "/admin/pages" },
          { name: "Editor", path: `/admin/pages/${parsed.params.slug || ""}` },
        ],
      };
    case "adminBuilder":
      return {
        title: ROUTES.adminBuilder.title,
        description: "Techstar visual page builder (demo).",
        noindex: true,
        breadcrumbs: [
          { name: "Admin", path: "/admin" },
          { name: "Visual builder", path: "/admin/builder" },
        ],
      };
    case "adminBuilderEdit":
      return {
        title: ROUTES.adminBuilderEdit.title,
        description: "Edit a Techstar page in the visual builder (demo).",
        noindex: true,
        breadcrumbs: [
          { name: "Admin", path: "/admin" },
          { name: "Visual builder", path: "/admin/builder" },
          { name: "Editor", path: `/admin/builder/${parsed.params.slug || ""}` },
        ],
      };
    case "adminMedia":
      return {
        title: ROUTES.adminMedia.title,
        description: "Techstar media library (demo).",
        noindex: true,
        breadcrumbs: [
          { name: "Admin", path: "/admin" },
          { name: "Media", path: "/admin/media" },
        ],
      };
    case "adminSettings":
      return {
        title: ROUTES.adminSettings.title,
        description: "Techstar global settings (demo).",
        noindex: true,
        breadcrumbs: [
          { name: "Admin", path: "/admin" },
          { name: "Settings", path: "/admin/settings" },
        ],
      };
    case "preview":
      return {
        title: `Preview — Techstar`,
        description: "Preview of a builder-edited page (demo).",
        noindex: true,
        breadcrumbs: [
          { name: "Admin", path: "/admin" },
          { name: "Visual builder", path: "/admin/builder" },
          { name: "Preview", path: `/preview/${parsed.params.slug || ""}` },
        ],
      };
    default:
      return {
        title: "Techstar — Security. Infrastructure. Intelligence.",
        description: "Integrated security, infrastructure, and intelligence.",
      };
  }
}

// ============================================================
// ROUTER CONTEXT
// ============================================================
interface RouterContextValue {
  parsed: ParsedRoute;
  meta: RouteMetaInfo;
  navigate: (to: string, opts?: { replace?: boolean; scroll?: boolean }) => void;
  back: () => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function readHash(): string {
  if (typeof window === "undefined") return "#/";
  const h = window.location.hash;
  return h && h.length > 1 ? h : "#/";
}

export function HashRouter({ children }: { children: ReactNode }) {
  const globalSettings = useGlobalSettings();
  const [hash, setHash] = useState<string>(() =>
    typeof window === "undefined" ? "#/" : readHash()
  );

  useEffect(() => {
    const onChange = () => {
      setHash(readHash());
      // Scroll to top on route change unless suppressed
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("hashchange", onChange);
    window.addEventListener("popstate", onChange);
    // Ensure initial hash exists
    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/");
    }
    return () => {
      window.removeEventListener("hashchange", onChange);
      window.removeEventListener("popstate", onChange);
    };
  }, []);

  const parsed = useMemo(() => parseHash(hash), [hash]);
  const meta = useMemo(() => getRouteMeta(parsed), [parsed]);

  useRouteMetaEffect(meta);

  const navigate = useCallback(
    (to: string, opts: { replace?: boolean; scroll?: boolean } = {}) => {
      const target = to.startsWith("#") ? to : `#${to.startsWith("/") ? to : "/" + to}`;
      if (opts.replace) {
        window.history.replaceState(null, "", target);
        setHash(target);
      } else {
        // pushState so we get a history entry without firing hashchange twice
        if (target !== window.location.hash) {
          window.history.pushState(null, "", target);
          setHash(target);
        }
      }
      if (opts.scroll !== false) {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    },
    []
  );

  const back = useCallback(() => {
    window.history.back();
  }, []);

  const value = useMemo<RouterContextValue>(
    () => ({ parsed, meta, navigate, back }),
    [parsed, meta, navigate, back]
  );

  // Description fallback uses global settings
  const _desc = globalSettings?.defaultSeo?.description;
  void _desc;

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within <HashRouter>");
  return ctx;
}

export function useRoute() {
  return useRouter().parsed;
}

// ============================================================
// LINK COMPONENT
// ============================================================
interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  replace?: boolean;
  scroll?: boolean;
}

export function Link({ to, replace, scroll = true, onClick, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  const href = to.startsWith("#") ? to : `#${to.startsWith("/") ? to : "/" + to}`;
  return (
    <a
      href={href}
      onClick={(e) => {
        // Allow modifier-click to open in new tab
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
          return;
        }
        e.preventDefault();
        navigate(to, { replace, scroll });
        onClick?.(e);
      }}
      {...rest}
    />
  );
}
