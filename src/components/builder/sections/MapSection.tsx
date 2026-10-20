"use client";

import { motion, useReducedMotion } from "framer-motion";

interface MapSectionData {
  heading?: string;
  body?: string;
  embedUrl?: string;
}

/**
 * Map section. Supports an iframe `embedUrl` (Google Maps embed URL,
 * OpenStreetMap iframe, etc.). Falls back to a stylized SVG placeholder
 * when no embed is configured.
 */
export function MapSection({ data }: { data: MapSectionData }) {
  const reduce = useReducedMotion();

  return (
    <section className="relative py-16 sm:py-20" style={{ backgroundColor: "var(--bg-deep)" }}>
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {data.heading || data.body ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5 }}
            className="mb-8 max-w-2xl"
          >
            {data.heading ? (
              <h2
                className="font-display font-semibold tracking-tight"
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  color: "var(--text-primary)",
                }}
              >
                {data.heading}
              </h2>
            ) : null}
            {data.body ? (
              <p className="mt-3 text-pretty" style={{ color: "var(--text-secondary)" }}>
                {data.body}
              </p>
            ) : null}
            <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
              Sample address — replace before launch.
            </p>
          </motion.div>
        ) : null}
        <div
          className="relative overflow-hidden rounded-xl border"
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--surface-1)",
            aspectRatio: "16 / 7",
          }}
        >
          {data.embedUrl ? (
            <iframe
              src={data.embedUrl}
              title={data.heading || "Map"}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
            />
          ) : (
            <MapPlaceholder />
          )}
        </div>
      </div>
    </section>
  );
}

function MapPlaceholder() {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 800 350" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="800" height="350" fill="url(#map-grid)" />
        <path
          d="M0 200 C 150 180, 250 240, 400 200 C 550 160, 700 220, 800 190"
          stroke="var(--accent-bright)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 6"
          opacity="0.6"
        />
        <path
          d="M0 120 C 200 140, 350 100, 500 130 C 650 160, 750 100, 800 110"
          stroke="var(--accent)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />
        <circle cx="400" cy="200" r="6" fill="var(--accent-bright)" />
        <circle cx="400" cy="200" r="14" fill="none" stroke="var(--accent-bright)" strokeWidth="1.5" opacity="0.4" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          Map placeholder — configure an embed URL
        </span>
      </div>
    </div>
  );
}
