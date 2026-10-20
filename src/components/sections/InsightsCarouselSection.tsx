"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { Link } from "@/lib/router";
import { useContent } from "@/lib/content-store";
import { formatDate } from "@/lib/utils";

export function InsightsCarouselSection() {
  const { articles, authors } = useContent();
  const reduce = useReducedMotion();

  const published = articles.filter((a) => a.status === "published");
  const recent = [...published]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 4);

  if (recent.length === 0) return null;

  return (
    <section
      aria-label="Insights"
      className="relative py-20 sm:py-24"
      style={{ backgroundColor: "var(--bg-navy)" }}
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <div className="eyebrow">From the editorial practice</div>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.08,
                color: "var(--text-primary)",
              }}
            >
              Field notes from engineering and operations.
            </h2>
          </div>
          <Link
            to="/insights"
            className="group inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--accent-bright)" }}
          >
            View all insights
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {recent.map((article, i) => {
            const author = authors.find((a) => a.id === article.authorId);
            return (
              <motion.article
                key={article.slug}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  to={`/insights/${article.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border transition-colors hover:border-[var(--accent)]"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                  }}
                >
                  <div
                    className="relative aspect-[16/10] overflow-hidden"
                    style={{ backgroundColor: "var(--surface-2)" }}
                  >
                    <div className="absolute inset-0 grid-bg-fine opacity-30" aria-hidden />
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg-navy) 80%, transparent) 100%)",
                      }}
                      aria-hidden
                    />
                    <span
                      className="absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest backdrop-blur-md"
                      style={{
                        borderColor: "var(--border-subtle)",
                        backgroundColor: "color-mix(in srgb, var(--bg-deep) 50%, transparent)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {article.categorySlug.split("-")[0]}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                      <span>{formatDate(article.publishedAt, "short")}</span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" aria-hidden />
                        {article.readingMinutes} min
                      </span>
                    </div>
                    <h3
                      className="mt-3 font-display text-base font-semibold leading-snug"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {article.title}
                    </h3>
                    <p
                      className="mt-2 line-clamp-2 text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {article.excerpt}
                    </p>
                    <div className="mt-auto pt-4">
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {author?.name}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
