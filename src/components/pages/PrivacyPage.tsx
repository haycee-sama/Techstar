"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { StickySectionNav } from "@/components/sections/StickySectionNav";
import { CtaBandSection } from "@/components/sections/CtaBandSection";

interface LegalSection {
  id: string;
  heading: string;
  body: string[]; // paragraphs
}

const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "collect",
    heading: "Information we collect",
    body: [
      "We collect information you provide directly — when you submit an inquiry form, sign up for the newsletter, or contact us. This may include your name, email, phone, company, location, and the details you provide about your project.",
      "We also receive limited technical information automatically when you visit the site — IP address, browser type, pages visited, and referring URLs. This is used for site security, abuse prevention, and aggregated analytics only.",
      "All sample contact information shown on this site (email addresses, phone numbers, addresses) is illustrative. No real personal data is processed on this demo site.",
    ],
  },
  {
    id: "use",
    heading: "How we use your information",
    body: [
      "We use information you provide to respond to your inquiry, propose a path forward, and — if we work together — to deliver the engagement you signed up for. We do not sell your information to third parties.",
      "We may use technical information to monitor for abuse, secure the site, and aggregate usage trends. Aggregated trends are not associated with your identity.",
      "Marketing communications (if you opt in) are illustrative on this demo site — no real campaigns are sent.",
    ],
  },
  {
    id: "cookies",
    heading: "Cookies",
    body: [
      "This site uses cookies and similar local storage entries for essential functionality (theme, layout, cookie preferences) and optionally for analytics and marketing (off by default).",
      "You can manage your cookie preferences at any time using the Cookie Preferences link in the footer, or by clearing your browser's local storage for this site.",
      "Essential cookies are required for the site to function and cannot be disabled.",
    ],
  },
  {
    id: "third-parties",
    heading: "Third parties",
    body: [
      "We do not share your personal information with third parties for marketing purposes. We may use service providers (hosting, analytics — when enabled) who process limited data on our behalf under appropriate data-protection terms.",
      "On this demo site, no real third-party integrations are configured. All forms persist data to your browser's local storage only.",
    ],
  },
  {
    id: "retention",
    heading: "Data retention",
    body: [
      "Inquiry submissions are retained for as long as needed to respond to your inquiry and (if you become a client) to deliver the engagement. On this demo site, inquiries persist in your browser's local storage until you clear it.",
      "Server logs (if any) are retained for a limited period for security and abuse prevention.",
    ],
  },
  {
    id: "rights",
    heading: "Your rights",
    body: [
      "Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict the processing of your personal information. To exercise any of these rights, contact us using the details in the footer.",
      "On this demo site, you can review and clear all stored data via your browser's local storage controls, or by clicking the 'Reset to seed' option (planned for the admin area in Phase 3).",
    ],
  },
  {
    id: "security",
    heading: "Security",
    body: [
      "We take reasonable technical and organizational measures to protect information we hold — including access controls, encryption in transit, and audit logging where appropriate.",
      "No method of transmission over the internet is fully secure. We cannot guarantee absolute security, but we can guarantee that we take the responsibility seriously.",
    ],
  },
  {
    id: "updates",
    heading: "Updates to this notice",
    body: [
      "We may update this notice from time to time. Material changes will be reflected by an updated 'last reviewed' date at the bottom of this page.",
      "Continued use of the site after a change indicates acceptance of the updated notice.",
    ],
  },
];

const SECTION_IDS = PRIVACY_SECTIONS.map((s) => ({ id: s.id, label: s.heading }));

export function PrivacyPage() {
  const reduce = useReducedMotion();

  return (
    <>
      <section
        aria-label="Privacy notice"
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
              { name: "Privacy", path: "/privacy" },
            ]}
          />
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <div className="eyebrow">Legal · Privacy</div>
            <h1
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(2.25rem, 4vw, 3.25rem)",
                lineHeight: 1.05,
                color: "var(--text-primary)",
              }}
            >
              Privacy notice
            </h1>
            <p
              className="mt-4 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Last reviewed: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}
            </p>
          </motion.div>

          {/* Sample content banner */}
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

      {/* Sticky section nav */}
      <div
        className="sticky top-[64px] z-30 border-y"
        style={{
          backgroundColor: "color-mix(in srgb, var(--bg-deep) 88%, transparent)",
          backdropFilter: "blur(10px)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <StickySectionNav
            sections={SECTION_IDS}
            className="border-0 bg-transparent p-0"
            scrollOffset={120}
          />
        </div>
      </div>

      <section
        aria-label="Privacy sections"
        className="py-16 sm:py-20"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {PRIVACY_SECTIONS.map((s, i) => (
              <motion.div
                key={s.heading}
                id={s.id}
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

      {/* Editable note */}
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
              <Link to="/cookie-preferences">Manage cookies</Link>
            </Button>
          </div>
        </div>
      </section>

      <CtaBandSection />
    </>
  );
}
