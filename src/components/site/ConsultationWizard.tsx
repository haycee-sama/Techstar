"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronRight } from "lucide-react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/lib/router";
import { useServices, useContentStore } from "@/lib/content-store";
import {
  inquirySchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  DEFAULT_INQUIRY_VALUES,
  PROJECT_TYPES,
  BUDGET_TIERS,
  TIMELINES,
  CONTACT_METHODS,
  toInquiry,
  type InquiryFormValues,
} from "@/lib/inquiry-schema";
import { toast } from "sonner";

const STEPS = [
  { id: 1, label: "About you", schema: step1Schema },
  { id: 2, label: "Project", schema: step2Schema },
  { id: 3, label: "Details", schema: step3Schema },
  { id: 4, label: "Review & consent", schema: step4Schema },
];

interface ConsultationWizardProps {
  /** Optional prefill bundle (e.g. from Solution Configurator) */
  initial?: Partial<InquiryFormValues>;
  /** On submit-success callback (e.g. parent wants to reset/clear) */
  onSubmitted?: () => void;
}

export function ConsultationWizard({ initial, onSubmitted }: ConsultationWizardProps) {
  const reduce = useReducedMotion();
  const services = useServices();
  const { upsertInquiry } = useContentStore();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [autoResetTimer, setAutoResetTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { ...DEFAULT_INQUIRY_VALUES, ...initial },
    mode: "onChange",
  });

  // Prefill if initial changes (e.g. user changes bundle in configurator)
  // Using JSON.stringify(initial) as a stable dependency signature so the
  // effect re-runs when the bundle object identity changes but not on every render.
  useEffect(() => {
    if (initial) {
      Object.entries(initial).forEach(([k, v]) => {
        form.setValue(k as keyof InquiryFormValues, v as never, {
          shouldValidate: false,
          shouldDirty: true,
        });
      });
    }
  }, [JSON.stringify(initial), form]);

  // Clear auto-reset on unmount
  useEffect(() => {
    return () => {
      if (autoResetTimer) clearTimeout(autoResetTimer);
    };
  }, [autoResetTimer]);

  // Field-level schema for the current step
  const stepSchema = STEPS[step - 1].schema;
  const stepFields = useMemo(() => {
    const keys = stepSchema && typeof stepSchema === "object" && "shape" in stepSchema
      ? Object.keys((stepSchema as { shape: Record<string, unknown> }).shape)
      : [];
    return keys as (keyof InquiryFormValues)[];
  }, [stepSchema]);

  const validateStep = async (): Promise<boolean> => {
    const values = form.getValues();
    const result = await stepSchema.safeParseAsync(
      Object.fromEntries(stepFields.map((k) => [k, values[k]]))
    );
    if (!result.success) {
      // Apply errors to the form
      stepFields.forEach((field) => {
        const err = result.error.issues.find((i) => i.path[0] === field);
        if (err) {
          form.setError(field, { type: "manual", message: err.message });
        } else {
          form.clearErrors(field);
        }
      });
      // Trigger validation display
      await form.trigger(stepFields);
      return false;
    }
    return true;
  };

  const next = async () => {
    const ok = await validateStep();
    if (ok && step < STEPS.length) {
      setStep((s) => s + 1);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const back = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    // Simulate 800ms network latency
    await new Promise((r) => setTimeout(r, 800));
    const inquiry = toInquiry(values);
    upsertInquiry(inquiry);
    setSubmitting(false);
    setSubmitted(true);
    toast.success("Inquiry received (demo).", {
      description: "We'll be in touch within 1 business day.",
    });
    onSubmitted?.();
    const t = setTimeout(() => {
      setSubmitted(false);
      setStep(1);
      form.reset({ ...DEFAULT_INQUIRY_VALUES });
    }, 6000);
    setAutoResetTimer(t);
  });

  const submitAnother = () => {
    if (autoResetTimer) clearTimeout(autoResetTimer);
    setSubmitted(false);
    setStep(1);
    form.reset({ ...DEFAULT_INQUIRY_VALUES });
  };

  const progress = (step / STEPS.length) * 100;
  const values = useWatch({ control: form.control }) as InquiryFormValues;

  if (submitted) {
    return (
      <div
        className="rounded-xl border p-8 text-center"
        style={{
          borderColor: "color-mix(in srgb, var(--success) 35%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--success) 8%, var(--surface-1))",
        }}
        role="status"
        aria-live="polite"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mx-auto flex size-14 items-center justify-center rounded-full border"
          style={{
            borderColor: "var(--success)",
            backgroundColor: "color-mix(in srgb, var(--success) 14%, transparent)",
          }}
        >
          <Check className="size-7" style={{ color: "var(--success)" }} aria-hidden />
        </motion.div>
        <h3
          className="mt-5 font-display text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Thanks — your inquiry has been received (demo).
        </h3>
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          We&apos;ll be in touch within 1 business day. For urgent matters,
          reach us at the contact info shown on this page.
        </p>
        <p
          className="mt-2 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Inquiry ID: <span className="font-mono">{values.email ? values.email.slice(0, 4) : ""}-demo</span>
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            onClick={submitAnother}
            variant="outline"
            style={{ borderColor: "var(--border-strong)" }}
          >
            Submit another
          </Button>
          <Button asChild variant="ghost" style={{ color: "var(--text-muted)" }}>
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        {/* Stepper header */}
        <div
          className="rounded-xl border p-5"
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--surface-1)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => {
                const isActive = step === s.id;
                const isComplete = step > s.id;
                return (
                  <div key={s.id} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => isComplete && setStep(s.id)}
                      disabled={!isComplete}
                      aria-current={isActive ? "step" : undefined}
                      className="inline-flex items-center gap-2 text-xs"
                      style={{
                        color: isActive || isComplete
                          ? "var(--accent-bright)"
                          : "var(--text-muted)",
                        cursor: isComplete ? "pointer" : "default",
                      }}
                    >
                      <span
                        className="flex size-6 items-center justify-center rounded-full border font-mono text-[10px]"
                        style={{
                          borderColor: isActive || isComplete
                            ? "var(--accent)"
                            : "var(--border-strong)",
                          backgroundColor: isActive
                            ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                            : "transparent",
                          color: isActive || isComplete
                            ? "var(--accent-bright)"
                            : "var(--text-muted)",
                        }}
                      >
                        {isComplete ? <Check className="size-3" aria-hidden /> : s.id}
                      </span>
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <ChevronRight
                        className="mx-1 size-3"
                        style={{ color: "var(--border-strong)" }}
                        aria-hidden
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {step} / {STEPS.length}
            </div>
          </div>
          {/* Progress bar */}
          <div
            className="mt-4 h-1 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "var(--surface-2)" }}
            aria-hidden
          >
            <motion.div
              className="h-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: "linear-gradient(90deg, var(--accent), var(--accent-cyan))",
              }}
            />
          </div>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && <Step1 form={form} />}
            {step === 2 && <Step2 form={form} services={services} />}
            {step === 3 && <Step3 form={form} />}
            {step === 4 && <Step4 form={form} values={values} services={services} />}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={back}
            disabled={step === 1}
            className="inline-flex items-center gap-2"
            style={{ borderColor: "var(--border-strong)" }}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Button>
          {step < STEPS.length ? (
            <Button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              Continue
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              {submitting ? (
                <>
                  <span
                    className="inline-flex size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden
                  />
                  Submitting…
                </>
              ) : (
                <>
                  <Check className="size-4" aria-hidden />
                  Submit inquiry
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

// ============================================================
// STEP 1 — ABOUT YOU
// ============================================================
function Step1({
  form,
}: {
  form: ReturnType<typeof useForm<InquiryFormValues>>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="eyebrow">Step 1 of 4</div>
        <h2
          className="mt-2 font-display text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          About you
        </h2>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          Tell us who you are and how to reach you.
        </p>
      </div>
      <Field label="Full name" required error={form.formState.errors.name?.message as string | undefined}>
        <Input
          {...form.register("name")}
          placeholder="Jordan Whittaker"
          aria-invalid={!!form.formState.errors.name}
          style={{ backgroundColor: "var(--bg-deep)", borderColor: "var(--border-subtle)" }}
        />
      </Field>
      <Field label="Email" required error={form.formState.errors.email?.message as string | undefined}>
        <Input
          type="email"
          {...form.register("email")}
          placeholder="you@company.com"
          aria-invalid={!!form.formState.errors.email}
          style={{ backgroundColor: "var(--bg-deep)", borderColor: "var(--border-subtle)" }}
        />
      </Field>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Phone (optional)" error={form.formState.errors.phone?.message as string | undefined}>
          <Input
            type="tel"
            {...form.register("phone")}
            placeholder="+1 (555) 010-1234"
            style={{ backgroundColor: "var(--bg-deep)", borderColor: "var(--border-subtle)" }}
          />
        </Field>
        <Field label="Company (optional)" error={form.formState.errors.company?.message as string | undefined}>
          <Input
            {...form.register("company")}
            placeholder="Meridian Properties"
            style={{ backgroundColor: "var(--bg-deep)", borderColor: "var(--border-subtle)" }}
          />
        </Field>
      </div>
    </div>
  );
}

// ============================================================
// STEP 2 — PROJECT
// ============================================================
function Step2({
  form,
  services,
}: {
  form: ReturnType<typeof useForm<InquiryFormValues>>;
  services: ReturnType<typeof useServices>;
}) {
  const serviceSlug = useWatch({ control: form.control, name: "serviceSlug" });
  const projectType = useWatch({ control: form.control, name: "projectType" });
  const budget = useWatch({ control: form.control, name: "budget" });
  const timeline = useWatch({ control: form.control, name: "timeline" });
  return (
    <div className="space-y-5">
      <div>
        <div className="eyebrow">Step 2 of 4</div>
        <h2
          className="mt-2 font-display text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Your project
        </h2>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          Tell us about the engagement you have in mind.
        </p>
      </div>

      <Field label="Service area of interest" error={form.formState.errors.serviceSlug?.message as string | undefined}>
        <Select
          value={serviceSlug || undefined}
          onValueChange={(v) => form.setValue("serviceSlug", v, { shouldValidate: true })}
        >
          <SelectTrigger style={{ backgroundColor: "var(--bg-deep)", borderColor: "var(--border-subtle)" }}>
            <SelectValue placeholder="Choose a service…" />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.slug} value={s.slug}>
                {s.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Project type" required error={form.formState.errors.projectType?.message as string | undefined}>
        <Select
          value={projectType || undefined}
          onValueChange={(v) => form.setValue("projectType", v, { shouldValidate: true })}
        >
          <SelectTrigger style={{ backgroundColor: "var(--bg-deep)", borderColor: "var(--border-subtle)" }}>
            <SelectValue placeholder="Choose a project type…" />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Approximate budget" required error={form.formState.errors.budget?.message as string | undefined}>
        <Select
          value={budget || undefined}
          onValueChange={(v) => form.setValue("budget", v, { shouldValidate: true })}
        >
          <SelectTrigger style={{ backgroundColor: "var(--bg-deep)", borderColor: "var(--border-subtle)" }}>
            <SelectValue placeholder="Choose a budget range…" />
          </SelectTrigger>
          <SelectContent>
            {BUDGET_TIERS.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Timeline (optional)" error={form.formState.errors.timeline?.message as string | undefined}>
        <Select
          value={timeline || undefined}
          onValueChange={(v) => form.setValue("timeline", v, { shouldValidate: true })}
        >
          <SelectTrigger style={{ backgroundColor: "var(--bg-deep)", borderColor: "var(--border-subtle)" }}>
            <SelectValue placeholder="Choose a timeline…" />
          </SelectTrigger>
          <SelectContent>
            {TIMELINES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}

// ============================================================
// STEP 3 — DETAILS
// ============================================================
function Step3({
  form,
}: {
  form: ReturnType<typeof useForm<InquiryFormValues>>;
}) {
  const message = useWatch({ control: form.control, name: "message" }) as string;
  return (
    <div className="space-y-5">
      <div>
        <div className="eyebrow">Step 3 of 4</div>
        <h2
          className="mt-2 font-display text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Project details
        </h2>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          Where, what, and why.
        </p>
      </div>
      <Field label="Location (optional)" error={form.formState.errors.location?.message as string | undefined}>
        <Input
          {...form.register("location")}
          placeholder="Metropolitan CBD / Multi-site / On-site visit"
          style={{ backgroundColor: "var(--bg-deep)", borderColor: "var(--border-subtle)" }}
        />
      </Field>
      <Field
        label="Project description"
        required
        error={form.formState.errors.message?.message as string | undefined}
        hint={`${(message || "").length} / 4,000`}
      >
        <Textarea
          {...form.register("message")}
          rows={6}
          placeholder="Tell us about your facility, the outcomes you actually need, and any constraints we should know about (occupancy, schedule, existing systems, etc.)."
          aria-invalid={!!form.formState.errors.message}
          style={{ backgroundColor: "var(--bg-deep)", borderColor: "var(--border-subtle)" }}
        />
      </Field>
    </div>
  );
}

// ============================================================
// STEP 4 — REVIEW & CONSENT
// ============================================================
function Step4({
  form,
  values,
  services,
}: {
  form: ReturnType<typeof useForm<InquiryFormValues>>;
  values: InquiryFormValues;
  services: ReturnType<typeof useServices>;
}) {
  const selectedService = services.find((s) => s.slug === values.serviceSlug);

  return (
    <div className="space-y-5">
      <div>
        <div className="eyebrow">Step 4 of 4</div>
        <h2
          className="mt-2 font-display text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Review &amp; consent
        </h2>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          Please review your submission before sending.
        </p>
      </div>

      <div
        className="rounded-lg border p-4"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
      >
        <div className="space-y-3 text-sm">
          <ReviewRow label="Name" value={values.name} />
          <ReviewRow label="Email" value={values.email} />
          {values.phone && <ReviewRow label="Phone" value={values.phone} />}
          {values.company && <ReviewRow label="Company" value={values.company} />}
          {selectedService && <ReviewRow label="Service" value={selectedService.title} />}
          {values.projectType && <ReviewRow label="Project type" value={values.projectType} />}
          {values.budget && <ReviewRow label="Budget" value={values.budget} />}
          {values.timeline && <ReviewRow label="Timeline" value={values.timeline} />}
          {values.location && <ReviewRow label="Location" value={values.location} />}
        </div>
        <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="eyebrow">Description</div>
          <p
            className="mt-1 text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {values.message}
          </p>
        </div>
      </div>

      <Field
        label="Preferred contact method"
        required
        error={form.formState.errors.preferredContact?.message as string | undefined}
      >
        <RadioGroup
          value={values.preferredContact}
          onValueChange={(v) => form.setValue("preferredContact", v as "email" | "phone" | "either", { shouldValidate: true })}
          className="flex flex-wrap gap-4"
        >
          {CONTACT_METHODS.map((m) => (
            <div key={m.value} className="flex items-center gap-2">
              <RadioGroupItem id={`pref-${m.value}`} value={m.value} />
              <Label htmlFor={`pref-${m.value}`} className="text-sm cursor-pointer">
                {m.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Field>

      <Field
        label="Consent"
        required
        error={form.formState.errors.consent?.message as string | undefined}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            id="wizard-consent"
            checked={values.consent as boolean}
            onCheckedChange={(v) => form.setValue("consent", v as true, { shouldValidate: true })}
            className="mt-0.5"
          />
          <Label htmlFor="wizard-consent" className="text-xs leading-relaxed cursor-pointer" style={{ color: "var(--text-secondary)" }}>
            I agree to be contacted about my inquiry and have read the{" "}
            <Link to="/privacy" className="underline hover:text-[var(--accent-bright)]">
              Privacy Policy
            </Link>
            .
          </Label>
        </div>
      </Field>

      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        Demo notice: this is a proposal-stage demo site. Inquiries persist to your
        browser&apos;s local storage and never leave your machine.
      </p>
    </div>
  );
}

// ============================================================
// SHARED FIELD + REVIEW ROW
// ============================================================
function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          {label}
          {required && <span style={{ color: "var(--accent-bright)" }}> *</span>}
        </Label>
        {hint && <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{hint}</span>}
      </div>
      {children}
      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="text-xs"
          style={{ color: "var(--danger)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <span className="text-right text-xs" style={{ color: "var(--text-secondary)" }}>
        {value}
      </span>
    </div>
  );
}
