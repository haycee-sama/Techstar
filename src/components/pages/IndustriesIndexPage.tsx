"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Building2,
  HeartPulse,
  GraduationCap,
  Hotel,
  Factory,
  ShoppingBag,
  Home,
  Landmark,
  ArrowRight,
} from "lucide-react";
import { Link } from "@/lib/router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CtaBandSection } from "@/components/sections/CtaBandSection";
import { useIndustries } from "@/lib/content-store";
import { cn } from "@/lib/utils";

const ICONS: Record<
  string,
  React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
    "aria-hidden"?: boolean;
  }>
> = {
  Building2,
  HeartPulse,
  GraduationCap,
  Hotel,
  Factory,
  ShoppingBag,
  Home,
  Landmark,
};

/**
 * Editorial bento layout for the 8 industries — varied tile sizes
 * (one large hero, one wide tile, six standard tiles) — NOT a
 * generic identical-card grid. Falls back to standard tiles when
 * fewer industries are present.
 *
 * Desktop (lg, 4 cols × 3 rows):
 *   Row 1: [ Corporate (2×2 hero) ][ Healthcare ][ Education    ]
 *   Row 2: [    (cont.)         ][ Hospitality ][ Industrial ]
 *   Row 3: [ Retail ][ Resident.][ Public Sector (2×1 wide)  ]
 *
 * Mobile (1 col) / sm (2 cols): tiles flow naturally and stack.
 */
export function IndustriesIndexPage() {
  const reduce = useReducedMotion();
  const industries = useIndustries();

  const tileClass = (i: number, total: number) => {
    if (total < 4) return "";
    // First tile: large hero (2×2). Last tile: wide (2×1).
    if (i === 0) return "lg:col-span-2 lg:row-span-2";
    if (i === total - 1) return "lg:col-span-2";
    return "";
  };

  const isLarge = (i: number, total: number) =>
    total >= 4 && i === 0;
  const isWide = (i: number, total: number) =>
    total >= 4 && i === total - 1;

  return (
    <>
      {/* HERO */}
      <section
        aria-label="Industries"
        className="relative isolate overflow-hidden"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 55%), radial-gradient(ellipse at 15% 80%, color-mix(in srgb, var(--accent-cyan) 14%, transparent) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 coordinate-marks" aria-hidden />

        <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Industries", path: "/industries" },
            ]}
          />
          <div className="mt-8 max-w-3xl">
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
                Eight industries · One practice
              </span>
            </motion.div>
            <h1
              className="mt-6 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(2.5rem, 5.5vw, 4rem)",
                lineHeight: 1.03,
                color: "var(--text-primary)",
              }}
            >
              One practice, applied to your industry.
            </h1>
            <p
              className="mt-5 max-w-xl text-pretty"
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              The discipline is the same across every industry: documented
              design, certified install, evidence-pack handover, recurring
              operations cadence. What changes is the risk profile and the
              operational tempo. Each industry gets a tuned version of the
              practice — not a generic parts list.
            </p>
          </div>
        </div>
      </section>

      {/* INDUSTRIES — editorial asymmetric bento grid */}
      <section
        aria-label="Industries served"
        className="py-16 sm:py-20"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-3">
            {industries.map((industry, i) => {
              const Icon = industry.icon
                ? ICONS[industry.icon] || Building2
                : Building2;
              const large = isLarge(i, industries.length);
              const wide = isWide(i, industries.length);
              const span = tileClass(i, industries.length);

              return (
                <motion.article
                  key={industry.slug}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-xl border transition-all hover:-translate-y-0.5",
                    span
                  )}
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                    minHeight: large ? "320px" : wide ? "180px" : "220px",
                  }}
                >
                  {/* Accent bar that animates in on hover */}
                  <div
                    className="h-0.5 w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--accent), var(--accent-cyan))",
                    }}
                    aria-hidden
                  />

                  {large ? (
                    // LARGE HERO TILE — cover image + overlay + expanded copy
                    <Link
                      to={`/industries/${industry.slug}`}
                      className="relative flex h-full flex-col p-7"
                      aria-label={`${industry.name} — view industry`}
                    >
                      {industry.coverImage && (
                        <>
                          <img
                            src={industry.coverImage}
                            alt={`${industry.name} industry illustration`}
                            width={800}
                            height={600}
                            className="absolute inset-0 size-full object-cover opacity-35 transition-opacity duration-500 group-hover:opacity-55"
                            loading="lazy"
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(180deg, color-mix(in srgb, var(--bg-deep) 50%, transparent) 0%, color-mix(in srgb, var(--bg-deep) 88%, transparent) 100%)",
                            }}
                            aria-hidden
                          />
                          <div
                            className="absolute inset-0 grid-bg-fine opacity-20"
                            aria-hidden
                          />
                        </>
                      )}
                      <div className="relative flex items-center justify-between">
                        <div
                          className="flex size-12 items-center justify-center rounded-lg border"
                          style={{
                            borderColor: "var(--accent)",
                            backgroundColor:
                              "color-mix(in srgb, var(--accent) 14%, transparent)",
                          }}
                        >
                          <Icon
                            className="size-6"
                            style={{ color: "var(--accent-bright)" }}
                            aria-hidden
                          />
                        </div>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest"
                          style={{
                            borderColor: "var(--accent)",
                            backgroundColor:
                              "color-mix(in srgb, var(--accent) 14%, transparent)",
                            color: "var(--accent-bright)",
                          }}
                        >
                          Featured industry
                        </span>
                      </div>
                      <div className="relative mt-auto">
                        <div
                          className="font-mono text-[10px] uppercase tracking-widest"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Industry / {industry.slug.toUpperCase()}
                        </div>
                        <h3
                          className="mt-2 font-display text-2xl font-semibold tracking-tight"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {industry.name}
                        </h3>
                        <p
                          className="mt-2 max-w-md text-sm leading-relaxed"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {industry.tagline}
                        </p>
                        <p
                          className="mt-3 max-w-md text-xs leading-relaxed line-clamp-3"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {industry.overview}
                        </p>
                        <div
                          className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: "var(--accent-bright)" }}
                        >
                          View industry
                          <ArrowRight
                            className="size-3.5 transition-transform group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        </div>
                      </div>
                    </Link>
                  ) : wide ? (
                    // WIDE TILE — horizontal layout (icon | copy | arrow)
                    <Link
                      to={`/industries/${industry.slug}`}
                      className="flex h-full items-center gap-5 p-6"
                      aria-label={`${industry.name} — view industry`}
                    >
                      <div
                        className="flex size-12 shrink-0 items-center justify-center rounded-lg border"
                        style={{
                          borderColor: "var(--accent)",
                          backgroundColor:
                            "color-mix(in srgb, var(--accent) 12%, transparent)",
                        }}
                      >
                        <Icon
                          className="size-5"
                          style={{ color: "var(--accent-bright)" }}
                          aria-hidden
                        />
                      </div>
                      <div className="flex-1">
                        <div
                          className="font-mono text-[10px] uppercase tracking-widest"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Industry / {industry.slug.toUpperCase()}
                        </div>
                        <h3
                          className="mt-1 font-display text-lg font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {industry.name}
                        </h3>
                        <p
                          className="mt-1 text-sm leading-relaxed"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {industry.tagline}
                        </p>
                      </div>
                      <ArrowRight
                        className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                        style={{ color: "var(--text-muted)" }}
                        aria-hidden
                      />
                    </Link>
                  ) : (
                    // STANDARD TILE — vertical card
                    <Link
                      to={`/industries/${industry.slug}`}
                      className="block h-full p-5"
                      aria-label={`${industry.name} — view industry`}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="flex size-10 items-center justify-center rounded-lg border"
                          style={{
                            borderColor: "var(--accent)",
                            backgroundColor:
                              "color-mix(in srgb, var(--accent) 12%, transparent)",
                          }}
                        >
                          <Icon
                            className="size-5"
                            style={{ color: "var(--accent-bright)" }}
                            aria-hidden
                          />
                        </div>
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-0.5"
                          style={{ color: "var(--text-muted)" }}
                          aria-hidden
                        />
                      </div>
                      <h3
                        className="mt-4 font-display text-base font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {industry.name}
                      </h3>
                      <p
                        className="mt-1.5 text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {industry.tagline}
                      </p>
                      <p
                        className="mt-3 text-[10px] font-mono uppercase tracking-widest"
                        style={{ color: "var(--text-muted)" }}
                      >
                        View industry →
                      </p>
                    </Link>
                  )}
                </motion.article>
              );
            })}
          </div>

          {/* Coordinate footnote — reinforces editorial / technical feel */}
          <div
            className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--text-muted)",
            }}
          >
            <span className="font-mono uppercase tracking-widest">
              {industries.length} industries · One engineering practice
            </span>
            <span className="font-mono">
              Don&apos;t see yours? —&nbsp;
              <Link
                to="/contact"
                className="underline-offset-4 transition-colors hover:text-[var(--accent-bright)] hover:underline"
              >
                Talk to us
              </Link>
            </span>
          </div>
        </div>
      </section>

      <CtaBandSection />
    </>
  );
}
