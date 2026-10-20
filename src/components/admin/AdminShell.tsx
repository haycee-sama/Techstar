"use client";

import { type ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { AdminGuard } from "./AdminGuard";
import { CommandPaletteMount } from "@/components/site/CommandPalette";

/**
 * Admin shell — sidebar + topbar + content area. Wraps every admin route
 * (except `/admin/login`). The AdminGuard ensures the user has a session
 * before any chrome renders, redirecting to the login page otherwise.
 *
 * Uses shadcn SidebarProvider so the desktop rail and mobile sheet share
 * state (and the ⌘B keyboard shortcut).
 *
 * The global CommandPalette is mounted inside the admin shell so ⌘K and
 * the topbar's "Quick actions" button both open it while in admin — the
 * palette auto-extends with admin quick actions (Go to dashboard, Sign out,
 * Toggle theme, Reset demo data) when an admin session is present.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "4rem",
            "--sidebar-width-mobile": "18rem",
          } as React.CSSProperties
        }
      >
        <AdminSidebar />
        <SidebarInset className="min-h-svh">
          <AdminTopbar />
          <main
            className="flex-1 p-4 sm:p-6"
            style={{ backgroundColor: "var(--bg-deep)" }}
          >
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
      <CommandPaletteMount />
    </AdminGuard>
  );
}
