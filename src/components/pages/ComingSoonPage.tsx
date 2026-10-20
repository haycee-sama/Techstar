"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, MessagesSquare } from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

interface ComingSoonPageProps {
  title: string;
  description: string;
  eyebrow?: string;
}

/**
 * Reserved but inert route page. Replaces the Phase 1 inline placeholder.
 * Use for routes like /careers that are reserved but not yet built.
 */
export function ComingSoonPage({ title, description, eyebrow = "Reserved route" }: ComingSoonPageProps) {
  const reduce = useReducedMotion();
  return (
    <section
      aria-label={`${title} — coming soon`}
      className="relative isolate flex min-h-[70vh] items-center overflow-hidden"
      style={{ backgroundColor: "var(--bg-deep)" }}
    >
      <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
      <div className="absolute inset-0 coordinate-marks" aria-hidden />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 30%, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="mb-6 flex justify-center">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: title, path: "/#" },
            ]}
            hideOnMobile
          />
        </div>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="eyebrow">{eyebrow}</div>
          <h1
            className="mt-4 font-display font-semibold tracking-tight text-balance"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.08,
              color: "var(--text-primary)",
            }}
          >
            {title}
          </h1>
          <p
            className="mx-auto mt-5 max-w-xl text-pretty"
            style={{
              fontSize: "1.0625rem",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
            }}
          >
            {description}
          </p>
          <p
            className="mt-3 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Demo site — sample content for proposal purposes. This route is
            reserved and inert today so no broken-link 404 fires when
            navigation reaches it.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              <Link to="/" className="inline-flex items-center gap-2">
                <ArrowLeft className="size-4" aria-hidden />
                Back to home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <Link to="/contact" className="inline-flex items-center gap-2">
                <MessagesSquare className="size-4" aria-hidden />
                Contact us
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
