"use client";

import { useState } from "react";
import { useRouter } from "@/lib/router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Loader2, Lock, ShieldCheck, X } from "lucide-react";
import { setAdminSession } from "./AdminGuard";
import { Link } from "@/lib/router";
import { toast } from "sonner";

export function LoginPage() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState("admin@techstar.example");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter an email and password");
      return;
    }
    setSubmitting(true);
    // Demo-only simulated latency.
    setTimeout(() => {
      setAdminSession(email);
      toast.success("Signed in", {
        description: "Welcome to the Techstar demo admin.",
      });
      navigate("/admin", { replace: true });
    }, 600);
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg-deep)" }}
    >
      <div
        className="grid-bg pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
      />
      {/* Back-to-public-site close button — top-left */}
      <Link
        to="/"
        aria-label="Back to public site"
        className="absolute left-4 top-4 z-10 inline-flex size-9 items-center justify-center rounded-md border transition-colors hover:bg-[var(--surface-2)]"
        style={{
          borderColor: "var(--border-subtle)",
          color: "var(--text-secondary)",
          backgroundColor: "var(--bg-navy)",
        }}
      >
        <X className="size-4" aria-hidden />
      </Link>

      <div
        className="coordinate-marks relative w-full max-w-md overflow-hidden rounded-xl border"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--bg-navy)",
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo size="sm" showTagline={false} />
            <div>
              <h1
                className="font-display text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Admin access
              </h1>
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                Demo mode — local storage only
              </p>
            </div>
          </div>

          <Card className="mt-5 border-0 p-0 shadow-none">
            <CardHeader className="p-0">
              <CardTitle className="text-base" style={{ color: "var(--text-primary)" }}>
                Sign in
              </CardTitle>
              <CardDescription style={{ color: "var(--text-muted)" }}>
                Demo mode: any credentials will sign you in.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@techstar.example"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-9"
                      required
                    />
                    <Lock
                      className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2"
                      style={{ color: "var(--text-muted)" }}
                      aria-hidden
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="mt-2 w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="size-4" />
                      Sign in
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="p-0 pt-3" />
          </Card>

          <Alert
            className="mt-4"
            style={{
              backgroundColor: "var(--surface-2)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
          >
            <ShieldCheck className="size-4" style={{ color: "var(--accent-bright)" }} />
            <AlertTitle className="text-xs font-semibold">Demo mode</AlertTitle>
            <AlertDescription className="text-[11px] leading-relaxed">
              This is a client-side simulation only. Real authentication requires
              a backend. Do not enter real credentials.
            </AlertDescription>
          </Alert>

          <div className="mt-5 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
              style={{ color: "var(--text-secondary)" }}
            >
              <ArrowLeft className="size-3" />
              Back to public site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
