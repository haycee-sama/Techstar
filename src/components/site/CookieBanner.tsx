"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useContentStore } from "@/lib/content-store";

const DECISION_KEY = "techstar:cookie-decision:v1";

export function CookieBanner() {
  const { cookiePrefs, setCookiePrefs } = useContentStore();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [draft, setDraft] = useState(cookiePrefs);

  useEffect(() => {
    // Show banner if no decision yet (after small delay for hydration)
    try {
      const raw = window.localStorage.getItem(DECISION_KEY);
      if (!raw) {
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {
      // ignore
    }
  }, []);

  // Listen for open-cookie-prefs events
  useEffect(() => {
    const onOpen = () => {
      setDraft(cookiePrefs);
      setShowPrefs(false);
      setOpen(true);
    };
    window.addEventListener("techstar:open-cookies", onOpen);
    return () => window.removeEventListener("techstar:open-cookies", onOpen);
  }, [cookiePrefs]);

  const persistDecision = (prefs: typeof cookiePrefs) => {
    setCookiePrefs(prefs);
    try {
      window.localStorage.setItem(DECISION_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
    setVisible(false);
    setOpen(false);
  };

  const acceptAll = () =>
    persistDecision({
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    });

  const rejectNonEssential = () =>
    persistDecision({
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    });

  const savePreferences = () => persistDecision(draft);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            key="cookie-banner"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-3 bottom-3 z-40 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md"
            role="dialog"
            aria-labelledby="cookie-banner-title"
          >
            <div
              className="rounded-xl border p-5 shadow-2xl backdrop-blur-md"
              style={{
                backgroundColor: "color-mix(in srgb, var(--surface-2) 92%, transparent)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <h2
                id="cookie-banner-title"
                className="font-display text-base font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Cookie preferences
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Demo notice: this is a proposal-stage demo site. No real tracking is in place.
                Preferences are stored locally in your browser only.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={acceptAll}
                  style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                >
                  Accept all
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={rejectNonEssential}
                >
                  Reject non-essential
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDraft(cookiePrefs);
                    setShowPrefs(true);
                  }}
                >
                  Manage preferences
                </Button>
              </div>
              {showPrefs && (
                <div className="mt-4 space-y-3 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
                  <PrefRow
                    label="Essential"
                    description="Required for the site to function. Cannot be disabled."
                    checked
                    disabled
                  />
                  <PrefRow
                    label="Functional"
                    description="Theme, layout, and accessibility preferences."
                    checked={draft.functional}
                    onChecked={(v) => setDraft((d) => ({ ...d, functional: v }))}
                  />
                  <PrefRow
                    label="Analytics"
                    description="Aggregated, anonymous usage analytics (illustrative)."
                    checked={draft.analytics}
                    onChecked={(v) => setDraft((d) => ({ ...d, analytics: v }))}
                  />
                  <PrefRow
                    label="Marketing"
                    description="Personalized content and ad measurement (illustrative)."
                    checked={draft.marketing}
                    onChecked={(v) => setDraft((d) => ({ ...d, marketing: v }))}
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button size="sm" onClick={savePreferences} style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                      Save preferences
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Re-open preferences dialog (used from footer) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cookie preferences</DialogTitle>
            <DialogDescription>
              Demo notice — no real tracking is in place. Preferences are stored locally only.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <PrefRow label="Essential" description="Required for site operation." checked disabled />
            <PrefRow
              label="Functional"
              description="Theme, layout, accessibility."
              checked={draft.functional}
              onChecked={(v) => setDraft((d) => ({ ...d, functional: v }))}
            />
            <PrefRow
              label="Analytics"
              description="Anonymous usage (illustrative)."
              checked={draft.analytics}
              onChecked={(v) => setDraft((d) => ({ ...d, analytics: v }))}
            />
            <PrefRow
              label="Marketing"
              description="Personalization (illustrative)."
              checked={draft.marketing}
              onChecked={(v) => setDraft((d) => ({ ...d, marketing: v }))}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={rejectNonEssential}>
              Reject non-essential
            </Button>
            <Button onClick={acceptAll} style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
              Accept all
            </Button>
            <Button onClick={savePreferences} variant="secondary">
              Save preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface PrefRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChecked?: (v: boolean) => void;
}

function PrefRow({ label, description, checked, disabled, onChecked }: PrefRowProps) {
  const id = `pref-${label.toLowerCase()}`;
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChecked?.(v === true)}
        className="mt-0.5"
      />
      <div className="grid gap-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

// Quiet lint about unused DialogTrigger
void DialogTrigger;
