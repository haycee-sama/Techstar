"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Compass,
  DraftingCompass,
  Hammer,
  LifeBuoy,
  Download,
  AlertTriangle,
  Tag,
} from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { EmptyState } from "@/components/site/EmptyState";
import { StickySectionNav } from "@/components/sections/StickySectionNav";
import { ServiceDetailHero } from "@/components/sections/ServiceDetailHero";
import { CtaBandSection } from "@/components/sections/CtaBandSection";
import { useService, useServices, useServiceCategories } from "@/lib/content-store";
import { toast } from "sonner";
import { sanitizeHtml } from "@/lib/utils";

interface ServiceDetailPageProps {
  slug?: string;
}

const PROCESS_STEPS = [
  { key: "discover" as const, label: "Discover", icon: Compass },
  { key: "design" as const, label: "Design", icon: DraftingCompass },
  { key: "deploy" as const, label: "Deploy", icon: Hammer },
  { key: "support" as const, label: "Support", icon: LifeBuoy },
];

const SECTION_IDS = [
  { id: "overview", label: "Overview" },
  { id: "benefits", label: "Benefits" },
  { id: "capabilities", label: "Capabilities" },
  { id: "process", label: "Process" },
  { id: "use-cases", label: "Use cases" },
  { id: "faq", label: "FAQ" },
  { id: "related", label: "Related" },
];

export function ServiceDetailPage({ slug }: ServiceDetailPageProps) {
  const service = useService(slug);
  const services = useServices();
  const categories = useServiceCategories();
  const reduce = useReducedMotion();
  const [activeFaq, setActiveFaq] = useState<string>("");

  const category = useMemo(
    () => (service ? categories.find((c) => c.slug === service.categorySlug) : undefined),
    [service, categories]
  );

  const related = useMemo(
    () =>
      service
        ? (service.relatedServiceSlugs
            .map((s) => services.find((x) => x.slug === s))
            .filter(Boolean) as typeof services
          ).slice(0, 3)
        : [],
    [service, services]
  );

  if (!service) {
    return (
      <section
        aria-label="Service not found"
        className="py-20"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Services", path: "/services" },
              { name: "Not found", path: "/services/not-found" },
            ]}
          />
          <div className="mt-8">
            <EmptyState
              eyebrow="404"
              icon={AlertTriangle}
              title="Service not found"
              description={`We couldn't find a service with the slug "${slug || ""}". It may have been renamed or moved. Try the services directory.`}
              action={
                <Button asChild style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                  <Link to="/services" className="inline-flex items-center gap-2">
                    <ArrowLeft className="size-4" aria-hidden />
                    Back to services
                  </Link>
                </Button>
              }
            />
          </div>
        </div>
      </section>
    );
  }

  const overviewParagraphs = service.overview.split(/\n\n+/);
  const sanitizedOverview = overviewParagraphs.map((p) => sanitizeHtml(p));

  const downloadBrief = () => {
    const text = [
      `Techstar — ${service.title}`,
      `Tagline: ${service.tagline}`,
      "",
      "Overview",
      "--------",
      service.overview,
      "",
      "Benefits",
      "--------",
      ...service.benefits.map((b, i) => `${i + 1}. ${b.title}\n   ${b.description}`),
      "",
      "Capabilities",
      "-------------",
      ...service.capabilities.map((c) => `- ${c}`),
      "",
      "Process",
      "-------",
      `Discover: ${service.process.discover}`,
      `Design: ${service.process.design}`,
      `Deploy: ${service.process.deploy}`,
      `Support: ${service.process.support}`,
      "",
      "Use cases",
      "---------",
      ...service.useCases.map((uc, i) => `${i + 1}. ${uc.title}\n   ${uc.description}`),
      "",
      "FAQ",
      "---",
      ...service.faqs.map((f, i) => `${i + 1}. ${f.question}\n   ${f.answer}`),
      "",
      "",
      "Illustrative brief — sample content for proposal purposes.",
      "Demo site — replace with finalized content before launch.",
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `techstar-${service.slug}-brief.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Illustrative brief downloaded.", {
      description: "Sample content — replace before launch.",
    });
  };

  return (
    <>
      <ServiceDetailHero service={service} category={category?.name} />

      {/* Sticky section nav */}
      <div
        className="sticky top-[64px] z-30 border-b"
        style={{
          backgroundColor: "color-mix(in srgb, var(--bg-deep) 88%, transparent)",
          backdropFilter: "blur(10px)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <StickySectionNav
            sections={SECTION_IDS}
            className="border-0 bg-transparent p-0"
          />
        </div>
      </div>

      {/* OVERVIEW */}
      <section
        id="overview"
        aria-label="Service overview"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="eyebrow">Overview</div>
              <h2
                className="mt-4 font-display font-semibold tracking-tight text-balance"
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  lineHeight: 1.08,
                  color: "var(--text-primary)",
                }}
              >
                {service.tagline}
              </h2>
              <p
                className="mt-4 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {service.title}
                {category ? ` · ${category.name}` : ""}
              </p>
            </div>
            <div className="lg:col-span-8 space-y-5">
              {sanitizedOverview.map((p, i) => (
                <motion.p
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: i * 0.04 }}
                  className="text-pretty"
                  style={{
                    fontSize: "1.0625rem",
                    lineHeight: 1.75,
                    color: "var(--text-secondary)",
                  }}
                >
                  {p}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS — editorial asymmetric grid */}
      <section
        id="benefits"
        aria-label="Benefits"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="eyebrow">Benefits</div>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.08,
                color: "var(--text-primary)",
              }}
            >
              What changes for your operations.
            </h2>
            <p
              className="mt-5 text-pretty"
              style={{ fontSize: "1.0625rem", lineHeight: 1.7, color: "var(--text-secondary)" }}
            >
              Six outcomes our clients actually feel — measured against the
              operational metrics your team reports on today.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {service.benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="group relative overflow-hidden rounded-xl border p-6"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-1)",
                }}
              >
                <div
                  className="absolute right-4 top-3 font-mono text-xs"
                  style={{ color: "var(--text-muted)" }}
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  className="mb-3 h-0.5 w-10 origin-left scale-x-100"
                  style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-cyan))" }}
                  aria-hidden
                />
                <h3
                  className="font-display text-lg font-semibold pr-8"
                  style={{ color: "var(--text-primary)" }}
                >
                  {b.title}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {b.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section
        id="capabilities"
        aria-label="Capabilities"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="eyebrow">Capabilities</div>
              <h2
                className="mt-4 font-display font-semibold tracking-tight text-balance"
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  lineHeight: 1.08,
                  color: "var(--text-primary)",
                }}
              >
                What we deliver.
              </h2>
              <p
                className="mt-4 text-pretty"
                style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--text-secondary)" }}
              >
                A capability is not a feature. It is something your team can
                point to in the design, the install, and the operations cadence
                — and it stays true as the facility changes.
              </p>
            </div>
            <div className="lg:col-span-8">
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {service.capabilities.map((c, i) => (
                  <motion.li
                    key={c}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.4, delay: (i % 2) * 0.05 }}
                    className="flex items-start gap-3 rounded-lg border p-3"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-1)",
                    }}
                  >
                    <div
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border"
                      style={{
                        borderColor: "var(--accent)",
                        backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
                      }}
                    >
                      <Check
                        className="size-3"
                        style={{ color: "var(--accent-bright)" }}
                        aria-hidden
                      />
                    </div>
                    <span className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {c}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section
        id="process"
        aria-label="Process"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="eyebrow">Process</div>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.08,
                color: "var(--text-primary)",
              }}
            >
              How this service is delivered.
            </h2>
          </div>
          <ol className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, i) => {
              const Icon = step.icon;
              const body = service.process[step.key];
              return (
                <motion.li
                  key={step.key}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative flex flex-col"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className="relative flex size-12 items-center justify-center rounded-full border"
                      style={{
                        borderColor: "var(--accent)",
                        backgroundColor: "var(--bg-deep)",
                        color: "var(--accent-bright)",
                      }}
                    >
                      <Icon className="size-5" aria-hidden />
                      <span
                        className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full text-[10px] font-mono font-semibold"
                        style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                      >
                        0{i + 1}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-display text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    {step.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {body}
                  </p>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* USE CASES */}
      <section
        id="use-cases"
        aria-label="Use cases"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="eyebrow">Use cases</div>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.08,
                color: "var(--text-primary)",
              }}
            >
              Where this service fits.
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {service.useCases.map((uc, i) => (
              <motion.article
                key={uc.title}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
                className="rounded-xl border p-6"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-1)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex size-8 items-center justify-center rounded-full border font-mono text-xs"
                    style={{
                      borderColor: "var(--accent)",
                      backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)",
                      color: "var(--accent-bright)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                      {uc.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {uc.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Tag className="size-3" style={{ color: "var(--text-muted)" }} aria-hidden />
                      <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                        Use case
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        aria-label="Service FAQ"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="eyebrow">FAQ</div>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.08,
                color: "var(--text-primary)",
              }}
            >
              Questions, answered.
            </h2>
          </div>
          <div className="mt-10">
            <Accordion
              type="single"
              collapsible
              value={activeFaq}
              onValueChange={setActiveFaq}
              className="rounded-xl border p-2"
              style={{
                borderColor: "var(--border-subtle)",
                backgroundColor: "var(--surface-1)",
              }}
            >
              {service.faqs.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border-b last:border-b-0"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <AccordionTrigger className="px-3 text-left text-sm font-medium">
                    {f.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="mt-6 text-center">
            <Button asChild variant="outline" style={{ borderColor: "var(--border-strong)" }}>
              <Link to="/faq">All FAQs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section
        id="related"
        aria-label="Related services"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
                Pair this with.
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
          {related.length === 0 ? (
            <p className="mt-8 text-sm" style={{ color: "var(--text-muted)" }}>
              No related services configured.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {related.map((r, i) => (
                <motion.div
                  key={r.slug}
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
                  <Link to={`/services/${r.slug}`} className="block">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                          Service
                        </div>
                        <h3 className="mt-1 font-display text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                          {r.title}
                        </h3>
                      </div>
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        style={{ color: "var(--accent-bright)" }}
                        aria-hidden
                      />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {r.tagline}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Download brief demo + CTA */}
      <section
        aria-label="Service brief download"
        className="border-y py-12"
        style={{
          backgroundColor: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-4 px-4 sm:px-6 lg:px-8 md:flex-row md:items-center">
          <div>
            <div className="eyebrow">Demo</div>
            <h3
              className="mt-2 font-display text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Download an illustrative service brief
            </h3>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              Plain-text export of this service&apos;s overview, benefits, capabilities,
              process, use cases, and FAQ. Clearly labeled sample content.
            </p>
          </div>
          <Button
            onClick={downloadBrief}
            variant="outline"
            className="inline-flex items-center gap-2"
            style={{ borderColor: "var(--border-strong)" }}
          >
            <Download className="size-4" aria-hidden />
            Download brief
          </Button>
        </div>
      </section>

      <CtaBandSection />
    </>
  );
}
