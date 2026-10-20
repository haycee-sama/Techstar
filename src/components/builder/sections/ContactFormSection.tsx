"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
import { toast } from "sonner";
import { useServices } from "@/lib/content-store";

interface ContactFormSectionData {
  heading?: string;
  body?: string;
  submitLabel?: string;
}

export function ContactFormSection({ data }: { data: ContactFormSectionData }) {
  const reduce = useReducedMotion();
  const services = useServices();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    // Demo only: simulate latency, then toast success.
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    toast.success("Inquiry received (demo) — we'll be in touch within one business day.");
    (e.currentTarget as HTMLFormElement).reset();
  }

  return (
    <section className="relative py-16 sm:py-20" style={{ backgroundColor: "var(--bg-navy)" }}>
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center"
        >
          {data.heading ? <div className="eyebrow">Contact</div> : null}
          {data.heading ? (
            <h2
              className="mt-3 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.05,
                color: "var(--text-primary)",
              }}
            >
              {data.heading}
            </h2>
          ) : null}
          {data.body ? (
            <p
              className="mt-4 max-w-md text-pretty"
              style={{ fontSize: "1rem", lineHeight: 1.65, color: "var(--text-secondary)" }}
            >
              {data.body}
            </p>
          ) : null}
          <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
            Demo notice — submissions stay in your browser. No email is sent.
          </p>
        </motion.div>

        <motion.form
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={onSubmit}
          className="rounded-xl border p-6"
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--surface-1)",
          }}
        >
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="cf-name">Full name</Label>
              <Input id="cf-name" name="name" required placeholder="Jane Doe" autoComplete="name" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cf-email">Email</Label>
              <Input id="cf-email" name="email" type="email" required placeholder="jane@example.com" autoComplete="email" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cf-phone">Phone</Label>
              <Input id="cf-phone" name="phone" type="tel" placeholder="+1 (555) 010-0000" autoComplete="tel" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cf-service">Service of interest</Label>
              <Select name="serviceSlug">
                <SelectTrigger id="cf-service">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.slug} value={s.slug}>{s.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cf-message">Project description</Label>
              <Textarea id="cf-message" name="message" required rows={4} placeholder="Tell us about your project…" />
            </div>
            <Button type="submit" disabled={submitting} className="mt-1">
              {submitting ? "Sending…" : data.submitLabel || "Send message"}
            </Button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
