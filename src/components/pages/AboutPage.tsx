"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessagesSquare, Compass, DraftingCompass, Hammer, LifeBuoy, ShieldCheck, FileCheck, Award, Linkedin } from "lucide-react";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { useContent, useTeam } from "@/lib/content-store";
import { CtaBandSection } from "@/components/sections/CtaBandSection";

const MILESTONES = [
  {
    year: "2016",
    title: "Techstar founded",
    body:
      "Techstar starts with a small field engineering crew and one thesis: integrated security, infrastructure, and life-safety systems should be designed, deployed, and operated as one program — not three separate purchases.",
  },
  {
    year: "2018",
    title: "First converged IT/OT deployment",
    body:
      "Techstar completes its first segmented IT/OT network for a multi-building corporate client, putting cameras, controllers, and corporate IT on networks where they actually belong.",
  },
  {
    year: "2020",
    title: "Cybersecurity practice launched",
    body:
      "Recognizing that physical security systems are increasingly attack surface, Techstar stands up a dedicated cybersecurity practice focused on OT/IT convergence for security platforms.",
  },
  {
    year: "2021",
    title: "1,000th device integrated",
    body:
      "Techstar crosses the 1,000-device integration milestone across active programs — a meaningful scale of certified, documented, and operated endpoints under our care.",
  },
  {
    year: "2022",
    title: "Quality management practices formalized",
    body:
      "We formalize our internal quality management practices — documented acceptance checklists, recurring inspection cadences, and an evidence-pack standard for every handover. (We are clear: this is a practice, not a third-party certification.)",
  },
  {
    year: "2023",
    title: "Smart-buildings practice launched",
    body:
      "Techstar launches the smart-buildings practice — converging HVAC, lighting, and amenity control with security and access on documented, boundary-respecting platforms.",
  },
  {
    year: "2024",
    title: "Multi-site operations standardized",
    body:
      "Across our enterprise programs, Techstar standardizes multi-site operations with named owners, recurring tuning cadences, and quarterly business reviews that keep the program honest as the facility changes.",
  },
  {
    year: "Next",
    title: "What is next",
    body:
      "We continue to grow the practice carefully — adding engineering talent in cybersecurity, life-safety, and converged infrastructure, and taking on programs where the integrated thesis actually pays off.",
  },
];

const COMMITMENTS = [
  {
    icon: ShieldCheck,
    title: "Safety, designed in",
    body:
      "Life-safety considerations are designed in from the first conversation — not bolted on after the install. Fail-safe hardware, documented override paths, and tested procedures underlie every system we ship.",
  },
  {
    icon: FileCheck,
    title: "Documentation as a deliverable",
    body:
      "As-builts, device lists, test results, and inspection programs are first-class deliverables — not clean-up after install. The next team should be able to take custody without an archaeology project.",
  },
  {
    icon: Award,
    title: "Quality, not theatre",
    body:
      "We invest in disciplined process — acceptance checklists, recurring inspection cadences, and an evidence-pack standard. We are clear: this is a practice, not a third-party certification.",
  },
];

const PROCESS_STEPS = [
  {
    label: "Discover",
    icon: Compass,
    body:
      "We map your facility, your risks, your operations, and your worst-day assumptions. No inherited spreadsheets, no assumptions about what you already have — we look, we listen, we document.",
    bullets: [
      "Site walk with engineering and operations present",
      "Inventory of existing devices, firmware, and network exposure",
      "Risk model and outcome map aligned to your worst day",
      "Operations tempo study — when is the site actually busy, and when is it empty?",
    ],
  },
  {
    label: "Design",
    icon: DraftingCompass,
    body:
      "Coverage, identity, network, and lifecycle specified as one system. Documentation arrives as part of the design — not as a clean-up after install. You see the system before we build it.",
    bullets: [
      "Coverage and identity specifications tied to your risk model",
      "Network and segmentation plan decided at the cabling layer",
      "Lifecycle and refresh horizon modeled with the budget in mind",
      "Evidence pack scoped at the design — not at the handover",
    ],
  },
  {
    label: "Deploy",
    icon: Hammer,
    body:
      "Certified crews install to documented standards, with acceptance tests against a checklist you keep. Operators trained on real flows, not toy demos — and on the worst day, not the easy one.",
    bullets: [
      "Off-hours and operationally-aware cutover planning",
      "Per-zone acceptance testing against a documented checklist",
      "Operator training on the actual flows your team will execute",
      "As-builts delivered at handover, not at the punch list",
    ],
  },
  {
    label: "Support",
    icon: LifeBuoy,
    body:
      "Preventive maintenance, periodic re-tuning, and quarterly reviews that keep the program honest as your facility changes. The system you accept on day one is not the system you will operate on day 365.",
    bullets: [
      "Named owner with documented escalation paths",
      "Preventive maintenance schedule against actual environment",
      "Quarterly business reviews with documented changes",
      "Annual risk model refresh — your facility changes; so should the design",
    ],
  },
];

export function AboutPage() {
  const reduce = useReducedMotion();
  const { brand } = useContent();
  const teamList = useTeam();

  return (
    <>
      {/* HERO */}
      <section
        aria-label="About Techstar"
        className="relative isolate overflow-hidden"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 78% 20%, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 55%), radial-gradient(ellipse at 12% 80%, color-mix(in srgb, var(--accent-cyan) 14%, transparent) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 coordinate-marks" aria-hidden />

        <div className="mx-auto max-w-[1320px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "About", path: "/about" },
            ]}
          />
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
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
                  About Techstar
                </span>
              </motion.div>
              <h1
                className="mt-6 font-display font-semibold tracking-tight text-balance"
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                  lineHeight: 1.02,
                  color: "var(--text-primary)",
                }}
              >
                Built to protect what&apos;s next.
              </h1>
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 max-w-xl text-pretty"
                style={{
                  fontSize: "1.0625rem",
                  lineHeight: 1.7,
                  color: "var(--text-secondary)",
                }}
              >
                Techstar is an integrated security, infrastructure, and
                intelligence firm. We design, deploy, and operate the systems
                that keep facilities safe, networks honest, and buildings
                intelligent — engineered as one program, documented to the
                drop, and operated against the worst day of your year.
              </motion.p>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <Button
                  asChild
                  size="lg"
                  style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                >
                  <Link to="/contact" className="inline-flex items-center gap-2">
                    <MessagesSquare className="size-4" aria-hidden />
                    Talk to an expert
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  style={{
                    borderColor: "var(--border-strong)",
                    color: "var(--text-primary)",
                    backgroundColor: "transparent",
                  }}
                >
                  <Link to="/services" className="inline-flex items-center gap-2">
                    Explore our solutions
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </motion.div>
            </div>
            <div className="lg:col-span-5">
              <motion.div
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border clip-corner"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-1)",
                }}
                aria-label="Techstar engineering practice"
              >
                <div className="absolute inset-0 grid-bg-fine opacity-40" aria-hidden />
                <div className="absolute inset-0 flex flex-col p-5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    <span>PRACTICE / FIELD</span>
                    <span className="font-mono">v.2024</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                    {[
                      { k: "Domains", v: "8" },
                      { k: "Industries", v: "8" },
                      { k: "Engineers", v: "Field-leading" },
                      { k: "Founded", v: "2016" },
                    ].map((row) => (
                      <div
                        key={row.k}
                        className="rounded border px-2.5 py-1.5"
                        style={{
                          borderColor: "var(--border-subtle)",
                          backgroundColor: "color-mix(in srgb, var(--surface-2) 70%, transparent)",
                        }}
                      >
                        <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {row.k.toUpperCase()}
                        </div>
                        <div style={{ color: "var(--text-primary)" }}>{row.v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <div className="font-display text-lg" style={{ color: "var(--text-primary)" }}>
                      {brand.tagline}
                    </div>
                    <div className="mt-1 text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                      TECHSTAR / {brand.companyName.toUpperCase()}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPANY OVERVIEW */}
      <section
        aria-label="Company overview"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="eyebrow">Overview</div>
              <h2
                className="mt-4 font-display font-semibold tracking-tight text-balance"
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  lineHeight: 1.08,
                  color: "var(--text-primary)",
                }}
              >
                One accountable partner for protection, infrastructure, and intelligence.
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-5">
              {[
                "Techstar was founded on a single thesis: that physical security, network infrastructure, and life-safety systems are too often purchased from three separate vendors, with three separate assumptions about who owns what. The result is gaps — gaps that show up on the worst day of your year, when the gap costs you something you can't get back.",
                "We built Techstar to close those gaps. We design, deploy, and operate eight domains — from perimeter detection and video analytics to structured cabling, fire alarm, access control, cybersecurity, smart-building automation, and managed IT — as one coherent program. Shared identity. Shared network. Shared documentation. One owner you can hold accountable.",
                "We work with corporate, healthcare, education, hospitality, industrial, retail, residential, and public-sector clients. The work ranges from a single building modernization to multi-site enterprise programs. What stays constant is the discipline: documented design, certified install, evidence-pack handover, and a recurring operations cadence that keeps the program honest as your facility changes.",
                "We are clear about what we are and what we are not. We are not a generic security vendor selling parts. We are not a general contractor bolting on cameras. We are engineers, operators, and field crews who treat protection, infrastructure, and intelligence as one practice — because that is the only way the gaps actually close.",
              ].map((p, i) => (
                <motion.p
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="text-pretty"
                  style={{
                    fontSize: "1.0625rem",
                    lineHeight: 1.75,
                    color: "var(--text-secondary)",
                  }}
                >
                  {p}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MISSION / VISION / VALUES */}
      <section
        aria-label="Mission, vision, and values"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="eyebrow">Why we exist</div>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.08,
                color: "var(--text-primary)",
              }}
            >
              Mission. Vision. Values.
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 rounded-xl border p-7"
              style={{
                borderColor: "var(--border-subtle)",
                backgroundColor: "var(--surface-1)",
              }}
            >
              <div className="eyebrow">Mission</div>
              <h3
                className="mt-3 font-display text-2xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Close the gaps that cost you on the worst day.
              </h3>
              <p
                className="mt-4 text-pretty"
                style={{ fontSize: "1rem", lineHeight: 1.75, color: "var(--text-secondary)" }}
              >
                Techstar exists to close the gaps between physical security, network infrastructure, and life-safety systems — the gaps that emerge when three separate vendors ship three separate systems with three separate assumptions about who owns what. We design, deploy, and operate all of it as one program, with one accountable owner, documented to the drop and operated against the worst day of your year. The mission is not the technology. The mission is what the technology, designed and operated well, lets you protect: people, property, operations, and the institutional trust that depends on both.
              </p>
            </motion.div>
            <div className="lg:col-span-5 grid gap-6">
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-xl border p-7"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-1)",
                }}
              >
                <div className="eyebrow">Vision</div>
                <h3
                  className="mt-3 font-display text-xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  A practice where protection, infrastructure, and intelligence are inseparable.
                </h3>
                <p
                  className="mt-3 text-pretty"
                  style={{ fontSize: "0.9375rem", lineHeight: 1.7, color: "var(--text-secondary)" }}
                >
                  Our vision is an industry where integrated security, infrastructure, and intelligence are the default, not the exception — where facility leaders expect a single accountable partner, an evidence-pack handover, and an operations cadence that keeps the system honest as the facility changes. We build toward that future one program at a time, with clients who share the thesis.
                </p>
              </motion.div>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-xl border p-7"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-1)",
                }}
              >
                <div className="eyebrow">Values</div>
                <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {[
                    "Engineering first — the design earns the trust, not the deck.",
                    "Documentation as a deliverable, not a clean-up.",
                    "One accountable owner per program.",
                    "Honest scope — we tell you when we are not the right partner.",
                    "The worst day, designed in from the start.",
                  ].map((v) => (
                    <li key={v} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 inline-flex size-1.5 rounded-full"
                        style={{ backgroundColor: "var(--accent-cyan)" }}
                        aria-hidden
                      />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP PROFILES */}
      <section
        aria-label="Leadership team"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <div className="eyebrow">Leadership</div>
              <h2
                className="mt-4 font-display font-semibold tracking-tight text-balance"
                style={{
                  fontSize: "clamp(1.875rem, 4vw, 3rem)",
                  lineHeight: 1.08,
                  color: "var(--text-primary)",
                }}
              >
                Engineers, operators, and field crews.
              </h2>
              <p
                className="mt-4 text-pretty"
                style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--text-secondary)" }}
              >
                The leadership team leads from the design, the field, and the
                operations center. Bios below are illustrative — sample
                content for proposal purposes.
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teamList.slice(0, 6).map((member, i) => {
              const initials = member.name
                .split(" ")
                .slice(0, 2)
                .map((s) => s.charAt(0).toUpperCase())
                .join("");
              return (
                <motion.article
                  key={member.id}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                  className="group relative flex flex-col overflow-hidden rounded-xl border transition-all hover:-translate-y-0.5"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                  }}
                >
                  {/* Accent bar that animates in on hover */}
                  <div
                    className="h-0.5 w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                    style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-cyan))" }}
                    aria-hidden
                  />
                  {/* Avatar — large initials fallback if no image */}
                  <div className="flex items-start gap-4 p-5">
                    <div
                      className="flex size-14 shrink-0 items-center justify-center rounded-full border font-display text-lg font-semibold"
                      style={{
                        borderColor: "var(--border-strong)",
                        backgroundColor: "color-mix(in srgb, var(--accent) 14%, var(--surface-2))",
                        color: "var(--accent-bright)",
                      }}
                      aria-hidden
                    >
                      {initials}
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-display text-base font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {member.name}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium" style={{ color: "var(--accent-bright)" }}>
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <p
                    className="px-5 pb-5 text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {member.bio}
                  </p>
                  {member.social && member.social.length > 0 && (
                    <div
                      className="flex items-center gap-3 border-t px-5 py-3 text-xs"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
                    >
                      {member.social.map((s) => (
                        <a
                          key={s.id}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--accent-bright)]"
                        >
                          <Linkedin className="size-3.5" aria-hidden />
                          {s.handle || "LinkedIn"}
                          <span className="sr-only"> — opens in new tab (illustrative link)</span>
                        </a>
                      ))}
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* WORK METHODOLOGY */}
      <section
        aria-label="How we work"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="eyebrow">Methodology</div>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.08,
                color: "var(--text-primary)",
              }}
            >
              Four phases. One accountability.
            </h2>
            <p
              className="mt-5 text-pretty"
              style={{ fontSize: "1.0625rem", lineHeight: 1.7, color: "var(--text-secondary)" }}
            >
              We name an owner for each phase and document what was decided,
              what was built, and what was tested. The methodology is the same
              whether your engagement is one building or one hundred.
            </p>
          </div>

          <ol className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.label}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative flex flex-col"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className="relative flex size-12 items-center justify-center rounded-full border"
                      style={{
                        borderColor: "var(--accent)",
                        backgroundColor: "var(--bg-deep)",
                        color: "var(--accent-bright)",
                      }}
                    >
                      <Icon className="size-5" aria-hidden />
                      <span
                        className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full text-[10px] font-mono font-semibold"
                        style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                      >
                        0{i + 1}
                      </span>
                    </div>
                  </div>
                  <h3
                    className="font-display text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {step.label}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {step.body}
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    {step.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <span
                          className="mt-1 inline-flex size-1 rounded-full"
                          style={{ backgroundColor: "var(--accent)" }}
                          aria-hidden
                        />
                        <span style={{ color: "var(--text-secondary)" }}>{b}</span>
                      </li>
                    ))}
                  </ul>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* SAFETY & QUALITY COMMITMENTS */}
      <section
        aria-label="Safety and quality commitments"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-navy)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="eyebrow">Safety & quality</div>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.08,
                color: "var(--text-primary)",
              }}
            >
              What you can hold us to.
            </h2>
            <p
              className="mt-5 text-pretty"
              style={{ fontSize: "1.0625rem", lineHeight: 1.7, color: "var(--text-secondary)" }}
            >
              Three commitments underlie every program — written into the
              scope, not negotiated at the punch list.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {COMMITMENTS.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.title}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="rounded-xl border p-6"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                  }}
                >
                  <div
                    className="flex size-10 items-center justify-center rounded-lg border"
                    style={{
                      borderColor: "var(--accent)",
                      backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
                    }}
                  >
                    <Icon className="size-5" style={{ color: "var(--accent-bright)" }} aria-hidden />
                  </div>
                  <h3
                    className="mt-4 font-display text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {c.title}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {c.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
          <p className="mt-6 text-xs" style={{ color: "var(--text-muted)" }}>
            Note: Techstar applies disciplined quality management practices —
            documented acceptance checklists, recurring inspection cadences,
            and an evidence-pack standard for every handover. We are clear
            that this is a practice, not a third-party certification.
          </p>
        </div>
      </section>

      {/* COMPANY MILESTONES */}
      <section
        aria-label="Company milestones"
        className="py-20 sm:py-24"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="eyebrow">Milestones</div>
            <h2
              className="mt-4 font-display font-semibold tracking-tight text-balance"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.08,
                color: "var(--text-primary)",
              }}
            >
              Eight years. One thesis.
            </h2>
            <p
              className="mt-5 text-pretty"
              style={{ fontSize: "1.0625rem", lineHeight: 1.7, color: "var(--text-secondary)" }}
            >
              We have grown carefully — adding engineering talent and capacity
              without diluting the practice. Milestones below are illustrative —
              sample content for proposal purposes.
            </p>
          </div>

          <ol className="mt-12 relative">
            {/* Vertical line */}
            <motion.div
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-3 top-2 bottom-2 w-px origin-top sm:left-1/2"
              style={{
                background: "linear-gradient(180deg, var(--accent), var(--accent-cyan), var(--border-subtle))",
              }}
              aria-hidden
            />
            {MILESTONES.map((m, i) => {
              const isLeft = i % 2 === 0;
              return (
                <li
                  key={m.year + m.title}
                  className={`relative mb-10 flex flex-col sm:flex-row sm:items-center ${
                    isLeft ? "" : "sm:flex-row-reverse"
                  }`}
                >
                  <div className="hidden sm:block sm:w-1/2" />
                  <div
                    className="absolute left-3 top-1.5 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
                    aria-hidden
                  >
                    <div
                      className="size-2 rounded-full border-2"
                      style={{
                        backgroundColor: "var(--bg-deep)",
                        borderColor: "var(--accent)",
                      }}
                    />
                  </div>
                  <div className={`pl-9 sm:w-1/2 sm:px-8 ${isLeft ? "sm:text-right" : ""}`}>
                    <motion.div
                      initial={reduce ? false : { opacity: 0, x: isLeft ? -12 : 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-10%" }}
                      transition={{ duration: 0.5 }}
                      className="inline-block"
                    >
                      <span
                        className="font-mono text-sm font-semibold"
                        style={{ color: "var(--accent-bright)" }}
                      >
                        {m.year}
                      </span>
                      <h3
                        className="mt-1 font-display text-base font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {m.title}
                      </h3>
                      <p
                        className="mt-2 text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {m.body}
                      </p>
                    </motion.div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <CtaBandSection />
    </>
  );
}
