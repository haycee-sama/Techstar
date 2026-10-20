"use client";

import { useEffect, useRef, useState } from "react";

interface StickySectionNavProps {
  sections: { id: string; label: string }[];
  /** Optional className */
  className?: string;
  /** Offset for the scroll-margin-top (in px) */
  scrollOffset?: number;
}

/**
 * Sticky section navigation with active-section highlight via IntersectionObserver.
 * Renders as a sticky vertical list on desktop, top horizontal bar on mobile.
 */
export function StickySectionNav({
  sections,
  className = "",
  scrollOffset = 80,
}: StickySectionNavProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sections.length === 0) return;

    // Set scroll-margin-top so anchored targets aren't covered by sticky header
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) el.style.scrollMarginTop = `${scrollOffset}px`;
    });

    const handler = (entries: IntersectionObserverEntry[]) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) {
        const id = visible[0].target.id;
        if (id) setActiveId(id);
      }
    };
    observerRef.current = new IntersectionObserver(handler, {
      rootMargin: `-${scrollOffset}px 0px -65% 0px`,
      threshold: [0, 0.2, 0.5, 1],
    });
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el && observerRef.current) observerRef.current.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [sections, scrollOffset]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
      window.scrollTo({ top, behavior: "smooth" });
      // Update hash without scroll jump
      if (typeof history !== "undefined") {
        history.replaceState(null, "", `#${window.location.hash.replace(/^#/, "").split("?")[0]}#${id}`);
      }
      setActiveId(id);
    }
  };

  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="Section navigation"
      className={`sticky top-20 z-20 ${className}`}
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-deep) 86%, transparent)",
        backdropFilter: "blur(8px)",
      }}
    >
      <ul className="flex gap-1 overflow-x-auto py-2 scrollbar-thin">
        {sections.map((s) => {
          const isActive = activeId === s.id;
          return (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                onClick={(e) => handleClick(e, s.id)}
                aria-current={isActive ? "true" : undefined}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  borderColor: isActive ? "var(--accent)" : "var(--border-subtle)",
                  backgroundColor: isActive
                    ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                    : "transparent",
                  color: isActive ? "var(--accent-bright)" : "var(--text-secondary)",
                }}
              >
                <span
                  className="inline-flex size-1.5 rounded-full"
                  style={{
                    backgroundColor: isActive ? "var(--accent-cyan)" : "var(--border-strong)",
                  }}
                  aria-hidden
                />
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
