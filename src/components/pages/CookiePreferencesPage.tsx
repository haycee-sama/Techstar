"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Cookie } from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CookiePreferencesPanel } from "@/components/site/CookiePreferencesPanel";
import { CtaBandSection } from "@/components/sections/CtaBandSection";

export function CookiePreferencesPage() {
  const reduce = useReducedMotion();

  return (
    <>
      <section
        aria-label="Cookie preferences"
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
              { name: "Cookie Preferences", path: "/cookie-preferences" },
            ]}
          />
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <div className="eyebrow">Legal · Cookies</div>
            <h1
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(2.25rem, 4vw, 3.25rem)",
                lineHeight: 1.05,
                color: "var(--text-primary)",
              }}
            >
              Cookie preferences
            </h1>
            <p
              className="mt-5 max-w-2xl text-pretty"
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              We use cookies and local storage for essential functionality
              (theme, layout, cookie preferences) and, only if you opt in,
              for analytics and marketing. Essential cookies cannot be
              disabled — the site will not work without them.
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
                Demo notice.
              </span>{" "}
              This is a proposal-stage demo site. No real tracking is in place.
              Preferences are stored locally in your browser only.
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Manage cookie preferences"
        className="py-16 sm:py-20"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg border"
              style={{
                borderColor: "var(--accent)",
                backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
              }}
            >
              <Cookie className="size-5" style={{ color: "var(--accent-bright)" }} aria-hidden />
            </div>
            <h2
              className="font-display text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Manage your preferences
            </h2>
          </div>
          <p
            className="mt-4 max-w-2xl text-pretty"
            style={{
              fontSize: "0.9375rem",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
            }}
          >
            Use the controls below to set or update your preferences. Changes
            take effect immediately and are persisted to your browser&apos;s
            local storage. You can return to this page any time.
          </p>
          <div className="mt-8">
            <CookiePreferencesPanel variant="page" />
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
