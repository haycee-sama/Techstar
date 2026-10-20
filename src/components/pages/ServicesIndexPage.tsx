"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Star,
  X,
  PackageSearch,
} from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { EmptyState } from "@/components/site/EmptyState";
import { CtaBandSection } from "@/components/sections/CtaBandSection";
import { useServices, useServiceCategories } from "@/lib/content-store";
import { cn } from "@/lib/utils";


const FEATURED_SLUGS = [
  "cctv-video-surveillance",
  "cybersecurity",
  "smart-buildings-automation",
];

type CategoryGroup = "All" | "Security" | "Infrastructure" | "Smart Building" | "IT";

export function ServicesIndexPage() {
  const reduce = useReducedMotion();
  const services = useServices();
  const categories = useServiceCategories();
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<CategoryGroup>("All");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Build tag chips from capabilities (top 8 most-common)
  const tagPool = useMemo(() => {
    const map = new Map<string, number>();
    services.forEach((s) => {
      s.capabilities.slice(0, 3).forEach((c) => {
        const tag = c.split(" ").slice(0, 2).join(" ");
        map.set(tag, (map.get(tag) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [services]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      const cat = categories.find((c) => c.slug === s.categorySlug);
      const matchesGroup =
        activeGroup === "All"
          ? true
          : activeGroup === "IT"
          ? cat?.group === "Infrastructure" && s.slug === "it-support-managed-services"
          : cat?.group === activeGroup;
      const matchesSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.overview.toLowerCase().includes(q);
      const matchesTag =
        !activeTag ||
        s.capabilities.some((c) => c.toLowerCase().includes(activeTag.toLowerCase()));
      return matchesGroup && matchesSearch && matchesTag;
    });
  }, [services, categories, search, activeGroup, activeTag]);

  const featured = useMemo(
    () =>
      FEATURED_SLUGS.map((slug) => services.find((s) => s.slug === slug)).filter(
        Boolean
      ) as typeof services,
    [services]
  );

  const clearFilters = () => {
    setSearch("");
    setActiveGroup("All");
    setActiveTag(null);
  };

  return (
    <>
      {/* HERO */}
      <section
        aria-label="Services"
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
              { name: "Services", path: "/services" },
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
                Eight domains · One program
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
              Solutions from the perimeter to the network.
            </h1>
            <p
              className="mt-5 max-w-xl text-pretty"
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              Most security vendors sell you parts. Techstar designs, deploys,
              and operates eight domains as one coherent program — shared
              identity, shared network, shared documentation, single
              accountable owner.
            </p>
          </div>
        </div>
      </section>

      {/* SEARCH + FILTER BAR */}
      <section
        aria-label="Filter services"
        className="sticky top-[64px] z-30 border-y"
        style={{
          backgroundColor: "color-mix(in srgb, var(--bg-deep) 88%, transparent)",
          backdropFilter: "blur(10px)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="mx-auto max-w-[1320px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
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
                placeholder="Search by name, tagline, or capability…"
                aria-label="Search services"
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
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                className="hidden size-4 sm:block"
                style={{ color: "var(--text-muted)" }}
                aria-hidden
              />
              <ToggleGroup
                type="single"
                value={activeGroup}
                onValueChange={(v) => setActiveGroup((v as CategoryGroup) || "All")}
                aria-label="Filter by category"
                className="flex-wrap justify-start"
              >
                {(["All", "Security", "Infrastructure", "Smart Building", "IT"] as CategoryGroup[]).map((g) => (
                  <ToggleGroupItem
                    key={g}
                    value={g}
                    aria-label={g}
                    className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors data-[state=on]:border-[var(--accent)] data-[state=on]:bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] data-[state=on]:text-[var(--accent-bright)]"
                    style={{
                      borderColor: activeGroup === g ? "var(--accent)" : "var(--border-subtle)",
                      backgroundColor: activeGroup === g
                        ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                        : "transparent",
                      color: activeGroup === g ? "var(--accent-bright)" : "var(--text-secondary)",
                    }}
                  >
                    {g}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>

          {/* Tag chips */}
          {tagPool.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="eyebrow">Tags</span>
              {tagPool.map((tag) => {
                const isActive = activeTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(isActive ? null : tag)}
                    className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
                    style={{
                      borderColor: isActive ? "var(--accent)" : "var(--border-subtle)",
                      backgroundColor: isActive
                        ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                        : "transparent",
                      color: isActive ? "var(--accent-bright)" : "var(--text-secondary)",
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
              {(activeTag || search || activeGroup !== "All") && (
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

      {/* FEATURED SERVICES */}
      {activeGroup === "All" && !search && !activeTag && featured.length > 0 && (
        <section
          aria-label="Featured services"
          className="py-16 sm:py-20"
          style={{ backgroundColor: "var(--bg-navy)" }}
        >
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <div className="eyebrow">Featured</div>
                <h2
                  className="mt-4 font-display font-semibold tracking-tight text-balance"
                  style={{
                    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                    lineHeight: 1.08,
                    color: "var(--text-primary)",
                  }}
                >
                  Flagship programs.
                </h2>
              </div>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {featured.map((service, i) => (
                <motion.article
                  key={service.slug}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group relative flex flex-col overflow-hidden rounded-xl border"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                  }}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    {service.heroMedia && (
                      <img
                        src={service.heroMedia}
                        alt={`${service.title} illustration`}
                        width={1200}
                        height={800}
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg-deep) 75%, transparent) 100%)",
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
                      <Star className="size-3" aria-hidden />
                      Featured
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3
                      className="font-display text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {service.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {service.tagline}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {service.capabilities.slice(0, 3).map((c) => (
                        <span
                          key={c}
                          className="rounded-full border px-2 py-0.5 text-[10px]"
                          style={{
                            borderColor: "var(--border-subtle)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {c.split(" ").slice(0, 2).join(" ")}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
                      <Link
                        to={`/services/${service.slug}`}
                        className="group/link inline-flex items-center gap-1.5 text-sm font-medium"
                        style={{ color: "var(--accent-bright)" }}
                      >
                        Learn more
                        <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-0.5" aria-hidden />
                      </Link>
                      <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {service.slug.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SERVICE DIRECTORY */}
      <section
        aria-label="All services"
        className="py-16 sm:py-20"
        style={{ backgroundColor: "var(--bg-deep)" }}
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
                {filtered.length === services.length
                  ? `All ${services.length} services.`
                  : `${filtered.length} service${filtered.length === 1 ? "" : "s"} match${filtered.length === 1 ? "" : "es"} your filters.`}
              </h2>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                eyebrow="No matches"
                icon={PackageSearch}
                title="No services match your filters"
                description="Try clearing the search, switching to a different category, or removing a tag. The full directory is one click away."
                action={
                  <Button
                    onClick={clearFilters}
                    style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                  >
                    Clear all filters
                  </Button>
                }
                secondaryAction={
                  <Button asChild variant="outline" style={{ borderColor: "var(--border-strong)" }}>
                    <Link to="/contact">Ask us directly</Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="mt-12 space-y-12">
              {filtered.map((service, i) => {
                const isAlt = i % 2 === 1;
                return (
                  <li key={service.slug}>
                    <motion.article
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-10%" }}
                      transition={{ duration: 0.5 }}
                      className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10"
                    >
                      {/* Image */}
                      <Link
                        to={`/services/${service.slug}`}
                        className={cn(
                          "group relative block overflow-hidden rounded-xl border clip-corner-sm",
                          isAlt ? "lg:col-span-5 lg:order-2" : "lg:col-span-5"
                        )}
                        style={{
                          borderColor: "var(--border-subtle)",
                          backgroundColor: "var(--surface-1)",
                          aspectRatio: "4/3",
                        }}
                      >
                        {service.heroMedia && (
                          <img
                            src={service.heroMedia}
                            alt={`${service.title} illustration`}
                            width={1200}
                            height={800}
                            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
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
                        <div className="absolute inset-0 grid-bg-fine opacity-20" aria-hidden />
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                          <div>
                            <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                              {String(i + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}
                            </span>
                          </div>
                          <div
                            className="flex size-8 items-center justify-center rounded-full border transition-transform group-hover:translate-x-0.5"
                            style={{
                              borderColor: "var(--accent)",
                              backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)",
                            }}
                          >
                            <ArrowRight className="size-4" style={{ color: "var(--accent-bright)" }} aria-hidden />
                          </div>
                        </div>
                      </Link>

                      {/* Copy */}
                      <div className={cn("lg:col-span-7", isAlt ? "lg:order-1" : "")}>
                        <div className="eyebrow">
                          {categories.find((c) => c.slug === service.categorySlug)?.group || "Service"}
                        </div>
                        <h3
                          className="mt-2 font-display text-2xl font-semibold tracking-tight"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <Link to={`/services/${service.slug}`} className="transition-colors hover:text-[var(--accent-bright)]">
                            {service.title}
                          </Link>
                        </h3>
                        <p
                          className="mt-2 text-sm font-medium"
                          style={{ color: "var(--accent-bright)" }}
                        >
                          {service.tagline}
                        </p>
                        <p
                          className="mt-3 text-pretty"
                          style={{
                            fontSize: "0.9375rem",
                            lineHeight: 1.7,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {service.overview.split(/\n/)[0].slice(0, 180)}
                          {service.overview.split(/\n/)[0].length > 180 ? "…" : ""}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {service.capabilities.slice(0, 4).map((c) => (
                            <span
                              key={c}
                              className="rounded-full border px-2 py-0.5 text-[10px]"
                              style={{
                                borderColor: "var(--border-subtle)",
                                color: "var(--text-muted)",
                              }}
                            >
                              {c.split(" ").slice(0, 3).join(" ")}
                            </span>
                          ))}
                        </div>
                        <div className="mt-5">
                          <Button asChild variant="outline" style={{ borderColor: "var(--border-strong)" }}>
                            <Link to={`/services/${service.slug}`} className="inline-flex items-center gap-2 text-sm">
                              View service
                              <ArrowRight className="size-4" aria-hidden />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </motion.article>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Back-to-top of services */}
          <div className="mt-16 flex justify-center">
            <Button
              asChild
              variant="ghost"
              className="inline-flex items-center gap-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <Link to="/services">
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
