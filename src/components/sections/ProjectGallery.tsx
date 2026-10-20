"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReducedMotion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";

interface ProjectGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

/**
 * Responsive project gallery — embla carousel on mobile, asymmetric grid on
 * desktop, lightbox dialog with prev/next on both.
 *
 * - Mobile carousel: embla-carousel-react with drag/touch + prev/next buttons
 * - Desktop: asymmetric grid (varied tile sizes via row-span/col-span)
 * - Lightbox: Dialog with keyboard nav (Esc/Arrow keys) and prev/next
 */
export function ProjectGallery({ images, alt, className = "" }: ProjectGalleryProps) {
  const reduce = useReducedMotion();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Embla setup for the mobile carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: false,
    align: "center",
  });
  const [mobileIdx, setMobileIdx] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Sync embla select → state
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setMobileIdx(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollMobilePrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollMobileNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!images || images.length === 0) {
    return (
      <div
        className={`aspect-[16/9] w-full rounded-xl border ${className}`}
        style={{
          backgroundColor: "var(--surface-2)",
          borderColor: "var(--border-subtle)",
        }}
        aria-label="No gallery images available"
      />
    );
  }

  const closeLightbox = () => setLightboxIndex(null);
  const nextLightbox = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));
  const prevLightbox = () =>
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));

  return (
    <>
      {/* Mobile carousel (embla) */}
      {isMobile ? (
        <div className={className}>
          <div
            className="overflow-hidden rounded-xl border"
            style={{
              backgroundColor: "var(--surface-2)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div className="embla" ref={emblaRef}>
              <div
                className="embla__container flex"
                style={{ touchAction: "pan-y" }}
              >
                {images.map((src, i) => (
                  <div
                    key={src + i}
                    className="embla__slide relative min-w-0 flex-[0_0_100%]"
                  >
                    <div className="relative aspect-[4/3] w-full">
                      <img
                        src={src}
                        alt={`${alt} — image ${i + 1} of ${images.length}`}
                        width={1200}
                        height={800}
                        className="absolute inset-0 size-full object-cover"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(i)}
                        aria-label={`Open image ${i + 1} of ${images.length} in full view`}
                        className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full border backdrop-blur-md"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--bg-deep) 60%, transparent)",
                          borderColor: "var(--accent)",
                          color: "var(--accent-bright)",
                        }}
                      >
                        <ZoomIn className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile controls + dots */}
          {images.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                aria-label="Previous image"
                onClick={scrollMobilePrev}
                className="inline-flex size-9 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: "var(--surface-1)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <div className="flex items-center gap-1.5" role="group" aria-label="Slide indicators">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to image ${i + 1}`}
                    aria-current={mobileIdx === i}
                    onClick={() => emblaApi?.scrollTo(i)}
                    className="inline-flex size-2 rounded-full transition-all"
                    style={{
                      backgroundColor:
                        mobileIdx === i ? "var(--accent-bright)" : "var(--border-strong)",
                      width: mobileIdx === i ? "16px" : "8px",
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Next image"
                onClick={scrollMobileNext}
                className="inline-flex size-9 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: "var(--surface-1)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
      ) : (
        // Desktop asymmetric grid (varied sizes for visual rhythm)
        <div className={`grid grid-cols-2 gap-3 ${className}`}>
          {images.map((src, i) => {
            // Vary sizes for an editorial asymmetric grid: first tile spans 2 rows, last tile spans 2 cols
            const isFirst = i === 0 && images.length > 2;
            const isLastWide = i === images.length - 1 && images.length % 2 === 1;
            const sizeClass = isFirst
              ? "row-span-2"
              : isLastWide
                ? "col-span-2"
                : "";
            return (
              <motion.button
                key={src + i}
                type="button"
                onClick={() => setLightboxIndex(i)}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className={`group relative overflow-hidden rounded-xl border ${sizeClass}`}
                style={{
                  backgroundColor: "var(--surface-2)",
                  borderColor: "var(--border-subtle)",
                  aspectRatio: isFirst ? "4/5" : isLastWide ? "16/7" : "4/3",
                }}
                aria-label={`Open image ${i + 1} of ${images.length} in full view`}
              >
                <img
                  src={src}
                  alt={`${alt} — image ${i + 1} of ${images.length}`}
                  width={1200}
                  height={isFirst ? 1500 : 800}
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg-deep) 60%, transparent) 100%)",
                  }}
                  aria-hidden
                />
                <div
                  className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full border opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--bg-deep) 70%, transparent)",
                    borderColor: "var(--accent)",
                    color: "var(--accent-bright)",
                  }}
                >
                  <ZoomIn className="size-4" aria-hidden />
                </div>
                <div
                  className="absolute bottom-2 left-2 font-mono text-[10px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {String(i + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Lightbox dialog */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(o) => !o && closeLightbox()}>
        <DialogContent
          className="max-w-5xl border-0 p-0"
          onEscapeKeyDown={(e) => {
            if (e.key === "Escape") {
              closeLightbox();
            } else if (e.key === "ArrowRight") {
              nextLightbox();
            } else if (e.key === "ArrowLeft") {
              prevLightbox();
            }
          }}
          style={{
            backgroundColor: "color-mix(in srgb, var(--bg-deep) 96%, transparent)",
          }}
        >
          <DialogTitle className="sr-only">
            {alt} — full view, image {lightboxIndex !== null ? lightboxIndex + 1 : ""} of {images.length}
          </DialogTitle>
          <div className="relative">
            <AnimatePresence mode="wait">
              {lightboxIndex !== null && (
                <motion.img
                  key={lightboxIndex}
                  src={images[lightboxIndex]}
                  alt={`${alt} — image ${lightboxIndex + 1} of ${images.length}`}
                  width={1200}
                  height={800}
                  initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-[80vh] w-full object-contain"
                />
              )}
            </AnimatePresence>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={prevLightbox}
                  className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex size-10 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--surface-2) 80%, transparent)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={nextLightbox}
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex size-10 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--surface-2) 80%, transparent)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </>
            )}
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border px-3 py-1 text-xs font-mono"
              style={{
                backgroundColor: "color-mix(in srgb, var(--bg-deep) 70%, transparent)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              {lightboxIndex !== null ? lightboxIndex + 1 : ""} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
