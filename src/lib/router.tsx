"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { usePathname, useRouter as useNextRouter } from "next/navigation";
import NextLink from "next/link";
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
  /** Raw path without query, e.g. `/services/cctv` */
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
// PARSING — parses a pathname (not a hash) into a ParsedRoute.
// Backwards-compat: strips any leading `#/` so old callers that still
// pass hash-style strings don't break.
// ============================================================
function normalizePath(rawPath: string): string {
  let path = (rawPath || "").trim();
  // Strip leading hash if present (backwards-compat with old hash callers)
  if (path.startsWith("#")) path = path.slice(1);
  // Strip query string before segment parsing so slugs like
  // `/preview/home?preview=true` parse as slug="home".
  const queryIndex = path.indexOf("?");
  if (queryIndex >= 0) path = path.slice(0, queryIndex);
  if (!path.startsWith("/")) path = "/" + path;
  if (path === "") path = "/";
  return path;
}

function parsePath(rawPath: string): ParsedRoute {
  const path = normalizePath(rawPath);
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
      // Other admin routes (CRUD tables, editors) are dispatched by
      // their own Next.js App Router page.tsx files. The router still
      // classifies them as "admin" so the layout knows to render the
      // admin shell.
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

// Backwards-compat alias — old name was `parseHash`.
export function parseRoute(pathOrHash: string): ParsedRoute {
  return parsePath(pathOrHash);
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

/**
 * AppRouter — replaces the old HashRouter. Uses Next.js App Router
 * (usePathname + useRouter from next/navigation) underneath while
 * keeping the same context API (useRouter/useRoute/<Link>) that every
 * existing page component already uses.
 *
 * Renders a RouterContext.Provider so all descendants can call
 * useRouter() to read the current parsed route + meta + navigate fn.
 */
export function AppRouter({ children }: { children: ReactNode }) {
  const globalSettings = useGlobalSettings();
  const nextRouter = useNextRouter();
  const pathname = usePathname() || "/";

  const parsed = useMemo(() => parsePath(pathname), [pathname]);
  const meta = useMemo(() => getRouteMeta(parsed), [parsed]);

  // Keep document.title + meta tags in sync with the route.
  useRouteMetaEffect(meta);

  const navigate = useCallback(
    (to: string, opts: { replace?: boolean; scroll?: boolean } = {}) => {
      // Strip leading hash if a caller passed an old hash-style URL
      // (backwards-compat with any unmigrated code paths).
      let target = to.startsWith("#") ? to.slice(1) : to;
      if (!target.startsWith("/")) target = "/" + target;
      // Strip any trailing query from the to-be-pushed path; the
      // query (if any) is part of `to` and will be preserved by
      // next-router's URL parsing.
      if (opts.replace) {
        nextRouter.replace(target, { scroll: opts.scroll !== false });
      } else {
        nextRouter.push(target, { scroll: opts.scroll !== false });
      }
    },
    [nextRouter]
  );

  const back = useCallback(() => {
    nextRouter.back();
  }, [nextRouter]);

  const value = useMemo<RouterContextValue>(
    () => ({ parsed, meta, navigate, back }),
    [parsed, meta, navigate, back]
  );

  // Reference global settings to keep the provider reactive to brand
  // SEO changes — actual application happens inside useRouteMetaEffect.
  const _desc = globalSettings?.defaultSeo?.description;
  void _desc;

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

/**
 * Backwards-compat alias. Old import sites use `<HashRouter>` — keep
 * the export name so they keep working. Internally it's now AppRouter.
 */
export const HashRouter = AppRouter;

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within <AppRouter>");
  return ctx;
}

export function useRoute() {
  return useRouter().parsed;
}

// ============================================================
// LINK COMPONENT — thin wrapper over next/link.
// Accepts the same `to` prop the old Link did (with or without a
// leading `#/`), normalises it to a clean pathname, and delegates
// client-side navigation to next/link so we get prefetching, history
// integration, scroll restoration, and back/forward for free.
// ============================================================
interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  replace?: boolean;
  scroll?: boolean;
}

export function Link({ to, replace, scroll = true, onClick, ...rest }: LinkProps) {
  // Strip any hash prefix that might still be passed by old call sites.
  let href = to.startsWith("#") ? to.slice(1) : to;
  if (!href.startsWith("/")) href = "/" + href;
  return (
    <NextLink
      href={href}
      replace={replace}
      scroll={scroll}
      onClick={onClick}
      {...rest}
    />
  );
}
