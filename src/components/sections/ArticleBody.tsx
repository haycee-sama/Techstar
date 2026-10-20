"use client";

import { sanitizeHtml } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";

interface ArticleBodyProps {
  html: string;
  className?: string;
}

/**
 * Renders sanitized article body HTML in prose-like styling.
 * Max-width 70ch, headings hierarchy, lists, blockquotes styled.
 */
export function ArticleBody({ html, className = "" }: ArticleBodyProps) {
  const reduce = useReducedMotion();
  const clean = sanitizeHtml(html);

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.5 }}
      className={`mx-auto max-w-[70ch] space-y-6 leading-relaxed [&_a]:font-medium [&_a]:underline [&_a]:decoration-[color:var(--border-strong)] [&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:decoration-[var(--accent-bright)] [&_a:hover]:text-[var(--accent-bright)] [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--accent)] [&_blockquote]:pl-5 [&_blockquote]:text-pretty [&_blockquote]:italic [&_blockquote]:text-[var(--text-secondary)] [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:text-[var(--text-primary)] [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:mt-8 [&_h3]:text-[var(--text-primary)] [&_li]:list-disc [&_li]:pl-2 [&_li]:marker:text-[var(--accent)] [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_p]:text-pretty [&_p]:text-[1.0625rem] [&_p]:leading-[1.75] [&_p]:text-[var(--text-secondary)] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
