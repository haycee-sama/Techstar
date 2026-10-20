"use client";

import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/brand/Logo";
import { Link, useRouter } from "@/lib/router";
import { ADMIN_NAV_GROUPS } from "./nav-config";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Admin sidebar — desktop rail + mobile sheet. Uses the shadcn Sidebar
 * primitive (so it inherits keyboard shortcuts + ARIA). Items are grouped
 * per the Phase 3a brief: Content / Communication / Configuration / System.
 *
 * Active state is derived from the current hash-route prefix so nested
 * routes (e.g. `/admin/pages/about`) also highlight the parent item.
 */
export function AdminSidebar() {
  const { parsed } = useRouter();
  const currentPath = parsed.path;

  return (
    <SidebarRoot collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader
        className="border-b"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <Link
          to="/admin"
          className="flex h-14 items-center gap-2 px-3 transition-colors hover:opacity-90"
          aria-label="Techstar admin home"
        >
          <Logo size="sm" showWordmark={false} />
          <div className="flex flex-col leading-none">
            <span
              className="font-display text-sm font-bold tracking-tight"
              style={{ color: "var(--sidebar-foreground)" }}
            >
              TECHSTAR<span style={{ color: "var(--accent-bright)" }}> ADMIN</span>
            </span>
            <span
              className="text-[9px] uppercase tracking-[0.2em]"
              style={{ color: "var(--text-muted)" }}
            >
              Content console
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        {ADMIN_NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.to === "/admin"
                      ? currentPath === "/admin"
                      : currentPath === item.to ||
                        currentPath.startsWith(item.to + "/");
                  const disabled = !!item.disabled;

                  const inner = (
                    <>
                      <Icon className="size-4" aria-hidden />
                      <span className="truncate">{item.label}</span>
                      {disabled ? (
                        <Badge
                          variant="outline"
                          className="ml-auto px-1.5 py-0 text-[9px] font-normal uppercase tracking-wide"
                          style={{
                            color: "var(--text-muted)",
                            borderColor: "var(--border-subtle)",
                          }}
                        >
                          {item.hint ?? "Soon"}
                        </Badge>
                      ) : null}
                    </>
                  );

                  return (
                    <SidebarMenuItem key={item.to}>
                      {disabled ? (
                        <SidebarMenuButton
                          isActive={false}
                          tooltip={item.label}
                          aria-disabled
                          className="pointer-events-none opacity-50"
                          asChild
                        >
                          <span tabIndex={-1} aria-disabled>
                            {inner}
                          </span>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.label}
                          asChild
                        >
                          <Link
                            to={item.to}
                            aria-current={isActive ? "page" : undefined}
                          >
                            {inner}
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
      <SidebarFooter
        className="border-t"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarCollapseToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarRoot>
  );
}

function SidebarCollapseToggle() {
  const { state, toggleSidebar, isMobile } = useSidebar();
  if (isMobile) return null;
  const collapsed = state === "collapsed";
  return (
    <SidebarMenuButton
      isActive={false}
      tooltip={collapsed ? "Expand" : "Collapse"}
      onClick={toggleSidebar}
    >
      {collapsed ? (
        <PanelLeftOpen className="size-4" aria-hidden />
      ) : (
        <PanelLeftClose className="size-4" aria-hidden />
      )}
      <span>{collapsed ? "Expand" : "Collapse"}</span>
    </SidebarMenuButton>
  );
}
