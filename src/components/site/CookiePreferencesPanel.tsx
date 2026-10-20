"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useContentStore } from "@/lib/content-store";
import type { CookiePreferences } from "@/lib/types";
import { toast } from "sonner";

interface CookiePreferencesPanelProps {
  /** Layout variant: "page" for full page, "dialog" for compact modal */
  variant?: "page" | "dialog";
  /** When true, show inline saved-indicator + toast */
  showFeedback?: boolean;
  className?: string;
}

/**
 * Shared cookie preferences panel used by both the CookieBanner dialog
 * and the dedicated /#cookie-preferences page.
 */
export function CookiePreferencesPanel({
  variant = "page",
  showFeedback = true,
  className = "",
}: CookiePreferencesPanelProps) {
  const { cookiePrefs, setCookiePrefs } = useContentStore();
  const [draft, setDraft] = useState<CookiePreferences>(cookiePrefs);
  const [savedAt, setSavedAt] = useState<string | null>(cookiePrefs.savedAt ?? null);

  useEffect(() => {
    setDraft(cookiePrefs);
    if (cookiePrefs.savedAt) setSavedAt(cookiePrefs.savedAt);
  }, [cookiePrefs]);

  const update = (key: keyof CookiePreferences, value: boolean) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const acceptAll = () => {
    const all: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
      savedAt: new Date().toISOString(),
    };
    setCookiePrefs(all);
    setDraft(all);
    setSavedAt(all.savedAt!);
    if (showFeedback) toast.success("All cookies accepted.");
    persistDecision(all);
  };

  const rejectNonEssential = () => {
    const minimal: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
      savedAt: new Date().toISOString(),
    };
    setCookiePrefs(minimal);
    setDraft(minimal);
    setSavedAt(minimal.savedAt!);
    if (showFeedback) toast.success("Non-essential cookies rejected.");
    persistDecision(minimal);
  };

  const savePreferences = () => {
    const next: CookiePreferences = {
      ...draft,
      essential: true,
      savedAt: new Date().toISOString(),
    };
    setCookiePrefs(next);
    setDraft(next);
    setSavedAt(next.savedAt!);
    if (showFeedback) toast.success("Your cookie preferences have been saved.");
    persistDecision(next);
  };

  const persistDecision = (prefs: CookiePreferences) => {
    try {
      window.localStorage.setItem(
        "techstar:cookie-decision:v1",
        JSON.stringify(prefs)
      );
    } catch {
      // ignore
    }
  };

  const isCompact = variant === "dialog";

  return (
    <div className={className}>
      <div
        className={`space-y-3 ${isCompact ? "" : "rounded-xl border p-5"}`}
        style={
          isCompact
            ? undefined
            : {
                backgroundColor: "var(--surface-1)",
                borderColor: "var(--border-subtle)",
              }
        }
      >
        <PrefRow
          label="Essential"
          description="Required for the site to function (session, security). Cannot be disabled."
          checked
          disabled
        />
        <PrefRow
          label="Functional"
          description="Theme, layout, and accessibility preferences."
          checked={draft.functional}
          onChecked={(v) => update("functional", v)}
        />
        <PrefRow
          label="Analytics"
          description="Aggregated, anonymous usage analytics (illustrative)."
          checked={draft.analytics}
          onChecked={(v) => update("analytics", v)}
        />
        <PrefRow
          label="Marketing"
          description="Personalized content and ad measurement (illustrative)."
          checked={draft.marketing}
          onChecked={(v) => update("marketing", v)}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button
          onClick={savePreferences}
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
        >
          Save preferences
        </Button>
        <Button variant="outline" onClick={acceptAll}>
          Accept all
        </Button>
        <Button variant="ghost" onClick={rejectNonEssential}>
          Reject non-essential
        </Button>
        {savedAt && (
          <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>
            Last saved: {new Date(savedAt).toLocaleString()}
          </span>
        )}
      </div>
    </div>
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
  const id = `pref-${label.toLowerCase().replace(/\s+/g, "-")}`;
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
