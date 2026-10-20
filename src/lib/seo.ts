"use client";

import { useEffect } from "react";
import { useGlobalSettings } from "@/lib/content-store";

interface RouteMeta {
  title: string;
  description: string;
  ogImage?: string;
  noindex?: boolean;
}

const STATIC_TITLE = "Techstar — Security. Infrastructure. Intelligence.";

function ensureMetaTag(
  selector: string,
  attr: "name" | "property",
  key: string,
  content: string
) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Applies route meta to document.title and a handful of meta tags.
 * Called by HashRouter on route change.
 */
export function applyRouteMeta(meta: RouteMeta, globalDescription: string, globalOgImage?: string) {
  const title = meta.title || STATIC_TITLE;
  const description = meta.description || globalDescription || "";
  const ogImage = meta.ogImage || globalOgImage;

  if (typeof document !== "undefined") {
    document.title = title;
    ensureMetaTag('meta[name="description"]', "name", "description", description);
    ensureMetaTag('meta[property="og:title"]', "property", "og:title", title);
    ensureMetaTag('meta[property="og:description"]', "property", "og:description", description);
    ensureMetaTag('meta[property="og:type"]', "property", "og:type", "website");
    ensureMetaTag('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    ensureMetaTag('meta[name="twitter:title"]', "name", "twitter:title", title);
    ensureMetaTag('meta[name="twitter:description"]', "name", "twitter:description", description);
    if (ogImage) {
      ensureMetaTag('meta[property="og:image"]', "property", "og:image", ogImage);
      ensureMetaTag('meta[name="twitter:image"]', "name", "twitter:image", ogImage);
    }
    ensureMetaTag(
      'meta[name="robots"]',
      "name",
      "robots",
      meta.noindex ? "noindex,nofollow" : "index,follow"
    );
  }
}

/**
 * Hook used inside HashRouter to keep document.title / meta in sync.
 */
export function useRouteMetaEffect(meta: RouteMeta | null) {
  const globalSettings = useGlobalSettings();
  const description = globalSettings?.defaultSeo.description || "";
  const ogImage = globalSettings?.defaultSeo.ogImage;

  useEffect(() => {
    if (!meta) return;
    applyRouteMeta(meta, description, ogImage);
  }, [meta, description, ogImage]);
}
