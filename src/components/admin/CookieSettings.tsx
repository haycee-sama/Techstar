"use client";

import { useEffect, useState } from "react";
import { Cookie as CookieIcon, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AdminTableHeader } from "./AdminTableHeader";
import {
  useContentStore,
  useGlobalSettings,
} from "@/lib/content-store";
import type { CookiePreferences } from "@/lib/types";

const DEFAULT_COOKIE_TEXT =
  "Demo notice: This is a proposal-stage demo site. Cookie preferences are illustrative and stored locally only.";

export function CookieSettings() {
  const global = useGlobalSettings();
  const { updateGlobalSettings, cookiePrefs, setCookiePrefs } = useContentStore();

  const [cookieText, setCookieText] = useState(global.cookieText);
  const [learnMoreHref, setLearnMoreHref] = useState("#/cookie-preferences");
  const [consentDays, setConsentDays] = useState("365");
  const [prefs, setPrefs] = useState<CookiePreferences>(cookiePrefs);

  useEffect(() => {
    setCookieText(global.cookieText);
  }, [global.cookieText]);

  useEffect(() => {
    setPrefs(cookiePrefs);
  }, [cookiePrefs]);

  function save() {
    updateGlobalSettings({ cookieText });
    setCookiePrefs(prefs);
    try {
      window.localStorage.setItem("techstar:cookie:learn-more", learnMoreHref);
      window.localStorage.setItem("techstar:cookie:consent-days", consentDays);
    } catch {
      // ignore
    }
    toast.success("Cookie settings saved.");
  }

  return (
    <div>
      <AdminTableHeader
        title="Cookie settings"
        description="Banner copy and default consent preferences. Stored to localStorage — the public banner reads from the same source."
        icon={<CookieIcon className="size-4" />}
        actions={
          <Button size="sm" onClick={save}>
            <Save className="size-3.5" />
            Save
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Banner copy</CardTitle>
              <CardDescription>
                Shown at the top of the public site until the visitor accepts or opens preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="cookie-text" className="text-xs">Banner text</Label>
                <Input
                  id="cookie-text"
                  value={cookieText}
                  onChange={(e) => setCookieText(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cookie-learn-more" className="text-xs">"Learn more" link</Label>
                <Input
                  id="cookie-learn-more"
                  value={learnMoreHref}
                  onChange={(e) => setLearnMoreHref(e.target.value)}
                  placeholder="#/cookie-preferences"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cookie-days" className="text-xs">Consent expiry (days)</Label>
                <Input
                  id="cookie-days"
                  type="number"
                  value={consentDays}
                  onChange={(e) => setConsentDays(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Default preferences</CardTitle>
              <CardDescription>
                Pre-checked options on the cookie banner. Necessary is always on.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <CookieRow
                label="Necessary"
                description="Required for the site to function."
                checked={true}
                disabled
              />
              <CookieRow
                label="Analytics"
                description="Understand how the site is used."
                checked={prefs.analytics}
                onChange={(checked) => setPrefs({ ...prefs, analytics: checked })}
              />
              <CookieRow
                label="Marketing"
                description="Personalize content and ads."
                checked={prefs.marketing}
                onChange={(checked) => setPrefs({ ...prefs, marketing: checked })}
              />
              <CookieRow
                label="Functional"
                description="Power interactive features (saved preferences, etc.)."
                checked={prefs.functional}
                onChange={(checked) => setPrefs({ ...prefs, functional: checked })}
              />
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Live preview</CardTitle>
              <CardDescription>
                How the cookie banner will appear on the public site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-md border p-3 text-xs"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-2)",
                  color: "var(--text-primary)",
                }}
              >
                <p className="mb-2">{cookieText || DEFAULT_COOKIE_TEXT}</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => toast.success("Demo: visitor accepted.")}>
                    Accept all
                  </Button>
                  <a
                    href={learnMoreHref}
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("Demo: opening cookie preferences page.");
                    }}
                    className="text-[11px] underline"
                    style={{ color: "var(--accent-bright)" }}
                  >
                    Learn more
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function CookieRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-md border px-3 py-2"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
          {label}
          {disabled ? (
            <span className="ml-2 text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>
              Always on
            </span>
          ) : null}
        </p>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange?.(v)}
        aria-label={label}
      />
    </div>
  );
}
