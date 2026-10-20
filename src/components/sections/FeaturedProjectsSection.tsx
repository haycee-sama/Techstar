"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "@/lib/router";
import { useContent } from "@/lib/content-store";

export function FeaturedProjectsSection() {
  const { projects } = useContent();
  const reduce = useReducedMotion();

  const featured = projects.filter((p) => p.featured).slice(0, 3);
  const list = featured.length >= 3 ? featured : projects.slice(0, 3);
  if (list.length === 0) return null;

  return (
    <section
      aria-label="Selected projects"
      className="relative py-20 sm:py-24"
      style={{ backgroundColor: "var(--bg-navy)" }}
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <div className="eyebrow">Selected projects</div>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.08,
                color: "var(--text-primary)",
              }}
            >
              Proof, not promises.
            </h2>
            <p
              className="mt-4 text-pretty"
              style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--text-secondary)" }}
            >
              Illustrative case studies for proposal purposes — each one
              modeled on the actual shape of our work and outcomes.
            </p>
          </div>
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--accent-bright)" }}
          >
            View all projects
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {list.map((project, i) => (
            <motion.article
              key={project.slug}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={i === 0 ? "md:col-span-2 md:row-span-1" : ""}
            >
              <Link
                to={`/projects/${project.slug}`}
                className="group relative block h-full overflow-hidden rounded-xl border"
                style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
              >
                <div
                  className="relative aspect-[16/10] overflow-hidden"
                  style={{ backgroundColor: "var(--surface-2)" }}
                >
                  <div className="absolute inset-0 grid-bg-fine opacity-30" aria-hidden />
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 30%, color-mix(in srgb, var(--bg-navy) 90%, transparent) 100%)",
                    }}
                    aria-hidden
                  />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
                    {project.categories.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className="rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest backdrop-blur-md"
                        style={{
                          borderColor: "var(--border-subtle)",
                          backgroundColor: "color-mix(in srgb, var(--bg-deep) 50%, transparent)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                    <span>PROJECT 0{i + 1} / 0{list.length}</span>
                    <span>{project.year}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--accent-bright)" }}>
                    {project.client}
                  </div>
                  <h3
                    className="mt-2 font-display text-lg font-semibold leading-snug"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {project.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    <MapPin className="size-3" aria-hidden />
                    {project.location}
                  </div>
                  <div
                    className="mt-4 inline-flex items-center gap-1 text-xs font-medium"
                    style={{ color: "var(--accent-bright)" }}
                  >
                    View case study
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
          All projects shown are illustrative demonstrations, modeled on real engagement patterns for proposal purposes.
        </p>
      </div>
    </section>
  );
}
