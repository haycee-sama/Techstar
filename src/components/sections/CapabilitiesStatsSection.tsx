"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCountUp } from "@/hooks/use-count-up";

interface StatSpec {
  prefix?: string;
  value: number;
  suffix?: string;
  label: string;
  illustrative?: boolean;
  decimals?: number;
}

const STATS: StatSpec[] = [
  { value: 24, suffix: "/7", label: "Monitoring operations", decimals: 0 },
  { value: 8, label: "Core service domains", decimals: 0 },
  { value: 1200, suffix: "+", label: "Devices integrated", illustrative: true, decimals: 0 },
  {
    value: 99.9,
    suffix: "%",
    label: "Target system uptime",
    illustrative: true,
    decimals: 1,
  },
];

export function CapabilitiesStatsSection() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="Capabilities"
      className="relative py-20 sm:py-24"
      style={{ backgroundColor: "var(--bg-deep)" }}
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="eyebrow">By the numbers</div>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.08,
                color: "var(--text-primary)",
              }}
            >
              Operations that hold up on the worst day.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p
              className="text-pretty"
              style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--text-secondary)" }}
            >
              Real numbers from a real discipline — and where a figure is
              illustrative, we say so. We will not sell you a dashboard built
              on rounded-up marketing math.
            </p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl border sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: "var(--border-subtle)" }}>
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} reduce={reduce} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, index, reduce }: { stat: StatSpec; index: number; reduce: boolean | null }) {
  const { ref, value } = useCountUp(stat.value, {
    duration: 1400,
    decimals: stat.decimals ?? 0,
  });

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative flex flex-col p-6"
      style={{
        backgroundColor: index % 2 === 0 ? "var(--surface-1)" : "var(--bg-navy)",
      }}
    >
      <div
        className="font-display font-semibold tracking-tight tabular-nums"
        style={{
          fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
          lineHeight: 1,
          color: "var(--text-primary)",
        }}
      >
        <span ref={ref}>
          {stat.prefix}
          {value.toLocaleString("en-US", {
            minimumFractionDigits: stat.decimals ?? 0,
            maximumFractionDigits: stat.decimals ?? 0,
          })}
        </span>
        <span style={{ color: "var(--accent-bright)" }}>{stat.suffix}</span>
      </div>
      <div className="mt-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        {stat.label}
      </div>
      {stat.illustrative && (
        <span
          className="mt-3 inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest"
          style={{
            backgroundColor: "color-mix(in srgb, var(--warning) 18%, transparent)",
            color: "var(--warning)",
          }}
        >
          Illustrative
        </span>
      )}
    </motion.div>
  );
}
