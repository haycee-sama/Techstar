"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Dot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export interface AdminNotification {
  id: string;
  title: string;
  body?: string;
  time: string;
  href?: string;
  read?: boolean;
  tone?: "default" | "warning" | "info";
}

const STORAGE_KEY = "techstar:admin:notifications";

export const DEFAULT_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "n1",
    title: "3 new inquiries",
    body: "Three consultation requests submitted in the last 24 hours (illustrative).",
    time: "2h ago",
    href: "/admin/inquiries",
    tone: "info",
  },
  {
    id: "n2",
    title: "Draft pages: 2 unpublished",
    body: "Two pages are still in draft status — ready to publish?",
    time: "5h ago",
    href: "/admin/pages",
    tone: "warning",
  },
  {
    id: "n3",
    title: "Sample analytics refreshed",
    body: "Demo traffic data has been regenerated for today (illustrative).",
    time: "1d ago",
    tone: "default",
  },
];

function loadNotifications(): AdminNotification[] {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATIONS;
    const parsed = JSON.parse(raw) as AdminNotification[];
    if (!Array.isArray(parsed)) return DEFAULT_NOTIFICATIONS;
    return parsed;
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

function saveNotifications(items: AdminNotification[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Topbar bell + popover listing admin notifications. Sample data is clearly
 * labeled illustrative. "Mark all as read" persists to localStorage.
 */
export function NotificationsPanel() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setItems(loadNotifications());
  }, []);

  const unread = items.filter((n) => !n.read).length;

  function markAllRead() {
    const next = items.map((n) => ({ ...n, read: true }));
    setItems(next);
    saveNotifications(next);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9"
          aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
        >
          <Bell className="size-4" aria-hidden />
          {unread > 0 ? (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
              style={{ backgroundColor: "var(--danger)" }}
              aria-hidden
            >
              {unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
        style={{
          backgroundColor: "var(--popover)",
          color: "var(--popover-foreground)",
        }}
      >
        <div className="flex items-center justify-between border-b px-3 py-2"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <p className="text-sm font-semibold">Notifications</p>
          <span className="text-[10px] uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Illustrative
          </span>
        </div>
        <ScrollArea className="max-h-[300px]">
          <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {items.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                No notifications
              </li>
            ) : (
              items.map((n) => {
                const tone =
                  n.tone === "warning"
                    ? "var(--warning)"
                    : n.tone === "info"
                    ? "var(--accent-bright)"
                    : "var(--text-muted)";
                return (
                  <li key={n.id} className="px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <span
                        className="mt-1 size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: tone }}
                        aria-hidden
                      />
                      <div className="flex-1">
                        <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                          {n.title}
                        </p>
                        {n.body ? (
                          <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                            {n.body}
                          </p>
                        ) : null}
                        <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {n.time}
                        </p>
                      </div>
                      {n.read ? null : <Dot className="size-4" style={{ color: "var(--accent-bright)" }} />}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </ScrollArea>
        <Separator />
        <div className="flex items-center justify-between p-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={markAllRead}
            disabled={unread === 0}
          >
            <Check className="size-3" />
            Mark all as read
          </Button>
          <Button variant="link" size="sm" className="h-7 text-xs" asChild>
            <a href="#/admin">View all</a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
