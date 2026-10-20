"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Building2,
  HeartPulse,
  GraduationCap,
  Hotel,
  Factory,
  ShoppingBag,
  Home,
  Landmark,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
} from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useServices, useIndustries } from "@/lib/content-store";
import {
  COMPANY_SIZES,
  PRIORITY_SLUGS,
  type InquiryFormValues,
} from "@/lib/inquiry-schema";
import { toast } from "sonner";

const INDUSTRY_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties; "aria-hidden"?: boolean }>> = {
  Building2,
  HeartPulse,
  GraduationCap,
  Hotel,
  Factory,
  ShoppingBag,
  Home,
  Landmark,
};

interface SolutionConfiguratorProps {
  /** Callback to prefill the consultation wizard with the recommended bundle */
  onConfigure: (bundle: Partial<InquiryFormValues>) => void;
}

interface ConfiguratorState {
  step: 1 | 2 | 3 | 4;
  industrySlug: string | null;
  priorities: string[];
  companySize: string | null;
}

const DEFAULT_STATE: ConfiguratorState = {
  step: 1,
  industrySlug: null,
  priorities: [],
  companySize: null,
};

export function SolutionConfigurator({ onConfigure }: SolutionConfiguratorProps) {
  const reduce = useReducedMotion();
  const services = useServices();
  const industries = useIndustries();
  const [state, setState] = useState<ConfiguratorState>(DEFAULT_STATE);

  const recommendedBundle = useMemo(() => {
    if (!state.industrySlug || state.priorities.length === 0) return null;
    const industry = industries.find((i) => i.slug === state.industrySlug);
    if (!industry) return null;

    // Combine the chosen priorities with the industry's recommended services
    const combined = Array.from(
      new Set([
        ...state.priorities,
        ...industry.recommendedServiceSlugs,
      ])
    )
      .map((slug) => services.find((s) => s.slug === slug))
      .filter(Boolean)
      .slice(0, 4);

    return { industry, services: combined };
  }, [state, services, industries]);

  const togglePriority = (slug: string) => {
    setState((s) => ({
      ...s,
      priorities: s.priorities.includes(slug)
        ? s.priorities.filter((p) => p !== slug)
        : s.priorities.length < 3
          ? [...s.priorities, slug]
          : s.priorities,
    }));
  };

  const next = () => {
    setState((s) => ({ ...s, step: (Math.min(4, s.step + 1) as ConfiguratorState["step"]) }));
  };
  const back = () => {
    setState((s) => ({ ...s, step: (Math.max(1, s.step - 1) as ConfiguratorState["step"]) }));
  };

  const canProceed = () => {
    if (state.step === 1) return !!state.industrySlug;
    if (state.step === 2) return state.priorities.length >= 1;
    if (state.step === 3) return !!state.companySize;
    return true;
  };

  const reset = () => setState(DEFAULT_STATE);

  const applyToWizard = () => {
    if (!recommendedBundle) return;
    const bundle: Partial<InquiryFormValues> = {
      serviceSlug: recommendedBundle.services[0]?.slug,
      projectType: "New deployment",
      message: `Industry: ${recommendedBundle.industry.name} (${recommendedBundle.industry.tagline}). Recommended bundle: ${recommendedBundle.services.map((s) => s.title).join(", ")}. Company size: ${state.companySize}. Please tell us how to bring this bundle to our facility.`,
    };
    onConfigure(bundle);
    toast.success("Bundle prefilled in the consultation wizard below.", {
      description: "Pick up where you left off, or edit any field.",
    });
    if (typeof document !== "undefined") {
      const el = document.getElementById("consultation-wizard");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="rounded-xl border p-6 sm:p-8"
      style={{
        borderColor: "var(--border-subtle)",
        backgroundColor: "var(--surface-1)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-lg border"
          style={{
            borderColor: "var(--accent)",
            backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
          }}
        >
          <Sparkles className="size-5" style={{ color: "var(--accent-bright)" }} aria-hidden />
        </div>
        <div>
          <div className="eyebrow">Interactive tool · Demo</div>
          <h2
            className="mt-1 font-display text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Solution configurator
          </h2>
        </div>
      </div>
      <p
        className="mt-4 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        Three questions. One illustrative recommendation. Pick your industry,
        pick your top priorities, pick your company size — we&apos;ll suggest
        a starting bundle.
      </p>

      {/* Stepper */}
      <div className="mt-6 flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
        <span className="font-mono">
          Step {state.step} of 4
        </span>
        <span>
          {state.step < 4 ? "Configuring…" : "Ready"}
        </span>
      </div>
      <div
        className="mt-2 h-1 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--surface-2)" }}
        aria-hidden
      >
        <motion.div
          className="h-full"
          animate={{ width: `${(state.step / 4) * 100}%` }}
          transition={{ duration: 0.4 }}
          style={{
            background: "linear-gradient(90deg, var(--accent), var(--accent-cyan))",
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={state.step}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="mt-6"
        >
          {state.step === 1 && (
            <div>
              <Label className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                1 · Your industry
              </Label>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {industries.map((ind) => {
                  const Icon = ind.icon ? INDUSTRY_ICONS[ind.icon] || Building2 : Building2;
                  const isActive = state.industrySlug === ind.slug;
                  return (
                    <button
                      key={ind.slug}
                      type="button"
                      onClick={() => setState((s) => ({ ...s, industrySlug: ind.slug }))}
                      aria-pressed={isActive}
                      className="flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all"
                      style={{
                        borderColor: isActive ? "var(--accent)" : "var(--border-subtle)",
                        backgroundColor: isActive
                          ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                          : "transparent",
                      }}
                    >
                      <Icon
                        className="size-5"
                        style={{ color: isActive ? "var(--accent-bright)" : "var(--text-muted)" }}
                        aria-hidden
                      />
                      <span
                        className="text-[10px] font-medium"
                        style={{
                          color: isActive ? "var(--accent-bright)" : "var(--text-secondary)",
                        }}
                      >
                        {ind.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {state.step === 2 && (
            <div>
              <Label className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                2 · Top priorities
              </Label>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                Pick 1–3 priorities. We&apos;ll combine them with the industry&apos;s recommended services.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PRIORITY_SLUGS.map((p) => {
                  const isActive = state.priorities.includes(p.slug);
                  const service = services.find((s) => s.slug === p.slug);
                  return (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => togglePriority(p.slug)}
                      aria-pressed={isActive}
                      className="flex items-center gap-2 rounded-lg border p-2 text-left transition-all"
                      style={{
                        borderColor: isActive ? "var(--accent)" : "var(--border-subtle)",
                        backgroundColor: isActive
                          ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                          : "transparent",
                      }}
                    >
                      <span
                        className="flex size-5 shrink-0 items-center justify-center rounded-full border"
                        style={{
                          borderColor: isActive ? "var(--accent)" : "var(--border-strong)",
                          backgroundColor: isActive ? "var(--accent)" : "transparent",
                          color: "#fff",
                        }}
                      >
                        {isActive ? <Check className="size-3" aria-hidden /> : null}
                      </span>
                      <span
                        className="text-[10px] font-medium"
                        style={{
                          color: isActive ? "var(--accent-bright)" : "var(--text-secondary)",
                        }}
                      >
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                {state.priorities.length} / 3 selected
              </p>
            </div>
          )}

          {state.step === 3 && (
            <div>
              <Label className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                3 · Company size
              </Label>
              <div className="mt-4 space-y-2">
                {COMPANY_SIZES.map((size) => {
                  const isActive = state.companySize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setState((s) => ({ ...s, companySize: size }))}
                      aria-pressed={isActive}
                      className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all"
                      style={{
                        borderColor: isActive ? "var(--accent)" : "var(--border-subtle)",
                        backgroundColor: isActive
                          ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                          : "transparent",
                      }}
                    >
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: isActive ? "var(--accent-bright)" : "var(--text-secondary)",
                        }}
                      >
                        {size}
                      </span>
                      {isActive && (
                        <Check className="size-4" style={{ color: "var(--accent-bright)" }} aria-hidden />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {state.step === 4 && recommendedBundle && (
            <div>
              <div className="eyebrow">Recommendation</div>
              <h3
                className="mt-2 font-display text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Illustrative bundle for {recommendedBundle.industry.name}
              </h3>
              <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                Starting point only — your real bundle is shaped by your facility,
                risk model, and budget. Talk to an engineer for a real proposal.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {recommendedBundle.services.map((s, i) => (
                  <div
                    key={s.slug}
                    className="flex items-center gap-3 rounded-lg border p-3"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--bg-deep)",
                    }}
                  >
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]"
                      style={{
                        borderColor: "var(--accent)",
                        backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
                        color: "var(--accent-bright)",
                      }}
                    >
                      0{i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {s.title}
                      </div>
                      <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {s.tagline}
                      </div>
                    </div>
                    <Link
                      to={`/services/${s.slug}`}
                      className="text-xs font-medium"
                      style={{ color: "var(--accent-bright)" }}
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={applyToWizard}
                  className="inline-flex items-center gap-2"
                  style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                >
                  Talk to an expert about this bundle
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={reset}
                  className="inline-flex items-center gap-2"
                  style={{ borderColor: "var(--border-strong)" }}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {state.step < 4 && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={state.step === 1 ? undefined : back}
            disabled={state.step === 1}
            className="inline-flex items-center gap-2"
            style={{ borderColor: "var(--border-strong)" }}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Button>
          <Button
            type="button"
            onClick={next}
            disabled={!canProceed()}
            className="inline-flex items-center gap-2"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            Continue
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}
