"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CtaBandSection } from "@/components/sections/CtaBandSection";

interface LegalSection {
  heading: string;
  body: string[];
}

const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "Acceptance of terms",
    body: [
      "By accessing this site you agree to these terms of use. If you do not agree, please discontinue use of the site.",
      "These terms apply to all visitors regardless of whether you have submitted an inquiry or entered into a commercial engagement with Techstar.",
    ],
  },
  {
    heading: "Our services",
    body: [
      "This website presents Techstar's services for informational and proposal-stage purposes. The content describes illustrative engagements; no actual service is delivered through this website.",
      "A formal engagement requires a separate signed agreement that supersedes any content presented on this site.",
    ],
  },
  {
    heading: "Acceptable use",
    body: [
      "You agree not to misuse the site — including attempts to disrupt availability, gain unauthorized access, or scrape content in violation of applicable law or this notice.",
      "Automated access for indexing by general-purpose search engines is permitted. Other automated access requires prior written permission.",
    ],
  },
  {
    heading: "Intellectual property",
    body: [
      "Site content — text, layout, design, code, and brand marks — is owned by Techstar or its licensors and is protected by applicable intellectual property laws.",
      "You may not reproduce, redistribute, or create derivative works from the site without prior written permission, except for brief quotation with attribution.",
    ],
  },
  {
    heading: "Warranties and disclaimers",
    body: [
      "The site is provided 'as is' without warranties of any kind, express or implied. We do not warrant that the site will be uninterrupted, error-free, or free of harmful components.",
      "Opinions expressed in the insights articles are the authors' own and do not constitute professional engineering advice for your specific facility. Engage a qualified engineer before acting on any technical content.",
    ],
  },
  {
    heading: "Limitation of liability",
    body: [
      "To the maximum extent permitted by law, Techstar shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the site.",
      "This limitation applies even if we have been advised of the possibility of such damages.",
    ],
  },
  {
    heading: "Termination",
    body: [
      "We may suspend or terminate your access to the site at any time, with or without notice, if we believe you have violated these terms or for any other reason.",
      "Upon termination, all provisions that by their nature should survive — including intellectual property, warranty disclaimers, and limitation of liability — remain in effect.",
    ],
  },
  {
    heading: "Updates to these terms",
    body: [
      "We may update these terms from time to time. Material changes will be reflected by an updated 'last reviewed' date at the bottom of this page.",
      "Continued use of the site after a change indicates acceptance of the updated terms.",
    ],
  },
];

export function TermsPage() {
  const reduce = useReducedMotion();

  return (
    <>
      <section
        aria-label="Terms of use"
        className="relative isolate overflow-hidden"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 coordinate-marks" aria-hidden />

        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Terms", path: "/terms" },
            ]}
          />
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <div className="eyebrow">Legal · Terms</div>
            <h1
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(2.25rem, 4vw, 3.25rem)",
                lineHeight: 1.05,
                color: "var(--text-primary)",
              }}
            >
              Terms of use
            </h1>
            <p
              className="mt-4 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Last reviewed: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}
            </p>
          </motion.div>

          <div
            className="mt-8 flex items-start gap-3 rounded-lg border p-4"
            style={{
              backgroundColor: "color-mix(in srgb, var(--warning) 10%, var(--surface-1))",
              borderColor: "color-mix(in srgb, var(--warning) 35%, transparent)",
            }}
            role="note"
          >
            <AlertCircle
              className="mt-0.5 size-5 shrink-0"
              style={{ color: "var(--warning)" }}
              aria-hidden
            />
            <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--warning)" }} className="font-semibold">
                Sample policy.
              </span>{" "}
              This is illustrative sample content for proposal purposes. Replace
              with legally reviewed content before launch.
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Terms sections"
        className="py-16 sm:py-20"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {TERMS_SECTIONS.map((s, i) => (
              <motion.div
                key={s.heading}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
              >
                <h2
                  className="font-display text-xl font-semibold tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {s.heading}
                </h2>
                <div className="mt-4 space-y-3">
                  {s.body.map((p, j) => (
                    <p
                      key={j}
                      className="text-pretty"
                      style={{
                        fontSize: "0.9375rem",
                        lineHeight: 1.75,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-label="Editable note"
        className="border-t py-8"
        style={{
          backgroundColor: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              This content is editable in{" "}
              <Link to="/admin/legal" className="underline transition-colors hover:text-[var(--accent-bright)]">
                Admin → Legal
              </Link>{" "}
              (planned for Phase 3).
            </p>
            <Button asChild variant="ghost" size="sm" style={{ color: "var(--text-muted)" }}>
              <Link to="/privacy">View privacy notice</Link>
            </Button>
          </div>
        </div>
      </section>

      <CtaBandSection />
    </>
  );
}
