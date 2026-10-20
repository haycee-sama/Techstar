"use client";

import { useMemo } from "react";
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
  ArrowLeft,
  AlertTriangle,
  Compass,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { EmptyState } from "@/components/site/EmptyState";
import { CtaBandSection } from "@/components/sections/CtaBandSection";
import {
  useIndustry,
  useIndustries,
  useServices,
} from "@/lib/content-store";

interface IndustryDetailPageProps {
  slug?: string;
}

const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties; "aria-hidden"?: boolean }>> = {
  Building2,
  HeartPulse,
  GraduationCap,
  Hotel,
  Factory,
  ShoppingBag,
  Home,
  Landmark,
};

const CHALLENGE_ICONS = [Layers, ShieldCheck, Compass];

export function IndustryDetailPage({ slug }: IndustryDetailPageProps) {
  const reduce = useReducedMotion();
  const industry = useIndustry(slug);
  const industries = useIndustries();
  const services = useServices();

  const recommendedServices = useMemo(
    () =>
      industry
        ? (industry.recommendedServiceSlugs
            .map((s) => services.find((x) => x.slug === s))
            .filter(Boolean) as typeof services
          ).slice(0, 4)
        : [],
    [industry, services]
  );

  const relatedIndustries = useMemo(() => {
    if (!industry) return [];
    return industries.filter((i) => i.slug !== industry.slug).slice(0, 3);
  }, [industry, industries]);

  if (!industry) {
    return (
      <section
        aria-label="Industry not found"
        className="py-20"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Industries", path: "/industries" },
              { name: "Not found", path: "/industries/not-found" },
            ]}
          />
          <div className="mt-8">
            <EmptyState
              eyebrow="404"
              icon={AlertTriangle}
              title="Industry not found"
              description={`We couldn't find an industry with the slug "${slug || ""}". It may have been renamed or moved. Try the industries directory.`}
              action={
                <Button asChild style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                  <Link to="/industries" className="inline-flex items-center gap-2">
                    <ArrowLeft className="size-4" aria-hidden />
                    Back to industries
                  </Link>
                </Button>
              }
            />
          </div>
        </div>
      </section>
    );
  }

  const Icon = industry.icon ? ICONS[industry.icon] || Building2 : Building2;

  return (
    <>
      {/* HERO */}
      <section
        aria-label={`${industry.name} industry`}
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
              { name: industry.name, path: `/industries/${industry.slug}` },
            ]}
            currentLabel={industry.name}
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
                  Industry · {industry.name}
                </span>
              </motion.div>
              <h1
                className="mt-6 font-display font-semibold tracking-tight text-balance"
                style={{
                  fontSize: "clamp(2.25rem, 5vw, 4rem)",
                  lineHeight: 1.03,
                  color: "var(--text-primary)",
                }}
              >
                {industry.tagline}
              </h1>
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-5 max-w-xl text-pretty"
                style={{
                  fontSize: "1.0625rem",
                  lineHeight: 1.7,
                  color: "var(--text-secondary)",
                }}
              >
                {industry.overview}
              </motion.p>
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
                aria-label={`${industry.name} illustration`}
              >
                {industry.coverImage && (
                  <img
                    src={industry.coverImage}
                    alt={`${industry.name} industry illustration`}
                    width={800}
                    height={600}
                    className="absolute inset-0 size-full object-cover opacity-90"
                    loading="eager"
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg-deep) 70%, transparent) 100%)",
                  }}
                  aria-hidden
                />
                <div className="absolute inset-0 grid-bg-fine opacity-30" aria-hidden />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  <span className="font-mono">INDUSTRY / {industry.slug.toUpperCase()}</span>
                  <span className="font-mono">ILLUSTRATIVE</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* TOP CHALLENGES */}
      <section
        aria-label="Top challenges"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="eyebrow">Top challenges</div>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.08,
                color: "var(--text-primary)",
              }}
            >
              What {industry.name.toLowerCase()} facilities actually face.
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {industry.challenges.map((challenge, i) => {
              const Icon = CHALLENGE_ICONS[i % CHALLENGE_ICONS.length];
              return (
                <motion.div
                  key={challenge}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="rounded-xl border p-6"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg border"
                      style={{
                        borderColor: "var(--accent)",
                        backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
                      }}
                    >
                      <Icon className="size-5" style={{ color: "var(--accent-bright)" }} aria-hidden />
                    </div>
                    <div>
                      <div
                        className="font-mono text-[10px] uppercase tracking-widest"
                        style={{ color: "var(--text-muted)" }}
                      >
                        0{i + 1}
                      </div>
                      <p
                        className="mt-1 text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {challenge}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* RECOMMENDED SERVICES */}
      <section
        aria-label="Recommended services"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <div className="eyebrow">Recommended services</div>
              <h2
                className="mt-4 font-display font-semibold tracking-tight text-balance"
                style={{
                  fontSize: "clamp(1.875rem, 4vw, 3rem)",
                  lineHeight: 1.08,
                  color: "var(--text-primary)",
                }}
              >
                How we serve {industry.name.toLowerCase()}.
              </h2>
            </div>
            <Link
              to="/services"
              className="group inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: "var(--accent-bright)" }}
            >
              All services
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>

          {recommendedServices.length === 0 ? (
            <p className="mt-8 text-sm" style={{ color: "var(--text-muted)" }}>
              No specific services configured for this industry.
            </p>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recommendedServices.map((service, i) => (
                <motion.div
                  key={service.slug}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group flex flex-col rounded-xl border transition-all hover:-translate-y-0.5"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                  }}
                >
                  <Link to={`/services/${service.slug}`} className="flex h-full flex-col p-5">
                    <div
                      className="mb-3 h-0.5 w-10 origin-left scale-x-100"
                      style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-cyan))" }}
                      aria-hidden
                    />
                    <h3
                      className="font-display text-base font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {service.title}
                    </h3>
                    <p
                      className="mt-2 flex-1 text-xs leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {service.tagline}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-medium" style={{ color: "var(--accent-bright)" }}>
                      View service
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ILLUSTRATIVE EXAMPLE */}
      <section
        aria-label="Illustrative example"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-xl border p-7 sm:p-10"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--accent) 5%, var(--surface-1))",
            }}
          >
            <div
              className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest"
              style={{
                borderColor: "var(--accent)",
                backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)",
                color: "var(--accent-bright)",
              }}
            >
              Illustrative example
            </div>
            <div className="eyebrow">In practice</div>
            <h2
              className="mt-4 max-w-3xl font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
              style={{ color: "var(--text-primary)" }}
            >
              {industry.illustrativeExample.title.replace("Illustrative example — ", "")}
            </h2>
            <p
              className="mt-5 max-w-2xl text-pretty"
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.75,
                color: "var(--text-secondary)",
              }}
            >
              {industry.illustrativeExample.description}
            </p>
            <p
              className="mt-4 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Sample content for proposal purposes. Modeled on the actual shape
              of our work, not on any specific client engagement.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                asChild
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                <Link to="/contact" className="inline-flex items-center gap-2">
                  Talk to us about your facility
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                style={{ borderColor: "var(--border-strong)" }}
              >
                <Link to="/projects">See illustrative projects</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* RELATED INDUSTRIES */}
      <section
        aria-label="Related industries"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <div className="eyebrow">Related</div>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                lineHeight: 1.1,
                color: "var(--text-primary)",
              }}
            >
              Other industries we serve.
            </h2>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {relatedIndustries.map((rel, i) => {
              const RelIcon = rel.icon ? ICONS[rel.icon] || Building2 : Building2;
              return (
                <motion.div
                  key={rel.slug}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group rounded-xl border p-5 transition-all hover:-translate-y-0.5"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                  }}
                >
                  <Link to={`/industries/${rel.slug}`} className="block">
                    <div className="flex items-start justify-between">
                      <div
                        className="flex size-9 items-center justify-center rounded-lg border"
                        style={{
                          borderColor: "var(--accent)",
                          backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)",
                        }}
                      >
                        <RelIcon className="size-4" style={{ color: "var(--accent-bright)" }} aria-hidden />
                      </div>
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--text-muted)" }} aria-hidden />
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                      {rel.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {rel.tagline}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBandSection />
    </>
  );
}
