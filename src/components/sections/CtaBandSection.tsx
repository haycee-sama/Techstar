"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";

export function CtaBandSection() {
  const reduce = useReducedMotion();
  return (
    <section
      aria-label="Engagement"
      className="relative overflow-hidden border-y"
      style={{
        backgroundColor: "var(--bg-deep)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Background grid + gradient */}
      <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 30%, color-mix(in srgb, var(--accent) 26%, transparent) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, color-mix(in srgb, var(--accent-cyan) 18%, transparent) 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 coordinate-marks" aria-hidden />

      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="eyebrow">Let&apos;s design your security posture</div>
          <h2
            className="mt-4 font-display font-semibold tracking-tight text-balance"
            style={{
              fontSize: "clamp(2rem, 5vw, 4rem)",
              lineHeight: 1.04,
              color: "var(--text-primary)",
            }}
          >
            One conversation. One accountable partner.
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-pretty"
            style={{ fontSize: "1.0625rem", lineHeight: 1.7, color: "var(--text-secondary)" }}
          >
            Tell us about your facility and the outcomes you actually need. We
            will propose a path forward — no automated funnel, no commitment,
            no theatre. Just the design.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="group"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              <Link to="/contact" className="inline-flex items-center gap-2">
                Request a consultation
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border"
              style={{
                borderColor: "var(--border-strong)",
                color: "var(--text-primary)",
                backgroundColor: "transparent",
              }}
            >
              <Link to="/services" className="inline-flex items-center gap-2">
                <MessagesSquare className="size-4" aria-hidden />
                Explore solutions
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
            Demo site — sample inquiries are stored locally and never leave your browser.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
