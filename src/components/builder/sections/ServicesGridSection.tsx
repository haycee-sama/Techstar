"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/router";
import { useContent } from "@/lib/content-store";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Compact services grid — reuses services from the content store but
 * lays them out in a tighter grid than the editorial section.
 */
export function ServicesGridSection() {
  const { services } = useContent();
  const reduce = useReducedMotion();

  if (services.length === 0) return null;

  return (
    <section className="relative py-16 sm:py-20" style={{ backgroundColor: "var(--bg-deep)" }}>
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-3">
          <div className="eyebrow">What we do</div>
          <h2
            className="font-display font-semibold tracking-tight text-balance"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              lineHeight: 1.05,
              color: "var(--text-primary)",
            }}
          >
            Service domains
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => {
            const Icon = (s.icon ? (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[s.icon] : null) ?? Icons.Wrench;
            return (
              <motion.div
                key={s.slug}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-lg border p-5"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-1)",
                }}
              >
                <div
                  className="flex size-9 items-center justify-center rounded-md"
                  style={{ backgroundColor: "var(--surface-2)", color: "var(--accent-bright)" }}
                  aria-hidden
                >
                  <Icon className="size-4" />
                </div>
                <h3
                  className="mt-4 font-display text-base font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {s.title}
                </h3>
                <p
                  className="mt-1.5 line-clamp-2 text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {s.tagline}
                </p>
                <Link
                  to={`/services/${s.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "var(--accent-bright)" }}
                >
                  Explore {s.title}
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/services" className="inline-flex items-center gap-2">
              Explore all services
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
