"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Search,
  X,
  HelpCircle,
  PackageSearch,
  Star,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { EmptyState } from "@/components/site/EmptyState";
import { CtaBandSection } from "@/components/sections/CtaBandSection";
import { useFaqs, useServiceCategories } from "@/lib/content-store";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

// Popular FAQ IDs (manually curated; could be replaced by analytics)
const POPULAR_IDS = ["f5", "f1", "f9", "f12"];

export function FaqPage() {
  const reduce = useReducedMotion();
  const faqs = useFaqs();
  const categories = useServiceCategories();
  const [search, setSearch] = useState("");
  // Debounce the search input by 200ms to avoid re-filtering on every keystroke
  const debouncedSearch = useDebouncedValue(search, 200);

  // Group FAQs by categorySlug, preserving first-appearance order
  const grouped = useMemo(() => {
    const map = new Map<string, typeof faqs>();
    faqs.forEach((f) => {
      if (!map.has(f.categorySlug)) map.set(f.categorySlug, []);
      map.get(f.categorySlug)!.push(f);
    });
    return Array.from(map.entries());
  }, [faqs]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return null;
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }, [faqs, debouncedSearch]);

  const popularFaqs = useMemo(
    () => faqs.filter((f) => POPULAR_IDS.includes(f.id)),
    [faqs]
  );

  const categoryName = (slug: string) =>
    slug === "general"
      ? "General"
      : categories.find((c) => c.slug === slug)?.name || slug;

  return (
    <>
      {/* HERO */}
      <section
        aria-label="Frequently asked questions"
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
              { name: "FAQ", path: "/faq" },
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
                FAQ · {faqs.length} questions
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
              Honest answers to the questions buyers ask.
            </h1>
            <p
              className="mt-5 max-w-xl text-pretty"
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              The questions our sales engineers actually hear — organized by
              service category. If you don&apos;t see yours, ask us directly.
            </p>
          </div>

          {/* SEARCH */}
          <div className="mt-10 max-w-2xl">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
                aria-hidden
              />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions and answers…"
                aria-label="Search FAQs"
                className="h-11 pl-10"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex size-6 items-center justify-center rounded-md hover:bg-[var(--surface-2)]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR */}
      {!debouncedSearch && popularFaqs.length > 0 && (
        <section
          aria-label="Popular questions"
          className="py-12 sm:py-16"
          style={{ backgroundColor: "var(--bg-navy)" }}
        >
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4" style={{ color: "var(--accent-bright)" }} aria-hidden />
              <div className="eyebrow">Popular</div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {popularFaqs.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-xl border p-5"
                  style={{
                    borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)",
                    backgroundColor: "color-mix(in srgb, var(--accent) 6%, var(--surface-1))",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest"
                      style={{
                        borderColor: "var(--accent)",
                        backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)",
                        color: "var(--accent-bright)",
                      }}
                    >
                      <Star className="size-2.5" aria-hidden />
                      Popular
                    </div>
                  </div>
                  <h3
                    className="mt-3 font-display text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {f.question}
                  </h3>
                  <p
                    className="mt-2 text-xs leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {f.answer}
                  </p>
                  <p
                    className="mt-3 text-[10px] uppercase tracking-widest"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {categoryName(f.categorySlug)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ ACCORDIONS GROUPED */}
      <section
        aria-label="All FAQs"
        className="py-12 sm:py-16"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {filtered ? (
            filtered.length === 0 ? (
              <EmptyState
                eyebrow="No matches"
                icon={PackageSearch}
                title="No questions match your search"
                description="Try a different search term, or browse all FAQs by clearing the search."
                action={
                  <Button
                    onClick={() => setSearch("")}
                    style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                  >
                    Clear search
                  </Button>
                }
              />
            ) : (
              <div>
                <div className="eyebrow">{filtered.length} match{filtered.length === 1 ? "" : "es"}</div>
                <Accordion type="single" collapsible className="mt-4">
                  {filtered.map((f) => (
                    <AccordionItem
                      key={f.id}
                      value={f.id}
                      className="border-b last:border-b-0"
                      style={{ borderColor: "var(--border-subtle)" }}
                    >
                      <AccordionTrigger className="py-4 text-left text-sm font-medium">
                        {f.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {f.answer}
                        <div className="mt-3 text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                          {categoryName(f.categorySlug)}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )
          ) : (
            <div className="space-y-12">
              {grouped.map(([slug, groupFaqs]) => (
                <div key={slug}>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="size-4" style={{ color: "var(--accent-bright)" }} aria-hidden />
                    <h2
                      className="font-display text-lg font-semibold tracking-tight"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {categoryName(slug)}
                    </h2>
                    <span
                      className="ml-2 rounded-full border px-2 py-0.5 text-[10px] font-mono"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
                    >
                      {groupFaqs.length}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Accordion type="single" collapsible>
                      {groupFaqs.map((f) => (
                        <AccordionItem
                          key={f.id}
                          value={f.id}
                          className="border-b last:border-b-0"
                          style={{ borderColor: "var(--border-subtle)" }}
                        >
                          <AccordionTrigger className="py-4 text-left text-sm font-medium">
                            {f.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            {f.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* STILL HAVE QUESTIONS CTA */}
      <section
        aria-label="Still have questions"
        className="border-t py-16 sm:py-20"
        style={{
          backgroundColor: "var(--bg-navy)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="eyebrow">Still have questions?</div>
          <h2
            className="mt-4 font-display font-semibold tracking-tight text-balance"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              lineHeight: 1.1,
              color: "var(--text-primary)",
            }}
          >
            Ask a sales engineer directly.
          </h2>
          <p
            className="mx-auto mt-4 max-w-xl text-pretty"
            style={{
              fontSize: "1rem",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
            }}
          >
            No automated funnel, no commitment. Tell us about your facility and
            we&apos;ll tell you honestly whether we&apos;re the right partner
            for the size of your problem.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              <Link to="/contact" className="inline-flex items-center gap-2">
                Contact us
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <Link to="/services">Browse services</Link>
            </Button>
          </div>
        </div>
      </section>

      <CtaBandSection />
    </>
  );
}
