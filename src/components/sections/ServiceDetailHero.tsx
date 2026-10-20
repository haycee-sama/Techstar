"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import type { Service } from "@/lib/types";

interface ServiceDetailHeroProps {
  service: Service;
  category?: string;
}

export function ServiceDetailHero({ service, category }: ServiceDetailHeroProps) {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label={`${service.title} — service overview`}
      className="relative isolate overflow-hidden"
      style={{ backgroundColor: "var(--bg-deep)" }}
    >
      <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 75% 25%, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 55%), radial-gradient(ellipse at 15% 80%, color-mix(in srgb, var(--accent-cyan) 14%, transparent) 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 coordinate-marks" aria-hidden />

      <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: service.title, path: `/services/${service.slug}` },
          ]}
          currentLabel={service.title}
        />

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <span
                className="inline-flex size-1.5 rounded-full animate-pulse-soft"
                style={{ backgroundColor: "var(--accent-cyan)" }}
                aria-hidden
              />
              <span className="eyebrow" style={{ color: "var(--text-secondary)" }}>
                Service
                {category ? ` · ${category}` : ""}
              </span>
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 4rem)",
                lineHeight: 1.03,
                color: "var(--text-primary)",
              }}
            >
              {service.title}
            </motion.h1>

            {service.tagline && (
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mt-5 max-w-xl text-pretty"
                style={{
                  fontSize: "1.25rem",
                  lineHeight: 1.55,
                  color: "var(--text-secondary)",
                }}
              >
                {service.tagline}
              </motion.p>
            )}

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              {service.cta && (
                <Button
                  asChild
                  size="lg"
                  style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                >
                  <Link to={service.cta.href.replace(/^#/, "")} className="inline-flex items-center gap-2">
                    {service.cta.label}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              )}
              <Button
                asChild
                size="lg"
                variant="outline"
                style={{
                  borderColor: "var(--border-strong)",
                  color: "var(--text-primary)",
                  backgroundColor: "transparent",
                }}
              >
                <Link to="/contact" className="inline-flex items-center gap-2">
                  Talk to an expert
                </Link>
              </Button>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border clip-corner"
              style={{
                borderColor: "var(--border-subtle)",
                backgroundColor: "var(--surface-1)",
              }}
              aria-label={`${service.title} reference imagery`}
            >
              {service.heroMedia ? (
                <img
                  src={service.heroMedia}
                  alt={`${service.title} illustration`}
                  width={1200}
                  height={800}
                  className="absolute inset-0 size-full object-cover opacity-90"
                  loading="eager"
                />
              ) : null}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg-deep) 65%, transparent) 100%)",
                }}
                aria-hidden
              />
              <div className="absolute inset-0 grid-bg-fine opacity-30" aria-hidden />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                <span className="font-mono">SERVICE / {service.slug.slice(0, 12).toUpperCase()}</span>
                <span className="font-mono">ILLUSTRATIVE</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
