"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, MessagesSquare } from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { useAnnouncement } from "@/lib/content-store";
import { useContent } from "@/lib/content-store";

const HEADLINE = ["Intelligent", "protection.", "Connected", "infrastructure."];

export function HeroSection() {
  const announcement = useAnnouncement();
  const { services } = useContent();
  const reduce = useReducedMotion();

  const headlineWords = HEADLINE.map((word, i) => ({ word, delay: 0.1 + i * 0.08 }));

  return (
    <section
      aria-label="Techstar hero"
      className="relative isolate overflow-hidden"
      style={{
        minHeight: "100svh",
        backgroundColor: "var(--bg-deep)",
      }}
    >
      {/* Background grid + radial */}
      <div className="absolute inset-0 -z-10 grid-bg opacity-70" aria-hidden />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 78% 30%, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 55%), radial-gradient(ellipse at 12% 80%, color-mix(in srgb, var(--accent-cyan) 14%, transparent) 0%, transparent 60%)",
        }}
        aria-hidden
      />

      {/* Corner coordinate marks */}
      <div className="absolute inset-0 coordinate-marks -z-10" aria-hidden />

      <div className="mx-auto grid min-h-[100svh] max-w-[1320px] grid-cols-1 items-center gap-10 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-8">
        {/* Left: Editorial copy */}
        <div className="lg:col-span-7">
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
              Integrated security · Infrastructure · Intelligence
            </span>
          </motion.div>

          <h1
            className="mt-6 font-display font-semibold tracking-tight text-balance"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              lineHeight: 1.02,
              color: "var(--text-primary)",
            }}
          >
            {headlineWords.map((item, i) => (
              <motion.span
                key={item.word + i}
                initial={reduce ? false : { opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: item.delay, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
                style={{ marginRight: "0.18em" }}
              >
                {item.word}{" "}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-6 max-w-xl text-pretty"
            style={{
              fontSize: "1.0625rem",
              lineHeight: 1.65,
              color: "var(--text-secondary)",
            }}
          >
            Techstar designs, deploys, and operates integrated security,
            networking, and life-safety systems — engineered as one program,
            documented to the drop, and operated against the worst day of your
            year.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="group"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              <Link to="/services" className="inline-flex items-center gap-2">
                Explore our solutions
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
              <Link to="/contact" className="inline-flex items-center gap-2">
                <MessagesSquare className="size-4" aria-hidden />
                Talk to an expert
              </Link>
            </Button>
          </motion.div>

          {/* Announcement chip */}
          {announcement && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-6"
            >
              <Link
                to={announcement.ctaHref || "/contact"}
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--accent-bright)]"
                style={{ color: "var(--text-muted)" }}
              >
                <span
                  className="inline-flex size-1.5 rounded-full"
                  style={{ backgroundColor: "var(--accent-bright)" }}
                  aria-hidden
                />
                {announcement.message}
              </Link>
            </motion.div>
          )}
        </div>

        {/* Right: Visual */}
        <div className="lg:col-span-5">
          <HeroVisual />
        </div>
      </div>

      {/* Scroll cue */}
      <motion.button
        type="button"
        aria-label="Scroll to next section"
        onClick={() => {
          const h = window.innerHeight;
          window.scrollTo({ top: h, behavior: "smooth" });
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 lg:block"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex flex-col items-center gap-1"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <ChevronDown className="size-4" aria-hidden />
        </motion.div>
      </motion.button>

      {/* Services list reveal footer */}
      <div
        className="absolute inset-x-0 bottom-0 hidden border-t lg:block"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "color-mix(in srgb, var(--bg-deep) 60%, transparent)",
          backdropFilter: "blur(8px)",
        }}
        aria-hidden
      >
        <div className="mx-auto flex max-w-[1320px] items-center gap-6 overflow-hidden px-8 py-3">
          <span className="eyebrow shrink-0">Service domains</span>
          <div className="flex flex-1 items-center gap-x-6 gap-y-1 overflow-hidden text-xs">
            {services.slice(0, 8).map((s) => (
              <span
                key={s.slug}
                className="whitespace-nowrap transition-colors hover:text-[var(--accent-bright)]"
                style={{ color: "var(--text-muted)" }}
              >
                {s.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border clip-corner"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
      aria-label="Control room illustration"
    >
      <div className="absolute inset-0 grid-bg-fine opacity-40" aria-hidden />
      {/* Layered simulated panels (CSS-only topology) */}
      <div className="absolute inset-0 flex flex-col p-5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          <span>SEC.OPS / LIVE</span>
          <span className="font-mono">N=24</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0.3 }}
              animate={reduce ? { opacity: 0.6 } : { opacity: [0.3, 0.85, 0.4] }}
              transition={
                reduce
                  ? undefined
                  : {
                      duration: 3.2,
                      repeat: Infinity,
                      delay: i * 0.18,
                      ease: "easeInOut",
                    }
              }
              className="aspect-video rounded-sm border"
              style={{
                backgroundColor: i % 3 === 0
                  ? "color-mix(in srgb, var(--accent) 10%, var(--surface-2))"
                  : "var(--surface-2)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <div className="flex h-full items-end p-1.5">
                <span className="font-mono text-[8px]" style={{ color: "var(--text-muted)" }}>
                  CAM-{String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-1.5">
          {[
            { label: "Perimeter · Fence N", value: "ARMED", color: "var(--success)" },
            { label: "Access · L1 Lobby", value: "OK", color: "var(--success)" },
            { label: "Network · Segmentation", value: "VERIFIED", color: "var(--accent-bright)" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded border px-2.5 py-1.5"
              style={{
                borderColor: "var(--border-subtle)",
                backgroundColor: "color-mix(in srgb, var(--surface-2) 70%, transparent)",
              }}
            >
              <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                {row.label}
              </span>
              <span className="font-mono text-[10px] font-medium" style={{ color: row.color }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2 text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
          <span className="inline-flex size-1.5 rounded-full animate-pulse-soft" style={{ backgroundColor: "var(--accent-cyan)" }} />
          MONITORING · 24/7
        </div>
      </div>
      {/* Soft accent glow */}
      <div
        className="pointer-events-none absolute -inset-6 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, color-mix(in srgb, var(--accent) 28%, transparent) 0%, transparent 65%)",
        }}
        aria-hidden
      />
    </motion.div>
  );
}
