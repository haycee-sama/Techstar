"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AccordionItemData {
  title: string;
  body: string;
}

interface AccordionSectionData {
  heading?: string;
  items?: AccordionItemData[];
}

/**
 * Generic accordion (not FAQ-specific). Reads `items` from section data.
 */
export function AccordionSection({ data }: { data: AccordionSectionData }) {
  const reduce = useReducedMotion();
  const items = data.items && data.items.length > 0 ? data.items : [
    { title: "First item", body: "Body copy for the first accordion item." },
    { title: "Second item", body: "Body copy for the second accordion item." },
  ];

  return (
    <section className="relative py-16 sm:py-20" style={{ backgroundColor: "var(--bg-deep)" }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {data.heading ? (
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center font-display font-semibold tracking-tight"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              color: "var(--text-primary)",
            }}
          >
            {data.heading}
          </motion.h2>
        ) : null}
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-b"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <AccordionTrigger className="text-left text-base font-medium" style={{ color: "var(--text-primary)" }}>
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {item.body}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
