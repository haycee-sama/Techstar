"use client";

import { motion, useReducedMotion } from "framer-motion";

interface TimelineItemData {
  label: string;
  description: string;
}

interface TimelineSectionData {
  heading?: string;
  items?: TimelineItemData[];
}

/**
 * Vertical timeline. Reads `items` from section data. Generic —
 * not tied to the home page's "Discover/Design/Deploy/Support" copy.
 */
export function TimelineSection({ data }: { data: TimelineSectionData }) {
  const reduce = useReducedMotion();
  const items = data.items && data.items.length > 0 ? data.items : [
    { label: "Step 1", description: "Describe the first step." },
    { label: "Step 2", description: "Describe the second step." },
    { label: "Step 3", description: "Describe the third step." },
  ];

  return (
    <section className="relative py-16 sm:py-20" style={{ backgroundColor: "var(--bg-deep)" }}>
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {data.heading ? (
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center font-display font-semibold tracking-tight"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              color: "var(--text-primary)",
            }}
          >
            {data.heading}
          </motion.h2>
        ) : null}

        <ol className="relative mx-auto max-w-3xl">
          <div
            className="absolute left-4 top-2 bottom-2 w-px"
            style={{ backgroundColor: "var(--border-subtle)" }}
            aria-hidden
          />
          {items.map((item, i) => (
            <motion.li
              key={i}
              initial={reduce ? false : { opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="relative mb-8 pl-12 last:mb-0"
            >
              <span
                className="absolute left-4 top-1 size-2.5 -translate-x-1/2 rounded-full"
                style={{ backgroundColor: "var(--accent-bright)" }}
                aria-hidden
              />
              <div className="flex flex-col gap-1">
                <span
                  className="font-display text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "var(--accent-bright)" }}
                >
                  {item.label}
                </span>
                <span
                  className="text-pretty text-sm"
                  style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}
                >
                  {item.description}
                </span>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
