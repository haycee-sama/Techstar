"use client";

import { z } from "zod";
import { makeId } from "@/lib/utils";
import type { Inquiry } from "@/lib/types";

// ============================================================
// INQUIRY SCHEMA — shared between standard form and wizard
// ============================================================

export const PROJECT_TYPES = [
  "New deployment",
  "System upgrade",
  "Maintenance & support",
  "Consultation",
  "Audit & assessment",
] as const;

export const BUDGET_TIERS = [
  "Under $10k",
  "$10k – $25k",
  "$25k – $75k",
  "$75k – $250k",
  "$250k+",
  "Prefer not to say",
] as const;

export const TIMELINES = [
  "ASAP / urgent",
  "1 – 3 months",
  "3 – 6 months",
  "6 – 12 months",
  "Planning phase",
] as const;

export const CONTACT_METHODS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "either", label: "Either" },
] as const;

export const COMPANY_SIZES = [
  "1 – 10 employees",
  "11 – 50 employees",
  "51 – 250 employees",
  "251 – 1,000 employees",
  "1,000+ employees",
] as const;

export const PRIORITY_SLUGS = [
  { slug: "cctv-video-surveillance", label: "CCTV & Video" },
  { slug: "access-control-biometrics", label: "Access Control" },
  { slug: "intrusion-perimeter-security", label: "Intrusion & Perimeter" },
  { slug: "network-infrastructure-cabling", label: "Networking" },
  { slug: "fire-alarm-life-safety", label: "Fire & Life Safety" },
  { slug: "it-support-managed-services", label: "Managed IT" },
  { slug: "cybersecurity", label: "Cybersecurity" },
  { slug: "smart-buildings-automation", label: "Smart Buildings" },
] as const;

export const inquirySchema = z.object({
  name: z.string().min(2, "Please enter your name (at least 2 characters)."),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  phone: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  serviceSlug: z.string().optional(),
  projectType: z.string().min(1, "Please choose a project type."),
  budget: z.string().min(1, "Please choose a budget range."),
  timeline: z.string().optional(),
  preferredContact: z.enum(["email", "phone", "either"]).default("email"),
  message: z
    .string()
    .min(30, "Please tell us a bit more — at least 30 characters.")
    .max(4000, "Please keep your description under 4,000 characters."),
  consent: z
    .boolean()
    .refine((v) => v === true, {
      message: "Please consent to being contacted about your inquiry.",
    }),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;

// ============================================================
// STEP-LEVEL SCHEMAS — for the wizard's per-step validation
// ============================================================

export const step1Schema = inquirySchema.pick({
  name: true,
  email: true,
  phone: true,
  company: true,
});

export const step2Schema = inquirySchema.pick({
  serviceSlug: true,
  projectType: true,
  budget: true,
  timeline: true,
});

export const step3Schema = inquirySchema.pick({
  location: true,
  message: true,
});

export const step4Schema = inquirySchema.pick({
  preferredContact: true,
  consent: true,
});

export type Step1Values = z.infer<typeof step1Schema>;
export type Step2Values = z.infer<typeof step2Schema>;
export type Step3Values = z.infer<typeof step3Schema>;
export type Step4Values = z.infer<typeof step4Schema>;

// ============================================================
// FORM DEFAULTS
// ============================================================

export const DEFAULT_INQUIRY_VALUES: InquiryFormValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  location: "",
  serviceSlug: "",
  projectType: "",
  budget: "",
  timeline: "",
  preferredContact: "email",
  message: "",
  consent: false as unknown as true,
};

// ============================================================
// INQUIRY FACTORY — turns form values into an Inquiry record
// ============================================================

export function toInquiry(values: InquiryFormValues): Inquiry {
  return {
    id: makeId("inq"),
    name: values.name,
    email: values.email,
    phone: values.phone,
    company: values.company,
    location: values.location,
    serviceSlug: values.serviceSlug,
    projectType: values.projectType,
    budget: values.budget,
    message: values.message,
    preferredContact: values.preferredContact,
    consent: true,
    status: "new",
    createdAt: new Date().toISOString(),
  };
}
