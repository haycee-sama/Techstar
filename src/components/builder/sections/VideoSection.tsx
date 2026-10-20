"use client";

import { motion, useReducedMotion } from "framer-motion";

interface VideoSectionData {
  heading?: string;
  body?: string;
  videoUrl?: string;
  posterImage?: string;
}

function toEmbedUrl(raw: string): { src: string; isYoutube: boolean } {
  if (!raw) return { src: "", isYoutube: false };
  const trimmed = raw.trim();
  if (trimmed.includes("youtube.com/watch")) {
    try {
      const u = new URL(trimmed);
      const v = u.searchParams.get("v");
      if (v) return { src: `https://www.youtube.com/embed/${v}`, isYoutube: true };
    } catch {
      // fall through
    }
  }
  if (trimmed.includes("youtu.be/")) {
    const id = trimmed.split("youtu.be/")[1]?.split(/[?&]/)[0];
    if (id) return { src: `https://www.youtube.com/embed/${id}`, isYoutube: true };
  }
  return { src: trimmed, isYoutube: false };
}

/**
 * Responsive video embed. Supports YouTube watch URLs (auto-converted to
 * embed URLs) and direct mp4 links (rendered via <video>).
 */
export function VideoSection({ data }: { data: VideoSectionData }) {
  const reduce = useReducedMotion();
  const { src, isYoutube } = toEmbedUrl(data.videoUrl || "");

  return (
    <section className="relative py-16 sm:py-20" style={{ backgroundColor: "var(--bg-deep)" }}>
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {data.heading || data.body ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-8 max-w-2xl text-center"
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
              <p
                className="mt-4 text-pretty"
                style={{ color: "var(--text-secondary)" }}
              >
                {data.body}
              </p>
            ) : null}
          </motion.div>
        ) : null}

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-xl border"
          style={{ borderColor: "var(--border-subtle)", aspectRatio: "16 / 9" }}
        >
          {src ? (
            isYoutube ? (
              <iframe
                src={src}
                title={data.heading || "Video"}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <video
                src={src}
                poster={data.posterImage}
                controls
                className="absolute inset-0 h-full w-full"
              />
            )
          ) : (
            <div
              className="flex h-full items-center justify-center text-xs"
              style={{ color: "var(--text-muted)", backgroundColor: "var(--surface-1)" }}
            >
              No video URL configured
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
