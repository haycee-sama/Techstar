"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { useContent } from "@/lib/content-store";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "framer-motion";

export function TestimonialsSliderSection() {
  const { testimonials } = useContent();
  const reduce = useReducedMotion();
  const [emblaRef, embla] = useEmblaCarousel({
    loop: true,
    align: "center",
  });
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelected(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    embla.on("select", onSelect);
    onSelect();
  }, [embla, onSelect]);

  useEffect(() => {
    if (!embla || paused || reduce) return;
    const t = setInterval(() => embla.scrollNext(), 6000);
    return () => clearInterval(t);
  }, [embla, paused, reduce]);

  if (testimonials.length === 0) return null;

  return (
    <section
      aria-label="Illustrative testimonials"
      className="relative py-20 sm:py-24"
      style={{ backgroundColor: "var(--bg-deep)" }}
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="eyebrow">Testimonials</div>
          <h2
            className="max-w-2xl font-display font-semibold tracking-tight text-balance"
            style={{
              fontSize: "clamp(1.875rem, 4vw, 3rem)",
              lineHeight: 1.08,
              color: "var(--text-primary)",
            }}
          >
            What a defensible posture feels like.
          </h2>
          <p className="max-w-lg text-pretty" style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Illustrative testimonials — sample copy for proposal. Real
            references available under NDA during engagement.
          </p>
        </div>

        <div
          className="mt-12 overflow-hidden"
          ref={emblaRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div className="flex">
            {testimonials.map((t) => (
              <div key={t.id} className="min-w-0 shrink-0 px-4" style={{ width: "100%" }}>
                <figure
                  className="relative mx-auto max-w-3xl rounded-2xl border p-8 sm:p-10"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                  }}
                >
                  <Quote
                    className="absolute -top-3 left-8 size-7"
                    style={{ color: "var(--accent-bright)" }}
                    aria-hidden
                  />
                  <blockquote
                    className="text-pretty"
                    style={{
                      fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
                      lineHeight: 1.55,
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    "{t.quote}"
                  </blockquote>
                  <figcaption className="mt-6 flex items-center justify-between">
                    <div>
                      <div className="font-display text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {t.name}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {t.role}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {t.company}
                      </div>
                    </div>
                    <span
                      className="rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--accent) 14%, transparent)",
                        borderColor: "var(--border-strong)",
                        color: "var(--accent-bright)",
                      }}
                    >
                      Illustrative
                    </span>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous testimonial"
            onClick={() => embla?.scrollPrev()}
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Button>
          <div className="flex items-center gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => embla?.scrollTo(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === selected ? 24 : 8,
                  backgroundColor: i === selected ? "var(--accent-bright)" : "var(--border-strong)",
                }}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next testimonial"
            onClick={() => embla?.scrollNext()}
          >
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}
