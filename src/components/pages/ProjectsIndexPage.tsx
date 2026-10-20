"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Search,
  X,
  PackageSearch,
  MapPin,
  CalendarDays,
  ImageOff,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { EmptyState } from "@/components/site/EmptyState";
import { CtaBandSection } from "@/components/sections/CtaBandSection";
import { useProjects } from "@/lib/content-store";

// Build the full category pool from all projects at runtime.
function useCategoryPool() {
  const projects = useProjects();
  return useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.categories.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [projects]);
}

function useYearPool() {
  const projects = useProjects();
  return useMemo(() => {
    const set = new Set<number>();
    projects.forEach((p) => set.add(p.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [projects]);
}

export function ProjectsIndexPage() {
  const reduce = useReducedMotion();
  const projects = useProjects();
  const categoryPool = useCategoryPool();
  const yearPool = useYearPool();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.categories.some((c) => c.toLowerCase().includes(q));
      const matchesCategory = !activeCategory || p.categories.includes(activeCategory);
      const matchesYear = !activeYear || p.year === activeYear;
      return matchesSearch && matchesCategory && matchesYear;
    });
  }, [projects, search, activeCategory, activeYear]);

  const clearFilters = () => {
    setSearch("");
    setActiveCategory(null);
    setActiveYear(null);
  };

  return (
    <>
      {/* HERO */}
      <section
        aria-label="Projects"
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
              { name: "Projects", path: "/projects" },
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
                Illustrative portfolio · {projects.length} projects
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
              Proof, not promises.
            </h1>
            <p
              className="mt-5 max-w-xl text-pretty"
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              Illustrative case studies for proposal purposes — each one
              modeled on the actual shape of our work and outcomes. Clients
              and locations are illustrative; the engineering is real.
            </p>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section
        aria-label="Filter projects"
        className="sticky top-[64px] z-30 border-y"
        style={{
          backgroundColor: "color-mix(in srgb, var(--bg-deep) 88%, transparent)",
          backdropFilter: "blur(10px)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="mx-auto max-w-[1320px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
                aria-hidden
              />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, client, location, or category…"
                aria-label="Search projects"
                className="pl-9"
                style={{
                  backgroundColor: "var(--surface-1)",
                  borderColor: "var(--border-subtle)",
                }}
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex size-6 items-center justify-center rounded-md hover:bg-[var(--surface-2)]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              )}
            </div>
            {yearPool.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="eyebrow">Year</span>
                <Select
                  value={activeYear ? String(activeYear) : "all"}
                  onValueChange={(v) => setActiveYear(v === "all" ? null : Number(v))}
                >
                  <SelectTrigger
                    className="h-9 w-[120px]"
                    aria-label="Filter by year"
                    style={{
                      backgroundColor: "var(--surface-1)",
                      borderColor: "var(--border-subtle)",
                    }}
                  >
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {yearPool.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {categoryPool.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="eyebrow">Categories</span>
              {categoryPool.map((c) => {
                const isActive = activeCategory === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveCategory(isActive ? null : c)}
                    className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
                    style={{
                      borderColor: isActive ? "var(--accent)" : "var(--border-subtle)",
                      backgroundColor: isActive
                        ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                        : "transparent",
                      color: isActive ? "var(--accent-bright)" : "var(--text-secondary)",
                    }}
                  >
                    {c}
                  </button>
                );
              })}
              {(activeCategory || activeYear || search) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] transition-colors hover:text-[var(--accent-bright)]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="size-3" aria-hidden />
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* PROJECT GRID */}
      <section
        aria-label="All projects"
        className="py-16 sm:py-20"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <div className="eyebrow">Directory</div>
              <h2
                className="mt-4 font-display font-semibold tracking-tight text-balance"
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  lineHeight: 1.08,
                  color: "var(--text-primary)",
                }}
              >
                {filtered.length === projects.length
                  ? `${filtered.length} illustrative projects`
                  : `${filtered.length} project${filtered.length === 1 ? "" : "s"} match${filtered.length === 1 ? "" : "es"} your filters`}
              </h2>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                eyebrow="No matches"
                icon={PackageSearch}
                title="No projects match your filters"
                description="Try clearing the search, switching the category, or choosing a different year. The full portfolio is one click away."
                action={
                  <Button
                    onClick={clearFilters}
                    style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                  >
                    Clear all filters
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project, i) => (
                <motion.article
                  key={project.slug}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                  className="group relative flex flex-col overflow-hidden rounded-xl border transition-all hover:-translate-y-0.5"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                  }}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt={`${project.title} — illustrative project imagery`}
                        width={1200}
                        height={800}
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "var(--surface-2)" }}>
                        <ImageOff className="size-6" style={{ color: "var(--text-muted)" }} aria-hidden />
                      </div>
                    )}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent 30%, color-mix(in srgb, var(--bg-deep) 70%, transparent) 100%)",
                      }}
                      aria-hidden
                    />
                    <div
                      className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest"
                      style={{
                        borderColor: "var(--accent)",
                        backgroundColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
                        color: "var(--accent-bright)",
                      }}
                    >
                      Illustrative
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap gap-1.5">
                      {project.categories.slice(0, 3).map((c) => (
                        <span
                          key={c}
                          className="rounded-full border px-2 py-0.5 text-[10px]"
                          style={{
                            borderColor: "var(--border-subtle)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                    <h3
                      className="mt-3 font-display text-lg font-semibold leading-snug"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <Link to={`/projects/${project.slug}`} className="transition-colors hover:text-[var(--accent-bright)]">
                        {project.title}
                      </Link>
                    </h3>
                    <p
                      className="mt-1 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {project.client}
                    </p>
                    <div
                      className="mt-3 flex items-center gap-4 border-t pt-3 text-[11px]"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3" aria-hidden />
                        {project.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3" aria-hidden />
                        {project.year}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        to={`/projects/${project.slug}`}
                        className="group/link inline-flex items-center gap-1.5 text-sm font-medium"
                        style={{ color: "var(--accent-bright)" }}
                      >
                        View case study
                        <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-0.5" aria-hidden />
                      </Link>
                      <span
                        className="font-mono text-[10px] uppercase tracking-widest"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {project.status}
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          <div className="mt-16 flex justify-center">
            <Button
              asChild
              variant="ghost"
              className="inline-flex items-center gap-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <Link to="/projects">
                <ArrowLeft className="size-3.5" aria-hidden />
                Back to top
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <CtaBandSection />
    </>
  );
}
