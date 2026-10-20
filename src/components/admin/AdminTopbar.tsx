"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter, Link } from "@/lib/router";
import { clearAdminSession, getAdminSession } from "./AdminGuard";
import { NotificationsPanel } from "./NotificationsPanel";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Keyboard, LogOut, Search, User } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/site/ThemeToggle";

const ADMIN_THEME_KEY = "techstar:admin:theme";
const PUBLIC_THEME_BACKUP_KEY = "techstar:public:theme-backup";

/**
 * Admin top bar. Layout: left = mobile menu trigger + breadcrumbs;
 * center = command-palette trigger button; right = notifications bell,
 * theme toggle, profile dropdown.
 *
 * Theme transition: when the admin shell mounts, the user's current
 * (public-site) theme is captured to `techstar:public:theme-backup` and the
 * theme is switched to the admin's preferred theme (default light, persisted
 * to `techstar:admin:theme`). When the admin shell unmounts (user navigates
 * back to the public site), the captured theme is restored so the dark
 * public default re-applies automatically.
 */
export function AdminTopbar() {
  const { navigate } = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [session, setSession] = useState<{ email: string } | null>(null);

  useEffect(() => {
    setSession(getAdminSession());

    // Capture the public-site theme on first admin entry so we can restore it
    // when the user leaves admin. We snapshot whatever next-themes currently
    // has persisted (or fall back to the resolved theme, or dark).
    let publicTheme: string | null = null;
    try {
      publicTheme = window.localStorage.getItem("theme");
    } catch {
      // ignore
    }
    if (!publicTheme) publicTheme = resolvedTheme ?? "light";
    window.localStorage.setItem(PUBLIC_THEME_BACKUP_KEY, publicTheme);

    // Apply the admin's preferred theme (default light on first visit).
    const storedAdmin = window.localStorage.getItem(ADMIN_THEME_KEY);
    const adminTheme = storedAdmin ?? "light";
    setTheme(adminTheme);
    if (!storedAdmin) {
      window.localStorage.setItem(ADMIN_THEME_KEY, adminTheme);
    }

    // Restore the public-site theme when leaving admin.
    return () => {
      try {
        const restoreTo = window.localStorage.getItem(PUBLIC_THEME_BACKUP_KEY) ?? "light";
        setTheme(restoreTo);
        window.localStorage.removeItem(PUBLIC_THEME_BACKUP_KEY);
      } catch {
        // ignore
      }
    };
  }, [setTheme, resolvedTheme]);

  function openCommand() {
    window.dispatchEvent(new CustomEvent("techstar:open-command"));
  }

  function logout() {
    clearAdminSession();
    toast.success("Signed out");
    navigate("/admin/login", { replace: true });
  }

  const initials = session?.email
    ? session.email.slice(0, 2).toUpperCase()
    : "AD";

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-3"
      style={{
        backgroundColor: "var(--background)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <SidebarTrigger className="md:hidden" />
      <AdminBreadcrumbs />

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="hidden h-9 gap-2 px-2 sm:flex"
          onClick={openCommand}
          aria-label="Open command palette"
        >
          <Search className="size-3.5" style={{ color: "var(--text-muted)" }} aria-hidden />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Quick actions
          </span>
          <kbd
            className="ml-1 hidden rounded border px-1 text-[10px] sm:inline"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--text-muted)",
            }}
          >
            ⌘K
          </kbd>
        </Button>

        <DemoChip />

        <ThemeToggle />

        <NotificationsPanel />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex h-9 items-center gap-2 pl-1 pr-2"
              aria-label="Admin profile menu"
            >
              <Avatar className="size-6 rounded-md">
                <AvatarFallback
                  className="rounded-md text-[10px] font-semibold"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs sm:inline" style={{ color: "var(--text-secondary)" }}>
                Demo admin
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-xs">Demo admin user</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {session?.email ?? "admin@techstar.example"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin" className="cursor-pointer">
                <User className="size-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openCommand} className="cursor-pointer">
              <Keyboard className="size-4" />
              Command palette
              <kbd
                className="ml-auto rounded border px-1 text-[10px]"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
              >
                ⌘K
              </kbd>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-[var(--danger)] focus:text-[var(--danger)]">
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function DemoChip() {
  return (
    <span
      className="hidden items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide md:inline-flex"
      style={{
        borderColor: "var(--border-subtle)",
        color: "var(--text-muted)",
      }}
      title="Demo mode — local storage only"
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: "var(--warning)" }}
        aria-hidden
      />
      Demo mode
    </span>
  );
}
