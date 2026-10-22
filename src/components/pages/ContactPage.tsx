"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  ArrowRight,
  AlertTriangle,
  Check,
  Sparkles,
  Wand2,
  Sliders,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FormErrorState } from "@/components/site/FormErrorState";
import { ConsultationWizard } from "@/components/site/ConsultationWizard";
import { SolutionConfigurator } from "@/components/site/SolutionConfigurator";
import { CtaBandSection } from "@/components/sections/CtaBandSection";
import {
  useContentStore,
  useGlobalSettings,
  useServices,
} from "@/lib/content-store";
import {
  inquirySchema,
  PROJECT_TYPES,
  BUDGET_TIERS,
  CONTACT_METHODS,
  DEFAULT_INQUIRY_VALUES,
  toInquiry,
  type InquiryFormValues,
} from "@/lib/inquiry-schema";

type FormMode = "standard" | "wizard";

export function ContactPage() {
  const reduce = useReducedMotion();
  const globalSettings = useGlobalSettings();
  const [mode, setMode] = useState<FormMode>("wizard");
  const [wizardInitial, setWizardInitial] = useState<Partial<InquiryFormValues> | undefined>(undefined);

  const handleConfigure = (bundle: Partial<InquiryFormValues>) => {
    setWizardInitial(bundle);
    setMode("wizard");
  };

  return (
    <>
      {/* HERO */}
      <section
        aria-label="Contact"
        className="relative isolate overflow-hidden"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 55%), radial-gradient(ellipse at 15% 80%, color-mix(in srgb, var(--accent-cyan) 14%, transparent) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 coordinate-marks" aria-hidden />

        <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Contact", path: "/contact" },
            ]}
          />
          <div className="mt-8 max-w-3xl">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <span
                className="inline-flex size-1.5 rounded-full animate-pulse-soft"
                style={{ backgroundColor: "var(--accent-cyan)" }}
                aria-hidden
              />
              <span className="eyebrow" style={{ color: "var(--text-secondary)" }}>
                Talk to an engineer
              </span>
            </motion.div>
            <h1
              className="mt-6 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(2.5rem, 5.5vw, 4rem)",
                lineHeight: 1.03,
                color: "var(--text-primary)",
              }}
            >
              Tell us what needs to be protected.
            </h1>
            <p
              className="mt-5 max-w-xl text-pretty"
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              Send a real inquiry and a sales engineer gets back to you within
              one business day. No automated funnel, no commitment. Just an
              honest read on whether we&apos;re the right partner for the size
              of your problem.
            </p>
            <p
              className="mt-3 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Demo notice: this is a proposal-stage demo site. Sample contact
              info and forms persist to your browser&apos;s local storage only —
              nothing leaves your machine.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT INFO + FORM LAYOUT */}
      <section
        aria-label="Contact information and inquiry form"
        className="py-16 sm:py-20"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            {/* LEFT — Contact info + map */}
            <div className="lg:col-span-4">
              <div className="eyebrow">Reach us</div>
              <h2
                className="mt-4 font-display text-2xl font-semibold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Sample contact info
              </h2>

              <div
                className="mt-4 flex items-start gap-2 rounded-lg border p-3 text-xs"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--warning) 10%, var(--surface-1))",
                  borderColor: "color-mix(in srgb, var(--warning) 35%, transparent)",
                  color: "var(--text-secondary)",
                }}
                role="note"
              >
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  style={{ color: "var(--warning)" }}
                  aria-hidden
                />
                <span>
                  <span style={{ color: "var(--warning)" }} className="font-semibold">
                    Sample contact info
                  </span>{" "}
                  — replace email, phone, address, and hours with the real
                  ones before launch.
                </span>
              </div>

              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                      borderColor: "var(--accent)",
                      backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
                    }}
                  >
                    <Mail className="size-4" style={{ color: "var(--accent-bright)" }} aria-hidden />
                  </span>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                      Email
                    </div>
                    <a
                      href={`mailto:${globalSettings.contact.email}`}
                      className="mt-0.5 inline-block text-sm font-medium transition-colors hover:text-[var(--accent-bright)]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {globalSettings.contact.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                      borderColor: "var(--accent)",
                      backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
                    }}
                  >
                    <Phone className="size-4" style={{ color: "var(--accent-bright)" }} aria-hidden />
                  </span>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                      Phone
                    </div>
                    <a
                      href={`tel:${globalSettings.contact.phone.replace(/[^+\d]/g, "")}`}
                      className="mt-0.5 inline-block text-sm font-medium transition-colors hover:text-[var(--accent-bright)]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {globalSettings.contact.phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                      borderColor: "var(--accent)",
                      backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
                    }}
                  >
                    <Clock className="size-4" style={{ color: "var(--accent-bright)" }} aria-hidden />
                  </span>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                      Hours
                    </div>
                    <ul className="mt-1 space-y-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {globalSettings.contact.hours.map((h) => (
                        <li key={h.day} className="flex justify-between gap-4">
                          <span>{h.day}</span>
                          <span style={{ color: "var(--text-muted)" }}>{h.hours}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                      borderColor: "var(--accent)",
                      backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
                    }}
                  >
                    <MapPin className="size-4" style={{ color: "var(--accent-bright)" }} aria-hidden />
                  </span>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                      Service area
                    </div>
                    <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {globalSettings.contact.addressSample}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      National + remote — see the map below.
                    </p>
                  </div>
                </li>
              </ul>

              {/* MAP PLACEHOLDER */}
              <div
                className="mt-6 overflow-hidden rounded-xl border"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-1)",
                }}
                aria-label="Sample service-area map placeholder"
              >
                <MapPlaceholder />
                <div
                  className="border-t px-3 py-2 text-[10px]"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
                >
                  <span className="font-semibold" style={{ color: "var(--warning)" }}>
                    Sample service area
                  </span>{" "}
                  — replace with a real embedded map before launch.
                </div>
              </div>
            </div>

            {/* RIGHT — Form / wizard / configurator */}
            <div className="lg:col-span-8">
              {/* Mode toggle */}
              <Tabs value={mode} onValueChange={(v) => setMode(v as FormMode)}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="eyebrow">Send an inquiry</div>
                    <h2
                      className="mt-2 font-display text-2xl font-semibold tracking-tight"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Standard form or guided wizard
                    </h2>
                  </div>
                  <TabsList
                    className="bg-transparent p-0"
                    style={{
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "var(--surface-1)",
                    }}
                  >
                    <TabsTrigger
                      value="standard"
                      className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-white"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Sliders className="size-3.5" aria-hidden />
                      Standard form
                    </TabsTrigger>
                    <TabsTrigger
                      value="wizard"
                      className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-white"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Wand2 className="size-3.5" aria-hidden />
                      Guided wizard
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="standard" className="mt-6">
                  <StandardInquiryForm />
                </TabsContent>
                <TabsContent value="wizard" className="mt-6">
                  <div id="consultation-wizard" className="scroll-mt-24">
                    <ConsultationWizard initial={wizardInitial} />
                  </div>
                </TabsContent>
              </Tabs>

              {/* SOLUTION CONFIGURATOR */}
              <div className="mt-12">
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                      borderColor: "var(--accent)",
                      backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
                    }}
                  >
                    <Sparkles className="size-4" style={{ color: "var(--accent-bright)" }} aria-hidden />
                  </span>
                  <div>
                    <div className="eyebrow">Or start here</div>
                    <h2
                      className="font-display text-xl font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Solution configurator
                    </h2>
                  </div>
                </div>
                <p
                  className="mt-2 max-w-2xl text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Not sure where to start? Pick your industry, your top priorities,
                  and your company size — we&apos;ll suggest a starting bundle, then
                  prefill the wizard with one click.
                </p>
                <div className="mt-4">
                  <SolutionConfigurator onConfigure={handleConfigure} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBandSection />
    </>
  );
}

// ============================================================
// STANDARD INQUIRY FORM
// ============================================================
function StandardInquiryForm() {
  const services = useServices();
  const { upsertInquiry } = useContentStore();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [resetTimerId, setResetTimerId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { ...DEFAULT_INQUIRY_VALUES },
    mode: "onChange",
  });

  useEffect(() => {
    return () => {
      if (resetTimerId) clearTimeout(resetTimerId);
    };
  }, [resetTimerId]);

  const onValid = async (values: typeof DEFAULT_INQUIRY_VALUES) => {
    setSubmitting(true);
    setShowErrorSummary(false);
    // Simulate 800ms latency
    await new Promise((r) => setTimeout(r, 800));
    const inquiry = toInquiry(values);
    upsertInquiry(inquiry);
    setSubmitting(false);
    setSubmitted(true);
    toast.success("Inquiry received (demo).", {
      description: "We'll be in touch within 1 business day.",
    });
    form.reset({ ...DEFAULT_INQUIRY_VALUES });
    const t = setTimeout(() => {
      setSubmitted(false);
    }, 6000);
    setResetTimerId(t);
  };

  const onInvalid = () => {
    setShowErrorSummary(true);
  };

  const submit = form.handleSubmit(onValid, onInvalid);

  const submitAnother = () => {
    if (resetTimerId) clearTimeout(resetTimerId);
    setSubmitted(false);
  };

  const errorList = useMemo(() => {
    const errs = form.formState.errors;
    const out: { field: string; message: string }[] = [];
    if (errs.name) out.push({ field: "Name", message: errs.name.message as string });
    if (errs.email) out.push({ field: "Email", message: errs.email.message as string });
    if (errs.projectType) out.push({ field: "Project type", message: errs.projectType.message as string });
    if (errs.budget) out.push({ field: "Budget", message: errs.budget.message as string });
    if (errs.message) out.push({ field: "Description", message: errs.message.message as string });
    if (errs.preferredContact) out.push({ field: "Contact method", message: errs.preferredContact.message as string });
    if (errs.consent) out.push({ field: "Consent", message: errs.consent.message as string });
    return out;
  }, [form.formState.errors]);

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
        <div
          className="mx-auto flex size-14 items-center justify-center rounded-full border"
          style={{
            borderColor: "var(--success)",
            backgroundColor: "color-mix(in srgb, var(--success) 14%, transparent)",
          }}
        >
          <Check className="size-7" style={{ color: "var(--success)" }} aria-hidden />
        </div>
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
          We&apos;ll be in touch within 1 business day. For urgent matters, use
          the contact info shown on this page.
        </p>
        <div className="mt-6">
          <Button
            type="button"
            onClick={submitAnother}
            variant="outline"
            style={{ borderColor: "var(--border-strong)" }}
          >
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {showErrorSummary && errorList.length > 0 && (
        <FormErrorState
          errors={errorList}
          title="Please fix the highlighted fields"
          description={`${errorList.length} field${errorList.length === 1 ? "" : "s"} need attention before we can submit your inquiry.`}
        />
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Full name" required error={form.formState.errors.name?.message as string | undefined}>
          <Input
            {...form.register("name")}
            placeholder="Jordan Whittaker"
            aria-invalid={!!form.formState.errors.name}
            aria-required="true"
            style={{ backgroundColor: "var(--bg-deep)", borderColor: "var(--border-subtle)" }}
          />
        </Field>
        <Field label="Email" required error={form.formState.errors.email?.message as string | undefined}>
          <Input
            type="email"
            {...form.register("email")}
            placeholder="you@company.com"
            aria-invalid={!!form.formState.errors.email}
            aria-required="true"
            style={{ backgroundColor: "var(--bg-deep)", borderColor: "var(--border-subtle)" }}
          />
        </Field>
      </div>

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

      <Field label="Location (optional)" error={form.formState.errors.location?.message as string | undefined}>
        <Input
          {...form.register("location")}
          placeholder="Metropolitan CBD / Multi-site / On-site visit"
          style={{ backgroundColor: "var(--bg-deep)", borderColor: "var(--border-subtle)" }}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Service area of interest"
          error={form.formState.errors.serviceSlug?.message as string | undefined}
        >
          <ServiceSelect form={form} services={services} />
        </Field>
        <Field
          label="Project type"
          required
          error={form.formState.errors.projectType?.message as string | undefined}
        >
          <ProjectTypeSelect form={form} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Approximate budget"
          required
          error={form.formState.errors.budget?.message as string | undefined}
        >
          <BudgetSelect form={form} />
        </Field>
        <Field
          label="Preferred contact method"
          required
          error={form.formState.errors.preferredContact?.message as string | undefined}
        >
          <PreferredContactRadio form={form} />
        </Field>
      </div>

      <Field
        label="Project description"
        required
        error={form.formState.errors.message?.message as string | undefined}
        hint="At least 30 characters"
      >
        <Textarea
          {...form.register("message")}
          rows={6}
          placeholder="Tell us about your facility, the outcomes you actually need, and any constraints we should know about (occupancy, schedule, existing systems, etc.)."
          aria-invalid={!!form.formState.errors.message}
          aria-required="true"
          style={{ backgroundColor: "var(--bg-deep)", borderColor: "var(--border-subtle)" }}
        />
      </Field>

      <Field
        label="Consent"
        required
        error={form.formState.errors.consent?.message as string | undefined}
      >
        <ConsentCheckbox form={form} />
      </Field>

      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        Demo notice: this is a proposal-stage demo site. Inquiries persist to your
        browser&apos;s local storage and never leave your machine.
      </p>

      <div className="flex items-center gap-3 pt-2">
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
              <ArrowRight className="size-4" aria-hidden />
              Send inquiry
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            form.reset({ ...DEFAULT_INQUIRY_VALUES });
            setShowErrorSummary(false);
          }}
          style={{ color: "var(--text-muted)" }}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}

function ServiceSelect({
  form,
  services,
}: {
  form: ReturnType<typeof useForm<InquiryFormValues>>;
  services: ReturnType<typeof useServices>;
}) {
  const serviceSlug = useWatch({ control: form.control, name: "serviceSlug" });
  return (
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
  );
}

function ProjectTypeSelect({ form }: { form: ReturnType<typeof useForm<InquiryFormValues>> }) {
  const projectType = useWatch({ control: form.control, name: "projectType" });
  return (
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
  );
}

function BudgetSelect({ form }: { form: ReturnType<typeof useForm<InquiryFormValues>> }) {
  const budget = useWatch({ control: form.control, name: "budget" });
  return (
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
  );
}

function PreferredContactRadio({ form }: { form: ReturnType<typeof useForm<InquiryFormValues>> }) {
  const preferredContact = useWatch({ control: form.control, name: "preferredContact" }) as "email" | "phone" | "either";
  return (
    <RadioGroup
      value={preferredContact}
      onValueChange={(v) => form.setValue("preferredContact", v as "email" | "phone" | "either", { shouldValidate: true })}
      className="flex flex-wrap gap-4 pt-2"
    >
      {CONTACT_METHODS.map((m) => (
        <div key={m.value} className="flex items-center gap-2">
          <RadioGroupItem id={`std-pref-${m.value}`} value={m.value} />
          <Label htmlFor={`std-pref-${m.value}`} className="text-sm cursor-pointer">
            {m.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

function ConsentCheckbox({ form }: { form: ReturnType<typeof useForm<InquiryFormValues>> }) {
  const consent = useWatch({ control: form.control, name: "consent" }) as boolean;
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id="std-consent"
        checked={consent}
        onCheckedChange={(v) => form.setValue("consent", v as true, { shouldValidate: true })}
        className="mt-0.5"
        aria-required="true"
      />
      <Label
        htmlFor="std-consent"
        className="text-xs leading-relaxed cursor-pointer"
        style={{ color: "var(--text-secondary)" }}
      >
        I agree to be contacted about my inquiry and have read the{" "}
        <Link to="/privacy" className="underline hover:text-[var(--accent-bright)]">
          Privacy Policy
        </Link>
        .
      </Label>
    </div>
  );
}

// ============================================================
// SHARED FIELD WRAPPER
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

// ============================================================
// MAP PLACEHOLDER (SVG/CSS — clearly labeled sample)
// ============================================================
function MapPlaceholder() {
  return (
    <div
      className="relative aspect-[16/10] w-full"
      style={{ backgroundColor: "var(--bg-deep)" }}
      aria-label="Sample service area map (placeholder)"
      role="img"
    >
      {/* SVG grid + region rings */}
      <svg
        viewBox="0 0 320 200"
        className="absolute inset-0 size-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <radialGradient id="map-glow" cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="200" fill="var(--bg-deep)" />
        <rect width="320" height="200" fill="url(#map-glow)" />
        {/* Grid lines */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 40}
            y1={0}
            x2={i * 40}
            y2={200}
            stroke="var(--border-subtle)"
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * 40}
            x2={320}
            y2={i * 40}
            stroke="var(--border-subtle)"
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}
        {/* Service-area rings */}
        <circle cx="160" cy="110" r="38" fill="none" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.5" />
        <circle cx="160" cy="110" r="68" fill="none" stroke="var(--accent-cyan)" strokeWidth="0.6" strokeDasharray="2 4" opacity="0.4" />
        <circle cx="160" cy="110" r="100" fill="none" stroke="var(--accent)" strokeWidth="0.4" strokeDasharray="1 5" opacity="0.3" />
        {/* HQ marker */}
        <circle cx="160" cy="110" r="3.5" fill="var(--accent-bright)" />
        <circle cx="160" cy="110" r="6" fill="none" stroke="var(--accent-bright)" strokeWidth="0.8" opacity="0.5">
          <animate attributeName="r" from="3" to="9" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.7" to="0" dur="2.4s" repeatCount="indefinite" />
        </circle>
        {/* Outpost markers */}
        <circle cx="60" cy="60" r="2" fill="var(--accent-cyan)" />
        <circle cx="255" cy="80" r="2" fill="var(--accent-cyan)" />
        <circle cx="80" cy="160" r="2" fill="var(--accent-cyan)" />
        <circle cx="240" cy="155" r="2" fill="var(--accent-cyan)" />
        {/* Connection arcs */}
        <path d="M 160 110 Q 110 80 60 60" fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.6" />
        <path d="M 160 110 Q 200 80 255 80" fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.6" />
        <path d="M 160 110 Q 120 140 80 160" fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.6" />
        <path d="M 160 110 Q 200 140 240 155" fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.6" />
      </svg>
      {/* Overlays */}
      <div className="absolute left-3 top-3 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
        SERVICE AREA · SAMPLE
      </div>
      <div className="absolute bottom-3 left-3 font-mono text-[10px]" style={{ color: "var(--accent-bright)" }}>
        ◉ HQ
      </div>
      <div className="absolute bottom-3 right-3 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
        ○ Outposts
      </div>
    </div>
  );
}
