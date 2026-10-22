"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Search,
  X,
  PackageSearch,
  Clock,
  CalendarDays,
  Mail,
} from "lucide-react";
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
import {
  useArticles,
  useAuthors,
  useServiceCategories,
} from "@/lib/content-store";
import { toast } from "sonner";
import { formatDate, stripHtml } from "@/lib/utils";

export function InsightsIndexPage() {
  const reduce = useReducedMotion();
  const articles = useArticles();
  const authors = useAuthors();
  const categories = useServiceCategories();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [limit, setLimit] = useState(6);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  const tagPool = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => a.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [articles]);

  const categoryPool = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => set.add(a.categorySlug));
    return Array.from(set);
  }, [articles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles
      .filter((a) => a.status === "published")
      .filter((a) => {
        const matchesSearch =
          !q ||
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          stripHtml(a.body).toLowerCase().includes(q);
        const matchesCategory = !activeCategory || a.categorySlug === activeCategory;
        const matchesTag = !activeTag || a.tags.includes(activeTag);
        return matchesSearch && matchesCategory && matchesTag;
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [articles, search, activeCategory, activeTag]);

  const featured = filtered.filter((a) => a.featured).slice(0, 1);
  const list = filtered;
  const visibleListFinal = list.slice(0, limit);
  const hasMore = filtered.length > limit;

  const clearFilters = () => {
    setSearch("");
    setActiveCategory(null);
    setActiveTag(null);
    setLimit(6);
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubmitting(true);
    setTimeout(() => {
      setNewsletterSubmitting(false);
      setNewsletterEmail("");
      toast.success("Demo newsletter signup received.", {
        description: "This is a demo site — no email is actually sent.",
      });
    }, 600);
  };

  const authorFor = (id: string) => authors.find((a) => a.id === id);
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name || slug;

  return (
    <>
      {/* HERO */}
      <section
        aria-label="Insights"
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
              { name: "Insights", path: "/insights" },
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
                Editorial practice · {articles.length} articles
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
              Engineering, in plain language.
            </h1>
            <p
              className="mt-5 max-w-xl text-pretty"
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              Field notes from the engineering and operations practice —
              the dull fundamentals that actually prevent incidents, the
              trade-offs that don&apos;t make the brochure, and the
              conversations worth having before you sign.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED STORY */}
      {featured.length > 0 && !search && !activeCategory && !activeTag && (
        <section
          aria-label="Featured story"
          className="py-16 sm:py-20"
          style={{ backgroundColor: "var(--bg-navy)" }}
        >
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="eyebrow">Featured</div>
            {featured.map((article) => {
              const author = authorFor(article.authorId);
              return (
                <motion.article
                  key={article.slug}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.6 }}
                  className="mt-6 grid grid-cols-1 overflow-hidden rounded-xl border lg:grid-cols-2"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                  }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
                    {article.coverImage && (
                      <img
                        src={article.coverImage}
                        alt={`${article.title} — cover`}
                        width={1200}
                        height={700}
                        className="absolute inset-0 size-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, transparent 60%, color-mix(in srgb, var(--bg-deep) 80%, transparent) 100%)",
                      }}
                      aria-hidden
                    />
                    <div
                      className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest"
                      style={{
                        borderColor: "var(--accent)",
                        backgroundColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
                        color: "var(--accent-bright)",
                      }}
                    >
                      Featured
                    </div>
                  </div>
                  <div className="flex flex-col p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span
                        className="rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest"
                        style={{ borderColor: "var(--border-subtle)", color: "var(--accent-bright)" }}
                      >
                        {categoryName(article.categorySlug)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" aria-hidden />
                        {article.readingMinutes} min
                      </span>
                    </div>
                    <h2
                      className="mt-4 font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {article.title}
                    </h2>
                    <p
                      className="mt-4 text-pretty"
                      style={{
                        fontSize: "1rem",
                        lineHeight: 1.65,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {article.excerpt}
                    </p>
                    <div className="mt-5 flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      {author && (
                        <span>
                          {author.name} · {author.role}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3" aria-hidden />
                        {formatDate(article.publishedAt, "long")}
                      </span>
                    </div>
                    <div className="mt-6">
                      <Button
                        asChild
                        style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                      >
                        <Link to={`/insights/${article.slug}`} className="inline-flex items-center gap-2">
                          Read “{article.title}”
                          <ArrowRight className="size-4" aria-hidden />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>
      )}

      {/* FILTER BAR */}
      <section
        aria-label="Filter articles"
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
                placeholder="Search articles…"
                aria-label="Search articles"
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
          </div>
          {categoryPool.length > 0 && (
            <div className="hidden sm:flex mt-3 flex-wrap items-center gap-2">
              <span className="eyebrow">Topic</span>
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
                    {categoryName(c)}
                  </button>
                );
              })}
            </div>
          )}
          {tagPool.length > 0 && (
            <div className="hidden sm:flex mt-2 flex-wrap items-center gap-2">
              <span className="eyebrow">Tags</span>
              {tagPool.map((t) => {
                const isActive = activeTag === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveTag(isActive ? null : t)}
                    className="rounded-full border px-2 py-0.5 text-[10px] transition-colors"
                    style={{
                      borderColor: isActive ? "var(--accent)" : "var(--border-subtle)",
                      backgroundColor: isActive
                        ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                        : "transparent",
                      color: isActive ? "var(--accent-bright)" : "var(--text-muted)",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
              {(activeCategory || activeTag || search) && (
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

          {/* Mobile: dropdown filters */}
          <div className="sm:hidden mt-3 flex flex-col gap-2">
            {categoryPool.length > 0 && (
              <Select
                value={activeCategory || "all"}
                onValueChange={(v) => setActiveCategory(v === "all" ? null : v)}
              >
                <SelectTrigger className="w-full" aria-label="Filter by topic">
                  <SelectValue placeholder="All topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All topics</SelectItem>
                  {categoryPool.map((c) => (
                    <SelectItem key={c} value={c}>{categoryName(c)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {tagPool.length > 0 && (
              <Select
                value={activeTag || "all"}
                onValueChange={(v) => setActiveTag(v === "all" ? null : v)}
              >
                <SelectTrigger className="w-full" aria-label="Filter by tag">
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  {tagPool.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {(activeCategory || activeTag || search) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
                style={{ borderColor: "var(--border-strong)" }}
              >
                <X className="size-3.5" aria-hidden />
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ARTICLE LIST */}
      <section
        aria-label="All articles"
        className="py-16 sm:py-20"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <div className="eyebrow">Library</div>
              <h2
                className="mt-4 font-display font-semibold tracking-tight text-balance"
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  lineHeight: 1.08,
                  color: "var(--text-primary)",
                }}
              >
                {filtered.length === articles.length
                  ? `${filtered.length} articles`
                  : `${filtered.length} article${filtered.length === 1 ? "" : "s"} match${filtered.length === 1 ? "" : "es"} your filters`}
              </h2>
            </div>
          </div>

          {visibleListFinal.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                eyebrow="No matches"
                icon={PackageSearch}
                title="No articles match your filters"
                description="Try clearing the search, switching the topic, or removing a tag. The full library is one click away."
                action={
                  <Button onClick={clearFilters} style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                    Clear all filters
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="mt-12 space-y-12">
              {visibleListFinal.map((article, i) => {
                const author = authorFor(article.authorId);
                const isAlt = i % 2 === 1;
                return (
                  <li key={article.slug}>
                    <motion.article
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-10%" }}
                      transition={{ duration: 0.5 }}
                      className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10"
                    >
                      <Link
                        to={`/insights/${article.slug}`}
                        className={`group relative block overflow-hidden rounded-xl border clip-corner-sm ${
                          isAlt ? "lg:col-span-5 lg:order-2" : "lg:col-span-5"
                        }`}
                        style={{
                          borderColor: "var(--border-subtle)",
                          backgroundColor: "var(--surface-1)",
                          aspectRatio: "4/3",
                        }}
                      >
                        {article.coverImage && (
                          <img
                            src={article.coverImage}
                            alt={`${article.title} — cover`}
                            width={1200}
                            height={700}
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
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                          <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
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
                      <div className={isAlt ? "lg:col-span-7 lg:order-1" : "lg:col-span-7"}>
                        <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                          <span
                            className="rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest"
                            style={{ borderColor: "var(--border-subtle)", color: "var(--accent-bright)" }}
                          >
                            {categoryName(article.categorySlug)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" aria-hidden />
                            {article.readingMinutes} min read
                          </span>
                        </div>
                        <h3
                          className="mt-3 font-display text-2xl font-semibold tracking-tight text-balance"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <Link to={`/insights/${article.slug}`} className="transition-colors hover:text-[var(--accent-bright)]">
                            {article.title}
                          </Link>
                        </h3>
                        <p
                          className="mt-3 text-pretty"
                          style={{
                            fontSize: "0.9375rem",
                            lineHeight: 1.7,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {article.excerpt}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {article.tags.map((t) => (
                            <span
                              key={t}
                              className="rounded-full border px-2 py-0.5 text-[10px]"
                              style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="mt-5 flex items-center gap-3 border-t pt-4 text-xs" style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
                          {author && (
                            <span>
                              <span style={{ color: "var(--text-secondary)" }}>{author.name}</span> · {author.role}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="size-3" aria-hidden />
                            {formatDate(article.publishedAt, "long")}
                          </span>
                        </div>
                        <div className="mt-5">
                          <Button asChild variant="outline" style={{ borderColor: "var(--border-strong)" }}>
                            <Link to={`/insights/${article.slug}`} className="inline-flex items-center gap-2 text-sm">
                              Read “{article.title}”
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

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <Button
                onClick={() => setLimit((l) => l + 6)}
                variant="outline"
                style={{ borderColor: "var(--border-strong)" }}
              >
                Load more articles
              </Button>
            </div>
          )}

          <div className="mt-16 flex justify-center">
            <Button
              asChild
              variant="ghost"
              className="inline-flex items-center gap-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <Link to="/insights">
                <ArrowLeft className="size-3.5" aria-hidden />
                Back to top
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* NEWSLETTER SIGNUP */}
      <section
        aria-label="Newsletter signup"
        className="border-y py-12"
        style={{
          backgroundColor: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="eyebrow">Demo · Newsletter</div>
              <h2
                className="mt-2 font-display text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                One article a month. No funnel.
              </h2>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                Demo: signup is illustrative. No email is sent.
              </p>
            </div>
            <form
              onSubmit={handleNewsletter}
              className="flex w-full items-center gap-2 sm:w-auto"
            >
              <div className="relative flex-1 sm:w-72">
                <Mail
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                  aria-hidden
                />
                <Input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="you@company.com"
                  aria-label="Email address"
                  className="pl-9"
                  style={{
                    backgroundColor: "var(--bg-deep)",
                    borderColor: "var(--border-subtle)",
                  }}
                />
              </div>
              <Button
                type="submit"
                disabled={newsletterSubmitting}
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                {newsletterSubmitting ? "Subscribing…" : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <CtaBandSection />
    </>
  );
}
