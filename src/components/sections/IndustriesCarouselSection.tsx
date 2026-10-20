"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "@/lib/router";
import { useContent } from "@/lib/content-store";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";

export function IndustriesCarouselSection() {
  const { industries } = useContent();
  const reduce = useReducedMotion();
  const [emblaRef, embla] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: false,
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

  // Auto-advance unless paused or reduced motion
  useEffect(() => {
    if (!embla || paused || reduce) return;
    const t = setInterval(() => {
      embla.scrollNext();
    }, 4500);
    return () => clearInterval(t);
  }, [embla, paused, reduce]);

  if (industries.length === 0) return null;

  return (
    <section
      aria-label="Industries served"
      className="relative py-20 sm:py-24"
      style={{ backgroundColor: "var(--bg-deep)" }}
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <div className="eyebrow">Industries served</div>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.08,
                color: "var(--text-primary)",
              }}
            >
              Built for the way your facility actually operates.
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous industries"
              onClick={() => embla?.scrollPrev()}
            >
              <ArrowLeft className="size-4" aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next industries"
              onClick={() => embla?.scrollNext()}
            >
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>

      <div
        className="mt-10 overflow-hidden"
        ref={emblaRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div className="flex">
          {industries.map((industry, i) => {
            const Icon = pickIcon(industry.icon);
            return (
              <div
                key={industry.slug}
                className="min-w-0 shrink-0 pl-4 first:pl-4 sm:first:pl-8 lg:first:pl-8"
                style={{ width: "min(86vw, 360px)" }}
              >
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Link
                    to={`/industries/${industry.slug}`}
                    className="group flex h-full flex-col justify-between overflow-hidden rounded-xl border p-5 transition-colors hover:border-[var(--accent)]"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-1)",
                    }}
                  >
                    <div className="relative">
                      <div
                        className="absolute -right-6 -top-6 size-20 rounded-full opacity-10"
                        style={{ backgroundColor: "var(--accent)" }}
                        aria-hidden
                      />
                      <Icon
                        className="size-7"
                        style={{ color: "var(--accent-bright)" }}
                        aria-hidden
                      />
                      <h3
                        className="mt-5 font-display text-lg font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {industry.name}
                      </h3>
                      <p
                        className="mt-2 text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {industry.tagline}
                      </p>
                    </div>
                    <div
                      className="mt-6 inline-flex items-center gap-1 text-xs font-medium"
                      style={{ color: "var(--accent-bright)" }}
                    >
                      Explore
                      <ArrowRight
                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </div>
                  </Link>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      <div className="mx-auto mt-6 flex max-w-[1320px] items-center gap-1.5 px-4 sm:px-6 lg:px-8">
        {industries.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => embla?.scrollTo(i)}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === selected ? 24 : 8,
              backgroundColor: i === selected ? "var(--accent-bright)" : "var(--border-strong)",
            }}
          />
        ))}
      </div>
    </section>
  );
}

function pickIcon(name?: string) {
  if (!name) return Icons.Building2;
  const Comp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[name];
  return Comp || Icons.Building2;
}
