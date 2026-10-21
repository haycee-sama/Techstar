"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/lib/router";
import { useContent } from "@/lib/content-store";

const FLAGSHIP = [
  "cctv-video-surveillance",
  "network-infrastructure-cabling",
  "cybersecurity",
  "smart-buildings-automation",
];

export function ServicesOverviewSection() {
  const { services } = useContent();
  const reduce = useReducedMotion();

  if (services.length === 0) return null;

  const flagship = FLAGSHIP.map((slug) => services.find((s) => s.slug === slug)).filter(
    Boolean
  ) as typeof services;
  const remaining = services.filter((s) => !FLAGSHIP.includes(s.slug));

  return (
    <section
      aria-label="What we do"
      className="relative py-20 sm:py-24 lg:py-28"
      style={{ backgroundColor: "var(--bg-deep)" }}
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {/* Editorial intro */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <Eyebrow>What we do</Eyebrow>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(2rem, 4.4vw, 3.5rem)",
                lineHeight: 1.05,
                color: "var(--text-primary)",
              }}
            >
              Eight domains. One program.
            </h2>
            <p
              className="mt-5 max-w-xl text-pretty"
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              Most security vendors sell you parts. We design, deploy, and
              operate eight domains as one coherent program — with shared
              identity, shared network, shared documentation, and a single
              owner you can hold accountable.
            </p>
          </div>
          <div className="lg:col-span-5 lg:pt-3">
            <ul className="flex flex-col gap-1.5">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    to={`/services/${s.slug}`}
                    className="group flex items-center justify-between border-b py-2 transition-colors hover:text-[var(--accent-bright)]"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {s.title}
                    </span>
                    <ArrowRight
                      className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                      style={{ color: "var(--accent-bright)" }}
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Flagship alternating split rows */}
        <div className="mt-20 flex flex-col gap-20 lg:gap-28">
          {flagship.map((service, idx) => {
            const reversed = idx % 2 === 1;
            return (
              <SplitRow
                key={service.slug}
                service={service}
                reversed={reversed}
                index={idx}
                reduce={reduce}
              />
            );
          })}
        </div>

        {/* Remaining tiles */}
        {remaining.length > 0 && (
          <div className="mt-20">
            <Eyebrow>And four more domains</Eyebrow>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {remaining.map((service, i) => (
                <motion.div
                  key={service.slug}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-15% 0px" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Link
                    to={`/services/${service.slug}`}
                    className="group flex h-full flex-col justify-between rounded-xl border p-5 transition-colors hover:border-[var(--accent)]"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-1)",
                    }}
                  >
                    <div>
                      <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                        0{i + 1}
                      </div>
                      <h3
                        className="mt-3 font-display text-base font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {service.title}
                      </h3>
                      <p
                        className="mt-2 text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {service.tagline}
                      </p>
                    </div>
                    <div
                      className="mt-4 inline-flex items-center gap-1 text-xs font-medium"
                      style={{ color: "var(--accent-bright)" }}
                    >
                      Explore {service.title}
                      <ArrowRight
                        className="size-3 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

interface SplitRowProps {
  service: ReturnType<typeof useContent>["services"][number];
  reversed: boolean;
  index: number;
  reduce: boolean | null;
}

function SplitRow({ service, reversed, index, reduce }: SplitRowProps) {
  const capabilities = service.capabilities.slice(0, 3);

  return (
    <article className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14">
      <motion.div
        initial={reduce ? false : { opacity: 0, x: reversed ? 24 : -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`lg:col-span-6 ${reversed ? "lg:order-2" : "lg:order-1"}`}
      >
        <div
          className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border clip-corner"
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--surface-1)",
          }}
        >
          <div className="absolute inset-0 grid-bg-fine opacity-30" aria-hidden />
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div
              className="font-display text-2xl font-semibold tracking-tight"
              style={{ color: "var(--text-muted)" }}
            >
              {String(index + 1).padStart(2, "0")} / 04
            </div>
          </div>
          <img
            src={service.heroMedia}
            alt={service.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg-deep) 65%, transparent) 100%)",
            }}
            aria-hidden
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
            <span>{service.tagline}</span>
            <span>DOMAIN_{service.slug.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, x: reversed ? -24 : 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`lg:col-span-6 ${reversed ? "lg:order-1" : "lg:order-2"}`}
      >
        <div className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--accent-bright)" }}>
          Domain {String(index + 1).padStart(2, "0")}
        </div>
        <h3
          className="mt-3 font-display font-semibold tracking-tight"
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            lineHeight: 1.1,
            color: "var(--text-primary)",
          }}
        >
          {service.title}
        </h3>
        <p
          className="mt-4 max-w-lg text-pretty"
          style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--text-secondary)" }}
        >
          {service.overview.split("\n\n")[0]}
        </p>
        <ul className="mt-6 space-y-2">
          {capabilities.map((cap) => (
            <li key={cap} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              <Check className="size-4 mt-0.5 shrink-0" style={{ color: "var(--accent-bright)" }} aria-hidden />
              <span>{cap}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Link
            to={`/services/${service.slug}`}
            className="group inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--accent-bright)" }}
          >
            Explore {service.title}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </motion.div>
    </article>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}
