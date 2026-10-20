"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Compass, Home, MessagesSquare, Search, ArrowRight } from "lucide-react";
import { Link, useRoute } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NotFoundPage() {
  const reduce = useReducedMotion();
  const { path } = useRoute();
  const [query, setQuery] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The 404 search input doubles as a shortcut to the full command palette,
    // which has live filtering across services, projects, articles, and FAQs.
    window.dispatchEvent(new Event("techstar:open-command"));
  };

  return (
    <section
      aria-label="Page not found"
      className="relative isolate flex min-h-[80vh] items-center overflow-hidden"
      style={{ backgroundColor: "var(--bg-deep)" }}
    >
      <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 60%), radial-gradient(ellipse at 15% 80%, color-mix(in srgb, var(--accent-cyan) 14%, transparent) 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 coordinate-marks" aria-hidden />

      <div className="mx-auto w-full max-w-2xl px-4 py-20 text-center sm:px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Big editorial 404 */}
          <div
            className="font-display font-semibold tracking-tighter"
            style={{
              fontSize: "clamp(7rem, 22vw, 14rem)",
              lineHeight: 0.9,
              color: "transparent",
              WebkitTextStroke: "1.5px var(--border-strong)",
            }}
            aria-hidden
          >
            404
          </div>
          <div className="eyebrow mt-4">Page not found</div>
          <h1
            className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            We couldn&apos;t find that page.
          </h1>
          <p
            className="mx-auto mt-4 max-w-md text-pretty"
            style={{
              fontSize: "1.0625rem",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
            }}
          >
            The link may have moved, expired, or never existed. Try one of the
            paths below, or search for what you were looking for.
          </p>
          <p
            className="mt-3 text-xs font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            Path attempted:{" "}
            <code style={{ color: "var(--text-secondary)" }}>{path}</code>
          </p>

          {/* Search */}
          <form
            onSubmit={onSearch}
            className="mx-auto mt-8 flex max-w-md items-center gap-2"
            role="search"
          >
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
                aria-hidden
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the site…"
                aria-label="Search the site"
                className="pl-9"
              />
            </div>
            <Button
              type="submit"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              Search
            </Button>
          </form>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            Tip: press{" "}
            <kbd className="rounded border px-1.5 py-0.5 font-mono text-[10px]" style={{ borderColor: "var(--border-strong)" }}>⌘K</kbd>{" "}
            /{" "}
            <kbd className="rounded border px-1.5 py-0.5 font-mono text-[10px]" style={{ borderColor: "var(--border-strong)" }}>Ctrl+K</kbd>{" "}
            anywhere to open the full command palette.
          </p>

          {/* Suggestions */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { to: "/", label: "Home", icon: Home },
              { to: "/services", label: "Services", icon: Compass },
              { to: "/insights", label: "Insights", icon: Search },
              { to: "/contact", label: "Contact", icon: MessagesSquare },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Button
                  key={s.to}
                  asChild
                  variant="outline"
                  className="h-auto flex-col gap-1.5 py-3"
                  style={{ borderColor: "var(--border-strong)" }}
                >
                  <Link to={s.to} className="inline-flex flex-col items-center gap-1.5">
                    <Icon className="size-4" aria-hidden />
                    <span className="text-xs">{s.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>

          <div className="mt-8">
            <Button
              asChild
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              <Link to="/" className="inline-flex items-center gap-2">
                <ArrowRight className="size-4 rotate-180" aria-hidden />
                Back to home
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
