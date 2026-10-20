"use client";

import { motion, useReducedMotion } from "framer-motion";

interface GalleryImage {
  url: string;
  alt?: string;
}

interface GallerySectionData {
  heading?: string;
  images?: GalleryImage[];
}

/**
 * Asymmetric image gallery. Reads `images` from section data. Falls back
 * to a single placeholder if no images are configured.
 */
export function GallerySection({ data }: { data: GallerySectionData }) {
  const reduce = useReducedMotion();
  const images = data.images && data.images.length > 0 ? data.images : [
    { url: "https://placehold.co/800x600/0A0F1F/3B82F6?text=Gallery+1", alt: "Gallery image 1" },
    { url: "https://placehold.co/800x600/11182A/22D3EE?text=Gallery+2", alt: "Gallery image 2" },
  ];

  return (
    <section className="relative py-16 sm:py-20" style={{ backgroundColor: "var(--bg-navy)" }}>
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {data.heading ? (
          <div className="mb-8">
            <h2
              className="font-display font-semibold tracking-tight"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                color: "var(--text-primary)",
              }}
            >
              {data.heading}
            </h2>
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, i) => (
            <motion.figure
              key={i}
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
              className={[
                "relative overflow-hidden rounded-lg border",
                i % 5 === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square",
              ].join(" ")}
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <img
                src={img.url}
                alt={img.alt || `Gallery image ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
