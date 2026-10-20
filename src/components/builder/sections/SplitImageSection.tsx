"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";

interface SplitImageSectionData {
  eyebrow?: string;
  heading?: string;
  body?: string;
  image?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 * Two-column split: image on one side, editorial copy on the other.
 * `variant` controls which side the image is on.
 */
export function SplitImageSection({
  data,
  variant = "left-image",
}: {
  data: SplitImageSectionData;
  variant?: string;
}) {
  const reduce = useReducedMotion();
  const imageLeft = variant !== "right-image";
  const image = data.image || "https://placehold.co/1200x900/0A0F1F/3B82F6?text=Techstar";

  return (
    <section className="relative py-16 sm:py-20 lg:py-24" style={{ backgroundColor: "var(--bg-deep)" }}>
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={imageLeft ? "lg:order-1" : "lg:order-2"}
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border" style={{ borderColor: "var(--border-subtle)" }}>
            <img
              src={image}
              alt={data.imageAlt || data.heading || "Techstar"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className={imageLeft ? "lg:order-2 flex flex-col justify-center" : "lg:order-1 flex flex-col justify-center"}
        >
          {data.eyebrow ? <div className="eyebrow">{data.eyebrow}</div> : null}
          {data.heading ? (
            <h2
              className="mt-3 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.05,
                color: "var(--text-primary)",
              }}
            >
              {data.heading}
            </h2>
          ) : null}
          {data.body ? (
            <p
              className="mt-5 max-w-xl text-pretty"
              style={{ fontSize: "1.0625rem", lineHeight: 1.65, color: "var(--text-secondary)" }}
            >
              {data.body}
            </p>
          ) : null}
          {data.ctaLabel ? (
            <div className="mt-7">
              <Button asChild size="lg" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                <Link to={data.ctaHref || "#/contact"} className="inline-flex items-center gap-2">
                  {data.ctaLabel}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
