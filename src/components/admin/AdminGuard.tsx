"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@/lib/router";

const SESSION_KEY = "techstar:admin:session";

export interface AdminSession {
  email: string;
  loggedInAt: string;
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed.email || !parsed.loggedInAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setAdminSession(email: string): AdminSession {
  const session: AdminSession = { email, loggedInAt: new Date().toISOString() };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Notify listeners (other components) that session changed
  window.dispatchEvent(new CustomEvent("techstar:admin:session-change"));
  return session;
}

export function clearAdminSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent("techstar:admin:session-change"));
}

/**
 * Wraps every admin route (except `#/admin/login`). Reads session from
 * `localStorage["techstar:admin:session"]`. If not present, redirects to
 * `#/admin/login`. Renders children otherwise.
 *
 * Listens for session-change events so the login redirect fires immediately
 * when the user logs out from the topbar profile menu.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { navigate } = useRouter();
  const [session, setSession] = useState<AdminSession | null>(() =>
    typeof window === "undefined" ? null : getAdminSession()
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setSession(getAdminSession());
    const onChange = () => setSession(getAdminSession());
    window.addEventListener("techstar:admin:session-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("techstar:admin:session-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      navigate("/admin/login", { replace: true });
    }
  }, [hydrated, session, navigate]);

  if (!hydrated || !session) {
    // Render nothing — the redirect effect will fire on the next tick.
    return null;
  }

  return <>{children}</>;
}

export const ADMIN_SESSION_KEY = SESSION_KEY;
