"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Link, useRouter } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/brand/Logo";
import { useContent } from "@/lib/content-store";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const { footerLinks, globalSettings, brand } = useContent();
  const { navigate } = useRouter();
  const [email, setEmail] = useState("");

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Demo: newsletter signup is illustrative", {
      description: "No email was actually sent. This is a proposal-stage demo site.",
    });
    setEmail("");
  };

  return (
    <footer
      className="mt-auto border-t"
      style={{
        backgroundColor: "var(--bg-deep)",
        borderColor: "var(--border-subtle)",
      }}
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Brand block */}
          <div className="lg:col-span-4">
            <Logo size="md" showTagline />
            <p
              className="mt-5 max-w-sm text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {brand.shortDescription}
            </p>

            <form onSubmit={onSubscribe} className="mt-6 max-w-sm">
              <label
                htmlFor="footer-newsletter"
                className="eyebrow mb-2 block"
              >
                Stay informed
              </label>
              <div className="flex gap-2">
                <Input
                  id="footer-newsletter"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[var(--surface-1)]"
                  aria-label="Email address for newsletter"
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                >
                  Subscribe
                </Button>
              </div>
              <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                Demo only — no email is actually sent.
              </p>
            </form>
          </div>

          {/* Link groups */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerLinks.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h3 className="eyebrow mb-3">{group.title}</h3>
                <ul className="flex flex-col gap-2">
                  {group.links.map((link) => (
                    <li key={link.label + link.href}>
                      {link.href.startsWith("#cookie-preferences") ? (
                        <button
                          type="button"
                          className="text-left text-sm transition-colors hover:text-[var(--accent-bright)]"
                          style={{ color: "var(--text-secondary)" }}
                          onClick={() =>
                            window.dispatchEvent(new CustomEvent("techstar:open-cookies"))
                          }
                        >
                          {link.label}
                        </button>
                      ) : (
                        <Link
                          to={link.href}
                          className="text-sm transition-colors hover:text-[var(--accent-bright)]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* Contact block */}
          <div className="lg:col-span-3">
            <h3 className="eyebrow mb-3">Contact</h3>
            <ul className="flex flex-col gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              <li className="flex items-start gap-2.5">
                <Mail className="size-4 mt-0.5 shrink-0" style={{ color: "var(--accent-bright)" }} aria-hidden />
                <a
                  href={`mailto:${globalSettings.contact.email}`}
                  className="hover:text-[var(--accent-bright)] transition-colors"
                >
                  {globalSettings.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="size-4 mt-0.5 shrink-0" style={{ color: "var(--accent-bright)" }} aria-hidden />
                <span>{globalSettings.contact.phone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="size-4 mt-0.5 shrink-0" style={{ color: "var(--accent-bright)" }} aria-hidden />
                <span className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {globalSettings.contact.addressSample}
                </span>
              </li>
            </ul>
            <div className="mt-5 flex items-center gap-2">
              {globalSettings.socials.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.platform} (illustrative, demo link)`}
                  className="inline-flex size-8 items-center justify-center rounded-md border transition-colors hover:border-[var(--accent)]"
                  style={{
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div
          className="mt-12 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-4" style={{ color: "var(--text-muted)" }}>
            <span>© {new Date().getFullYear()} Techstar. All rights reserved.</span>
            <span className="hidden sm:inline" aria-hidden>·</span>
            <span>Demo site — sample content for proposal purposes.</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link
              to="/privacy"
              className="transition-colors hover:text-[var(--accent-bright)]"
              style={{ color: "var(--text-muted)" }}
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="transition-colors hover:text-[var(--accent-bright)]"
              style={{ color: "var(--text-muted)" }}
            >
              Terms
            </Link>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="inline-flex items-center gap-1 font-medium transition-colors hover:text-[var(--accent-bright)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Admin
              <ArrowUpRight className="size-3" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "linkedin":
      return <span className="text-xs font-semibold">in</span>;
    case "twitter":
      return <span className="text-xs font-semibold">X</span>;
    case "youtube":
      return <span className="text-xs font-semibold">▶</span>;
    default:
      return <span className="text-xs font-semibold">{platform.slice(0, 2)}</span>;
  }
}
