"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Clock,
  CalendarDays,
  Link2,
  Linkedin,
  Twitter,
  Facebook,
  Mail,
} from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { EmptyState } from "@/components/site/EmptyState";
import { ArticleBody } from "@/components/sections/ArticleBody";
import { CtaBandSection } from "@/components/sections/CtaBandSection";
import {
  useArticle,
  useArticles,
  useAuthors,
  useServiceCategories,
} from "@/lib/content-store";
import { toast } from "sonner";
import { copyToClipboard, formatDate } from "@/lib/utils";

interface ArticleDetailPageProps {
  slug?: string;
}

export function ArticleDetailPage({ slug }: ArticleDetailPageProps) {
  const reduce = useReducedMotion();
  const article = useArticle(slug);
  const articles = useArticles();
  const authors = useAuthors();
  const categories = useServiceCategories();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  const author = useMemo(
    () => (article ? authors.find((a) => a.id === article.authorId) : undefined),
    [article, authors]
  );

  const authorArticles = useMemo(
    () =>
      article
        ? articles
            .filter((a) => a.authorId === article.authorId && a.slug !== article.slug && a.status === "published")
            .slice(0, 3)
        : [],
    [article, articles]
  );

  const related = useMemo(() => {
    if (!article) return [];
    return articles
      .filter(
        (a) =>
          a.slug !== article.slug &&
          a.status === "published" &&
          (a.categorySlug === article.categorySlug ||
            a.tags.some((t) => article.tags.includes(t)))
      )
      .slice(0, 3);
  }, [article, articles]);

  if (!article) {
    return (
      <section
        aria-label="Article not found"
        className="py-20"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Insights", path: "/insights" },
              { name: "Not found", path: "/insights/not-found" },
            ]}
          />
          <div className="mt-8">
            <EmptyState
              eyebrow="404"
              icon={AlertTriangle}
              title="Article not found"
              description={`We couldn't find an article with the slug "${slug || ""}". It may have been renamed or moved. Try the insights library.`}
              action={
                <Button asChild style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                  <Link to="/insights" className="inline-flex items-center gap-2">
                    <ArrowLeft className="size-4" aria-hidden />
                    Back to insights
                  </Link>
                </Button>
              }
            />
          </div>
        </div>
      </section>
    );
  }

  const categoryName =
    categories.find((c) => c.slug === article.categorySlug)?.name || article.categorySlug;

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://techstar.example/insights/${article.slug}`;
  const shareText = encodeURIComponent(article.title);

  const shareButtons = [
    {
      label: "X / Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
  ];

  const copyLink = async () => {
    try {
      await copyToClipboard(shareUrl);
      toast.success("Link copied to clipboard.", {
        description: "Demo: share URLs are real, content is illustrative.",
      });
    } catch {
      toast.error("Couldn't copy the link. Try selecting it manually.");
    }
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

  return (
    <>
      {/* HERO */}
      <section
        aria-label={article.title}
        className="relative isolate overflow-hidden"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 coordinate-marks" aria-hidden />

        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Insights", path: "/insights" },
              { name: article.title, path: `/insights/${article.slug}` },
            ]}
            currentLabel={article.title.slice(0, 60) + (article.title.length > 60 ? "…" : "")}
          />

          <div className="mt-8 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <span
                className="rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest"
                style={{ borderColor: "var(--accent)", color: "var(--accent-bright)" }}
              >
                {categoryName}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" aria-hidden />
                {article.readingMinutes} min read
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3" aria-hidden />
                {formatDate(article.publishedAt, "long")}
              </span>
            </div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-5 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
                lineHeight: 1.05,
                color: "var(--text-primary)",
              }}
            >
              {article.title}
            </motion.h1>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5 max-w-2xl text-pretty"
              style={{
                fontSize: "1.125rem",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
              }}
            >
              {article.excerpt}
            </motion.p>

            {/* Author block */}
            {author && (
              <div className="mt-8 flex items-center gap-3 border-t pt-5" style={{ borderColor: "var(--border-subtle)" }}>
                <div
                  className="flex size-10 items-center justify-center rounded-full border font-display text-sm font-semibold"
                  style={{
                    borderColor: "var(--border-strong)",
                    backgroundColor: "color-mix(in srgb, var(--accent) 12%, var(--surface-2))",
                    color: "var(--accent-bright)",
                  }}
                  aria-hidden
                >
                  {author.name.split(" ").slice(0, 2).map((n) => n.charAt(0).toUpperCase()).join("")}
                </div>
                <div className="flex-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <div className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {author.name}
                  </div>
                  <div>{author.role}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* COVER IMAGE */}
      {article.coverImage && (
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7 }}
            className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border"
            style={{
              borderColor: "var(--border-subtle)",
              backgroundColor: "var(--surface-1)",
            }}
          >
            <img
              src={article.coverImage}
              alt={`${article.title} — cover image`}
              width={1200}
              height={700}
              className="absolute inset-0 size-full object-cover"
              loading="eager"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg-deep) 50%, transparent) 100%)",
              }}
              aria-hidden
            />
          </motion.div>
        </div>
      )}

      {/* BODY */}
      <section
        aria-label="Article body"
        className="py-12 sm:py-16"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <ArticleBody html={article.body} />
        </div>
      </section>

      {/* TAGS + SOCIAL */}
      <section
        aria-label="Tags and sharing"
        className="border-y py-8"
        style={{
          backgroundColor: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="mx-auto flex max-w-[1320px] flex-col items-start gap-4 px-4 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          {article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow">Tags</span>
              {article.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">Share</span>
            {shareButtons.map((b) => {
              const Icon = b.icon;
              return (
                <a
                  key={b.label}
                  href={b.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Share on ${b.label} — opens in new tab (demo)`}
                  className="inline-flex size-8 items-center justify-center rounded-full border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-bright)]"
                  style={{
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Icon className="size-4" aria-hidden />
                </a>
              );
            })}
            <button
              type="button"
              onClick={copyLink}
              aria-label="Copy link"
              className="inline-flex size-8 items-center justify-center rounded-full border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-bright)]"
              style={{
                borderColor: "var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              <Link2 className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </section>

      {/* AUTHOR BIO */}
      {author && (
        <section
          aria-label="Author bio"
          className="py-12"
          style={{ backgroundColor: "var(--bg-deep)" }}
        >
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div
              className="flex flex-col items-start gap-4 rounded-xl border p-6 sm:flex-row sm:items-center"
              style={{
                borderColor: "var(--border-subtle)",
                backgroundColor: "var(--surface-1)",
              }}
            >
              <div
                className="flex size-14 shrink-0 items-center justify-center rounded-full border font-display text-lg font-semibold"
                style={{
                  borderColor: "var(--border-strong)",
                  backgroundColor: "color-mix(in srgb, var(--accent) 14%, var(--surface-2))",
                  color: "var(--accent-bright)",
                }}
                aria-hidden
              >
                {author.name.split(" ").slice(0, 2).map((n) => n.charAt(0).toUpperCase()).join("")}
              </div>
              <div className="flex-1">
                <div className="eyebrow">Author</div>
                <h2 className="mt-1 font-display text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {author.name}
                </h2>
                <p className="text-xs" style={{ color: "var(--accent-bright)" }}>
                  {author.role}
                </p>
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {author.bio}
                </p>
              </div>
              {authorArticles.length > 0 && (
                <div className="w-full sm:w-40">
                  <div className="eyebrow">More by author</div>
                  <ul className="mt-2 space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {authorArticles.map((a) => (
                      <li key={a.slug}>
                        <Link to={`/insights/${a.slug}`} className="transition-colors hover:text-[var(--accent-bright)]">
                          {a.title.slice(0, 40)}
                          {a.title.length > 40 ? "…" : ""}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* RELATED CONTENT */}
      {related.length > 0 && (
        <section
          aria-label="Related content"
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
                  Keep reading.
                </h2>
              </div>
              <Link
                to="/insights"
                className="group inline-flex items-center gap-2 text-sm font-medium"
                style={{ color: "var(--accent-bright)" }}
              >
                All insights
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {related.map((rel, i) => {
                const relAuthor = authors.find((a) => a.id === rel.authorId);
                return (
                  <motion.article
                    key={rel.slug}
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="group flex flex-col overflow-hidden rounded-xl border transition-all hover:-translate-y-0.5"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-1)",
                    }}
                  >
                    <Link to={`/insights/${rel.slug}`} className="block">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        {rel.coverImage && (
                          <img
                            src={rel.coverImage}
                            alt={`${rel.title} — cover`}
                            width={1200}
                            height={700}
                            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                          <span style={{ color: "var(--accent-bright)" }}>
                            {categories.find((c) => c.slug === rel.categorySlug)?.name || rel.categorySlug}
                          </span>
                          <span>·</span>
                          <span>{rel.readingMinutes} min</span>
                        </div>
                        <h3 className="mt-2 font-display text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
                          {rel.title}
                        </h3>
                        {relAuthor && (
                          <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                            {relAuthor.name}
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      )}

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
