"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Headset, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "@/lib/router";
import { useGlobalSettings } from "@/lib/content-store";

const DISMISS_KEY = "techstar:floating-consultation-dismissed";

export function FloatingConsultation() {
  const globalSettings = useGlobalSettings();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DISMISS_KEY);
      if (!raw) return;
      const at = parseInt(raw, 10);
      const oneDay = 24 * 60 * 60 * 1000;
      if (Date.now() - at < oneDay) {
        setHidden(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // ignore
    }
    setHidden(true);
  };

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          key="floating-consultation"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-4 right-4 z-30"
        >
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Talk to an expert"
                className="group inline-flex items-center gap-2 rounded-full border px-4 py-2.5 shadow-2xl backdrop-blur-md transition-colors hover:border-[var(--accent)]"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent) 14%, var(--surface-2))",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              >
                <Headset
                  className="size-4"
                  style={{ color: "var(--accent-bright)" }}
                  aria-hidden
                />
                <span className="text-sm font-medium">Talk to an expert</span>
                <span
                  className="ml-1 hidden sm:inline-flex size-2 rounded-full animate-pulse-soft"
                  style={{ backgroundColor: "var(--accent-cyan)" }}
                  aria-hidden
                />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="top"
              sideOffset={10}
              className="w-72 p-4"
              style={{
                backgroundColor: "color-mix(in srgb, var(--bg-navy) 96%, transparent)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Talk to an engineer
                  </div>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Tell us about your facility and we will propose a path forward —
                    no automated funnel, no commitment.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={dismiss}
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-md hover:bg-[var(--surface-2)]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </div>
              <div className="mt-3 space-y-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-1.5 rounded-full" style={{ backgroundColor: "var(--accent-cyan)" }} />
                  {globalSettings.contact.email}
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-1.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
                  {globalSettings.contact.phone}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  asChild
                  size="sm"
                  className="flex-1"
                  style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                >
                  <Link to="/contact" className="inline-flex items-center justify-center gap-1">
                    Request consultation
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </Button>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Demo: the multi-step consultation wizard arrives in Phase 2. For now, this routes to the contact page.
              </p>
            </PopoverContent>
          </Popover>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
