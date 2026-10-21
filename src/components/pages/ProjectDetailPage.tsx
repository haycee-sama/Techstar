"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  MapPin,
  CalendarDays,
  Building2,
  Target,
} from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { EmptyState } from "@/components/site/EmptyState";
import { CtaBandSection } from "@/components/sections/CtaBandSection";
import { ProjectGallery } from "@/components/sections/ProjectGallery";
import { useProject, useProjects, useServices } from "@/lib/content-store";
import { sanitizeHtml } from "@/lib/utils";

interface ProjectDetailPageProps {
  slug?: string;
}

export function ProjectDetailPage({ slug }: ProjectDetailPageProps) {
  const reduce = useReducedMotion();
  const project = useProject(slug);
  const projects = useProjects();
  const services = useServices();
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const related = useMemo(
    () =>
      project
        ? (project.relatedProjectSlugs
            .map((s) => projects.find((x) => x.slug === s))
            .filter(Boolean) as typeof projects
          ).slice(0, 3)
        : [],
    [project, projects]
  );

  const projectServices = useMemo(() => {
    if (!project) return [];
    return project.categories
      .map((c) => services.find((s) => s.title.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(s.title.toLowerCase().split(" ")[0])))
      .filter(Boolean)
      .slice(0, 4) as typeof services;
  }, [project, services]);

  if (!project) {
    return (
      <section
        aria-label="Project not found"
        className="py-20"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Projects", path: "/projects" },
              { name: "Not found", path: "/projects/not-found" },
            ]}
          />
          <div className="mt-8">
            <EmptyState
              eyebrow="404"
              icon={AlertTriangle}
              title="Project not found"
              description={`We couldn't find a project with the slug "${slug || ""}". It may have been renamed or moved. Try the projects directory.`}
              action={
                <Button asChild style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                  <Link to="/projects" className="inline-flex items-center gap-2">
                    <ArrowLeft className="size-4" aria-hidden />
                    Back to projects
                  </Link>
                </Button>
              }
            />
          </div>
        </div>
      </section>
    );
  }

  const challengeParagraphs = project.challenge.split(/\n\n+/);
  const solutionParagraphs = project.solution.split(/\n\n+/);
  const implementationParagraphs = project.implementation.split(/\n\n+/);

  return (
    <>
      {/* ILLUSTRATIVE BANNER */}
      <div
        className="border-b px-4 py-2 text-center text-xs sm:px-6"
        style={{
          backgroundColor: "color-mix(in srgb, var(--warning) 10%, var(--bg-deep))",
          borderColor: "color-mix(in srgb, var(--warning) 35%, transparent)",
          color: "var(--text-secondary)",
        }}
        role="note"
      >
        <span style={{ color: "var(--warning)" }} className="font-semibold">
          Illustrative demonstration project.
        </span>{" "}
        Clients, locations, and metrics are sample content for proposal purposes.
      </div>

      {/* HERO */}
      <section
        aria-label={project.title}
        className="relative isolate overflow-hidden"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 55%)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 coordinate-marks" aria-hidden />

        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Projects", path: "/projects" },
              { name: project.title, path: `/projects/${project.slug}` },
            ]}
            currentLabel={project.title}
          />

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
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
                  Project · {project.year}
                </span>
              </motion.div>
              <h1
                className="mt-6 font-display font-semibold tracking-tight text-balance"
                style={{
                  fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
                  lineHeight: 1.04,
                  color: "var(--text-primary)",
                }}
              >
                {project.title}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-4" style={{ color: "var(--text-muted)" }} aria-hidden />
                  {project.client}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" style={{ color: "var(--text-muted)" }} aria-hidden />
                  {project.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" style={{ color: "var(--text-muted)" }} aria-hidden />
                  {project.year}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <motion.div
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border clip-corner"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-1)",
                }}
                aria-label="Project cover image"
              >
                {project.coverImage && (
                  <img
                    src={project.coverImage}
                    alt={`${project.title} — illustrative cover image`}
                    width={1200}
                    height={800}
                    className="absolute inset-0 size-full object-cover opacity-95"
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
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  <span className="font-mono">PROJECT / {project.slug.slice(0, 12).toUpperCase()}</span>
                  <span className="font-mono">ILLUSTRATIVE</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CHALLENGE */}
      <section
        aria-label="Challenge"
        className="py-16 sm:py-20"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="eyebrow">Challenge</div>
              <h2
                className="mt-4 font-display font-semibold tracking-tight text-balance"
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  lineHeight: 1.08,
                  color: "var(--text-primary)",
                }}
              >
                The situation we walked into.
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-5">
              {challengeParagraphs.map((p, i) => (
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
                  {sanitizeHtml(p)}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section
        aria-label="Solution"
        className="py-16 sm:py-20"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="eyebrow">Solution</div>
              <h2
                className="mt-4 font-display font-semibold tracking-tight text-balance"
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  lineHeight: 1.08,
                  color: "var(--text-primary)",
                }}
              >
                What we designed.
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-5">
              {solutionParagraphs.map((p, i) => (
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
                  {sanitizeHtml(p)}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* IMPLEMENTATION */}
      <section
        aria-label="Implementation"
        className="py-16 sm:py-20"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="eyebrow">Implementation</div>
              <h2
                className="mt-4 font-display font-semibold tracking-tight text-balance"
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  lineHeight: 1.08,
                  color: "var(--text-primary)",
                }}
              >
                How we shipped it.
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-5">
              {implementationParagraphs.map((p, i) => (
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
                  {sanitizeHtml(p)}
                </motion.p>
              ))}
              <div className="mt-4 rounded-lg border p-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
                <div className="eyebrow">Sub-steps</div>
                <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {[
                    "Discovery and inventory: existing devices, firmware, network exposure, and operational tempo documented.",
                    "Design phase: coverage, segmentation, and lifecycle modeled with the budget in mind.",
                    "Phased deployment: off-hours cutover windows sequenced around operations, with per-zone acceptance testing.",
                    "Handover: as-builts, test reports, and an inspection cadence delivered as a first-class evidence pack.",
                  ].map((step, i) => {
                    const isOpen = expandedSteps.has(i);
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => {
                            const next = new Set(expandedSteps);
                            if (isOpen) next.delete(i);
                            else next.add(i);
                            setExpandedSteps(next);
                          }}
                          className="flex w-full items-start gap-2 text-left"
                          aria-expanded={isOpen}
                        >
                          <span
                            className="mt-1.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]"
                            style={{
                              borderColor: "var(--accent)",
                              color: "var(--accent-bright)",
                              backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)",
                            }}
                          >
                            0{i + 1}
                          </span>
                          <span>{step}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SYSTEM CATEGORIES */}
      <section
        aria-label="System categories"
        className="py-12 sm:py-16"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="eyebrow">System categories</div>
            <Link
              to="/services"
              className="group inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "var(--accent-bright)" }}
            >
              All services
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.categories.map((c) => {
              const matchedService = projectServices.find(
                (s) => s.title.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(s.title.toLowerCase().split(" ")[0])
              );
              return (
                <span
                  key={c}
                  className="rounded-full border px-3 py-1 text-xs font-medium"
                  style={{
                    borderColor: "var(--accent)",
                    backgroundColor: "color-mix(in srgb, var(--accent) 8%, transparent)",
                    color: "var(--accent-bright)",
                  }}
                >
                  {c}
                </span>
              );
            })}
          </div>
          {projectServices.length > 0 && (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {projectServices.map((s) => (
                <Link
                  key={s.slug}
                  to={`/services/${s.slug}`}
                  className="group rounded-lg border p-3 transition-all hover:-translate-y-0.5"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                  }}
                >
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    Service
                  </div>
                  <div className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {s.title}
                  </div>
                  <div className="mt-1 text-[10px] inline-flex items-center gap-1" style={{ color: "var(--accent-bright)" }}>
                    View {s.title}
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* OUTCOMES */}
      <section
        aria-label="Outcomes"
        className="py-16 sm:py-20"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="eyebrow">Outcomes</div>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.08,
                color: "var(--text-primary)",
              }}
            >
              What changed for the client.
            </h2>
            <p
              className="mt-4 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Illustrative metrics — sample content for proposal purposes.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {project.outcomes.map((o, i) => (
              <motion.div
                key={o.label}
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
                <Target className="size-5" style={{ color: "var(--accent-bright)" }} aria-hidden />
                <div
                  className="mt-3 font-display text-2xl font-semibold tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {o.value}
                </div>
                <div className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {o.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      {project.gallery && project.gallery.length > 0 && (
        <section
          aria-label="Project gallery"
          className="py-16 sm:py-20"
          style={{ backgroundColor: "var(--bg-deep)" }}
        >
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <div className="eyebrow">Gallery</div>
              <h2
                className="mt-4 font-display font-semibold tracking-tight text-balance"
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  lineHeight: 1.08,
                  color: "var(--text-primary)",
                }}
              >
                Imagery from the project.
              </h2>
              <p
                className="mt-3 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                All imagery is illustrative — sample placeholder content for
                proposal purposes. Click any image for a full view.
              </p>
            </div>
            <div className="mt-8">
              <ProjectGallery images={project.gallery} alt={project.title} />
            </div>
          </div>
        </section>
      )}

      {/* RELATED PROJECTS */}
      {related.length > 0 && (
        <section
          aria-label="Related projects"
          className="py-16 sm:py-20"
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
                  More illustrative projects.
                </h2>
              </div>
              <Link
                to="/projects"
                className="group inline-flex items-center gap-1.5 text-sm font-medium"
                style={{ color: "var(--accent-bright)" }}
              >
                All projects
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {related.map((r, i) => (
                <motion.div
                  key={r.slug}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group rounded-xl border transition-all hover:-translate-y-0.5"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                  }}
                >
                  <Link to={`/projects/${r.slug}`} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl">
                      {r.coverImage && (
                        <img
                          src={r.coverImage}
                          alt={`${r.title} — illustrative imagery`}
                          width={1200}
                          height={800}
                          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {r.categories.slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="rounded-full border px-2 py-0.5 text-[10px]"
                            style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      <h3 className="mt-2 font-display text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {r.title}
                      </h3>
                      <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {r.client} · {r.year}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBandSection />
    </>
  );
}
