"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { Link } from "@/lib/router";
import { useAnnouncement } from "@/lib/content-store";

const DISMISS_KEY_PREFIX = "techstar:announcement-dismissed:";

export function AnnouncementStrip() {
  const announcement = useAnnouncement();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!announcement) {
      setDismissed(true);
      return;
    }
    const key = DISMISS_KEY_PREFIX + announcement.id;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        setDismissed(false);
        return;
      }
      const dismissedAt = parseInt(raw, 10);
      const oneDay = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedAt > oneDay) {
        setDismissed(false);
      } else {
        setDismissed(true);
      }
    } catch {
      setDismissed(false);
    }
  }, [announcement]);

  if (!announcement) return null;

  const onDismiss = () => {
    try {
      window.localStorage.setItem(
        DISMISS_KEY_PREFIX + announcement.id,
        Date.now().toString()
      );
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return (
    <AnimatePresence initial={false}>
      {!dismissed && (
        <motion.div
          key="announcement"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
          role="status"
          aria-live="polite"
        >
          <div
            className="border-b"
            style={{
              backgroundColor: "var(--bg-deep)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-4 sm:px-6 lg:px-8 py-2.5 text-sm">
              <span
                className="hidden sm:inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
                  color: "var(--accent-bright)",
                }}
              >
                Notice
              </span>
              <p
                className="flex-1 truncate"
                style={{ color: "var(--text-secondary)" }}
              >
                <span style={{ color: "var(--text-primary)" }}>{announcement.message}</span>
              </p>
              {announcement.ctaLabel && announcement.ctaHref && (
                <Link
                  to={announcement.ctaHref}
                  className="inline-flex shrink-0 items-center gap-1 font-medium transition-colors hover:text-[var(--accent-bright)]"
                  style={{ color: "var(--accent-bright)" }}
                >
                  <span className="hidden sm:inline">{announcement.ctaLabel}</span>
                  <span className="sm:hidden">Go</span>
                  <ChevronRight className="size-3.5" aria-hidden />
                </Link>
              )}
              <button
                type="button"
                aria-label="Dismiss announcement"
                onClick={onDismiss}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-[var(--surface-2)]"
                style={{ color: "var(--text-muted)" }}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
