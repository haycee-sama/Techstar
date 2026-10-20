"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/lib/router";

interface RingSpec {
  label: string;
  slug: string;
  description: string;
  size: number; // px
}

const RINGS: RingSpec[] = [
  { label: "Perimeter", slug: "intrusion-perimeter-security", description: "Detect early. Decide faster.", size: 460 },
  { label: "Building", slug: "access-control-biometrics", description: "Identity at every door.", size: 360 },
  { label: "Floor", slug: "fire-alarm-life-safety", description: "When seconds matter.", size: 260 },
  { label: "Asset", slug: "cctv-video-surveillance", description: "See everything. Miss nothing.", size: 170 },
  { label: "Data", slug: "cybersecurity", description: "Physical and digital, one perimeter.", size: 100 },
];

export function InfrastructureDiagramSection() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  return (
    <section
      aria-label="From the perimeter to the network"
      className="relative overflow-hidden py-24 sm:py-28"
      style={{
        backgroundColor: "var(--bg-navy)",
        backgroundImage:
          "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent) 8%, transparent) 0%, transparent 60%)",
      }}
    >
      <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />

      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="eyebrow">The model</div>
          <h2
            className="mt-4 font-display font-semibold tracking-tight text-balance"
            style={{
              fontSize: "clamp(2rem, 4.4vw, 3.25rem)",
              lineHeight: 1.08,
              color: "var(--text-primary)",
            }}
          >
            From the perimeter to the network.
          </h2>
          <p
            className="mt-5 text-pretty"
            style={{ fontSize: "1.0625rem", lineHeight: 1.7, color: "var(--text-secondary)" }}
          >
            Every Techstar program is sized to the time you actually need.
            Detection at the perimeter buys decision time. Identity at the
            building controls access. Life safety on the floor protects
            occupants. Cameras on the asset record what matters. And the
            network beneath it all keeps data where it belongs.
          </p>
        </div>

        {/* Diagram */}
        <div className="mt-16 flex justify-center">
          {/* Desktop concentric */}
          <div
            className="relative hidden md:flex items-center justify-center"
            style={{ width: 520, height: 520 }}
          >
            {/* Connecting axes */}
            <div
              className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2"
              style={{ background: "var(--border-subtle)" }}
              aria-hidden
            />
            <div
              className="absolute left-1/2 top-1/2 h-full w-px -translate-x-1/2 -translate-y-1/2"
              style={{ background: "var(--border-subtle)" }}
              aria-hidden
            />
            {/* Crosshair center marks */}
            <span className="absolute left-2 top-2 size-3 border-l border-t" style={{ borderColor: "var(--accent-bright)" }} aria-hidden />
            <span className="absolute right-2 top-2 size-3 border-r border-t" style={{ borderColor: "var(--accent-bright)" }} aria-hidden />
            <span className="absolute left-2 bottom-2 size-3 border-l border-b" style={{ borderColor: "var(--accent-bright)" }} aria-hidden />
            <span className="absolute right-2 bottom-2 size-3 border-r border-b" style={{ borderColor: "var(--accent-bright)" }} aria-hidden />

            {RINGS.map((ring, idx) => {
              const isActive = active === idx;
              return (
                <motion.button
                  key={ring.label}
                  type="button"
                  onMouseEnter={() => setActive(idx)}
                  onFocus={() => setActive(idx)}
                  onMouseLeave={() => setActive((cur) => (cur === idx ? null : cur))}
                  onBlur={() => setActive((cur) => (cur === idx ? null : cur))}
                  initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="absolute rounded-full"
                  style={{
                    width: ring.size,
                    height: ring.size,
                    border: `1px solid ${isActive ? "var(--accent-bright)" : "var(--border-strong)"}`,
                    backgroundColor: isActive
                      ? "color-mix(in srgb, var(--accent) 8%, transparent)"
                      : "color-mix(in srgb, var(--surface-1) 30%, transparent)",
                    boxShadow: isActive ? "0 0 30px -4px var(--accent)" : "none",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  aria-label={`${ring.label} — view ${ring.label.toLowerCase()} service`}
                >
                  <span
                    className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono uppercase tracking-widest"
                    style={{
                      color: isActive ? "var(--accent-bright)" : "var(--text-muted)",
                    }}
                  >
                    {ring.label}
                  </span>
                </motion.button>
              );
            })}

            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  TECHSTAR
                </div>
                <div
                  className="mt-1 text-xs"
                  style={{ color: active !== null ? "var(--accent-bright)" : "var(--text-secondary)" }}
                >
                  {active !== null ? RINGS[active].label : "Hover a ring"}
                </div>
                {active !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 max-w-[160px] text-[10px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {RINGS[active].description}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Active ring CTA */}
            {active !== null && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <Link
                  to={`/services/${RINGS[active].slug}`}
                  className="inline-flex items-center gap-1 text-xs font-medium"
                  style={{ color: "var(--accent-bright)" }}
                >
                  View {RINGS[active].label} service
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile stacked list */}
          <ul className="flex w-full flex-col gap-2 md:hidden">
            {RINGS.map((ring, idx) => (
              <li key={ring.label}>
                <Link
                  to={`/services/${ring.slug}`}
                  className="flex items-center justify-between rounded-lg border p-4"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                  }}
                >
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--accent-bright)" }}>
                      Ring 0{idx + 1}
                    </div>
                    <div className="mt-1 font-display text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                      {ring.label}
                    </div>
                    <div className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      {ring.description}
                    </div>
                  </div>
                  <ArrowUpRight className="size-4" style={{ color: "var(--accent-bright)" }} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
