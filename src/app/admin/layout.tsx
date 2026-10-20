"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { CommandPaletteMount } from "@/components/site/CommandPalette";

/**
 * Admin layout — wraps every `/admin/*` route. The login page at
 * `/admin/login` is a standalone full-screen route (no shell, no guard).
 * Every other admin route is wrapped in `<AdminShell>` which internally
 * mounts `<AdminGuard>` (redirects to /admin/login when no session) +
 * the sidebar/topbar chrome + the command palette.
 *
 * This file is a client component because it uses `usePathname()` to
 * discriminate the login route. Next.js still allows server-rendered
 * children (the actual page.tsx files) to be passed through; this
 * layout just adds the chrome conditionally.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    // Login page: render bare (no shell, no guard, no command palette).
    // LoginPage component handles its own full-screen chrome.
    return <>{children}</>;
  }

  return (
    <>
      <AdminShell>{children}</AdminShell>
      <CommandPaletteMount />
    </>
  );
}
