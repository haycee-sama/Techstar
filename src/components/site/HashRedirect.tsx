"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Hash-to-clean-URL redirect — backwards compatibility for any old
 * bookmark, link, or search-engine cache that still points at a hash
 * route like `/#/contact` or `/#/admin/login`.
 *
 * Browsers do NOT send the URL fragment (hash) to the server, so this
 * redirect MUST be client-side. On mount, if there's a non-trivial
 * hash like `#/contact`, replace the URL with `/contact` using the
 * Next.js router. The replacement preserves browser history cleanly
 * (no extra entry, just URL substitution).
 *
 * Mounted once in the root layout so it runs on every route.
 */
export function HashRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash || hash.length <= 2) return; // empty, "#", or "#/"
    if (hash === "#/") return;
    // Strip leading "#" and any "?query" suffix from the path part.
    let target = hash.slice(1); // remove "#"
    const queryIndex = target.indexOf("?");
    let query = "";
    if (queryIndex >= 0) {
      query = target.slice(queryIndex);
      target = target.slice(0, queryIndex);
    }
    if (!target.startsWith("/")) target = "/" + target;
    // Only redirect if the target is different from the current pathname.
    if (target === pathname) return;
    // Use replaceState directly so we don't add a history entry, then
    // force a hard navigation to the clean URL so the Next.js router
    // re-runs route matching against the new pathname.
    const finalUrl = query ? target + query : target;
    window.history.replaceState(null, "", finalUrl);
    router.replace(finalUrl, { scroll: false });
  }, [pathname, router]);

  return null;
}
