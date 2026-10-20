"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Compass, DraftingCompass, Hammer, LifeBuoy } from "lucide-react";

interface Step {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const STEPS: Step[] = [
  {
    label: "Discover",
    description:
      "We map your facility, your risks, your operations, and your worst-day assumptions. No assumptions, no inherited spreadsheets.",
    icon: Compass,
  },
  {
    label: "Design",
    description:
      "Coverage, identity, network, and lifecycle specified as one system. Documentation arrives as part of the design — not as a clean-up after install.",
    icon: DraftingCompass,
  },
  {
    label: "Deploy",
    description:
      "Certified crews install to documented standards, with acceptance tests against a checklist you keep. Operators trained on real flows, not toy demos.",
    icon: Hammer,
  },
  {
    label: "Support",
    description:
      "Preventive maintenance, periodic re-tuning, and quarterly reviews that keep the program honest as your facility changes.",
    icon: LifeBuoy,
  },
];

export function ProcessTimelineSection() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="How we work"
      className="relative py-20 sm:py-24"
      style={{ backgroundColor: "var(--bg-deep)" }}
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="eyebrow">The method</div>
          <h2
            className="mt-4 font-display font-semibold tracking-tight text-balance"
            style={{
              fontSize: "clamp(1.875rem, 4vw, 3rem)",
              lineHeight: 1.08,
              color: "var(--text-primary)",
            }}
          >
            Discover. Design. Deploy. Support.
          </h2>
          <p
            className="mt-5 text-pretty"
            style={{ fontSize: "1.0625rem", lineHeight: 1.7, color: "var(--text-secondary)" }}
          >
            Four phases, one accountability. We name an owner for each phase
            and document what was decided, what was built, and what was tested.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Connecting line (desktop) */}
          <motion.div
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-7 hidden h-px origin-left lg:block"
            style={{
              background: `linear-gradient(90deg, var(--accent), var(--accent-cyan), var(--border-subtle))`,
            }}
            aria-hidden
          />

          <ol className="relative grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.label}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative flex flex-col"
                >
                  {/* Node */}
                  <div className="relative z-10 mb-5 flex items-center gap-3">
                    <div
                      className="relative flex size-14 items-center justify-center rounded-full border"
                      style={{
                        borderColor: "var(--accent)",
                        backgroundColor: "var(--bg-deep)",
                        color: "var(--accent-bright)",
                      }}
                    >
                      <Icon className="size-6" aria-hidden />
                      <span
                        className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full text-[10px] font-mono font-semibold"
                        style={{
                          backgroundColor: "var(--accent)",
                          color: "#fff",
                        }}
                      >
                        0{i + 1}
                      </span>
                    </div>
                  </div>
                  <h3
                    className="font-display text-xl font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {step.label}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {step.description}
                  </p>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
