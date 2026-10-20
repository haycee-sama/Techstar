"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { NetworkGlobe } from "@/components/site/NetworkGlobe";

export function NetworkGlobePage() {
  const reduce = useReducedMotion();
  return (
    <section
      aria-label="Interactive network globe"
      className="relative isolate overflow-hidden"
      style={{ backgroundColor: "var(--bg-deep)" }}
    >
      <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--accent) 16%, transparent) 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 coordinate-marks" aria-hidden />

      <div className="mx-auto max-w-[1320px] px-4 py-20 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Network", path: "/network" },
          ]}
        />

        <div className="mt-8 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="eyebrow">Live operations view</div>
              <h1
                className="mt-4 font-display font-semibold tracking-tight text-balance"
                style={{
                  fontSize: "clamp(2.25rem, 4vw, 3.5rem)",
                  lineHeight: 1.05,
                  color: "var(--text-primary)",
                }}
              >
                One program. Many sites. Accountable everywhere.
              </h1>
              <p
                className="mt-5 text-pretty"
                style={{
                  fontSize: "1.0625rem",
                  lineHeight: 1.7,
                  color: "var(--text-secondary)",
                }}
              >
                A stylized view of Techstar&apos;s distributed operations —
                facilities across regions, all routed through a single
                accountable program with named owners, documented evidence
                packs, and recurring business reviews.
              </p>
              <p
                className="mt-3 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Illustrative visualization — sample content for proposal
                purposes. Built with SVG + CSS only (no WebGL/3D dependency).
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                >
                  <Link to="/contact">Bring your program to Techstar</Link>
                </Button>
                <Button asChild variant="outline" style={{ borderColor: "var(--border-strong)" }}>
                  <Link to="/services">Explore our solutions</Link>
                </Button>
              </div>
            </motion.div>
          </div>
          <div className="lg:col-span-7">
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center"
            >
              <NetworkGlobe width={520} height={520} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NetworkGlobePage;
