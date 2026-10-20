"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface BeforeAfterSectionData {
  heading?: string;
  beforeImage?: string;
  beforeAlt?: string;
  afterImage?: string;
  afterAlt?: string;
}

/**
 * Slider comparing two images. Pointer + keyboard accessible.
 * Honors reduced motion (defaults to a 50% split with no transition).
 *
 * The before-image sits inside a clipping div sized to `pos%` of the
 * container, so the image itself must be sized to the *container* width
 * (not its parent's `pos%`). We track the container width via
 * ResizeObserver so the inner img can render at the correct width
 * without accessing a ref during render.
 */
export function BeforeAfterSection({ data }: { data: BeforeAfterSectionData }) {
  const reduce = useReducedMotion();
  const [pos, setPos] = useState(50);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  const before = data.beforeImage || "https://placehold.co/1200x800/11182A/EF4444?text=Before";
  const after = data.afterImage || "https://placehold.co/1200x800/0A0F1F/10B981?text=After";

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    // Seed initial measurement
    setContainerWidth(el.getBoundingClientRect().width || null);
    return () => ro.disconnect();
  }, []);

  function setFromClientX(clientX: number) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }

  return (
    <section className="relative py-16 sm:py-20" style={{ backgroundColor: "var(--bg-navy)" }}>
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {data.heading ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5 }}
            className="mb-6 text-center"
          >
            <h2
              className="font-display font-semibold tracking-tight"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                color: "var(--text-primary)",
              }}
            >
              {data.heading}
            </h2>
          </motion.div>
        ) : null}

        <div
          ref={ref}
          className="relative mx-auto aspect-[16/9] max-w-5xl overflow-hidden rounded-xl border select-none"
          style={{ borderColor: "var(--border-subtle)" }}
          onPointerDown={(e) => setFromClientX(e.clientX)}
          onPointerMove={(e) => {
            if (e.buttons === 1) setFromClientX(e.clientX);
          }}
        >
          <img src={after} alt={data.afterAlt || "After"} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
            <img
              src={before}
              alt={data.beforeAlt || "Before"}
              className="absolute inset-0 h-full max-w-none object-cover"
              style={containerWidth ? { width: `${containerWidth}px` } : { width: "100%" }}
            />
          </div>
          <div
            className="absolute top-0 bottom-0 w-0.5"
            style={{ left: `${pos}%`, backgroundColor: "var(--accent-bright)" }}
            aria-hidden
          >
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full border-2"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--accent-bright)",
                color: "var(--text-primary)",
              }}
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path d="M9 6 3 12l6 6M15 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <label className="sr-only" htmlFor="before-after-slider">
            Compare before and after images
          </label>
          <input
            id="before-after-slider"
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            className="absolute inset-0 w-full cursor-ew-resize opacity-0"
            aria-valuetext={`${Math.round(pos)}% before, ${100 - Math.round(pos)}% after`}
          />
        </div>
      </div>
    </section>
  );
}
