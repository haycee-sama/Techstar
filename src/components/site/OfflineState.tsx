"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Offline banner — listens to `online`/`offline` events.
 * Auto-dismisses when connectivity returns.
 */
export function OfflineState() {
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
      setOffline(!navigator.onLine);
    }
    const onOnline = () => {
      setOffline(false);
      setDismissed(false);
    };
    const onOffline = () => {
      setOffline(true);
      setDismissed(false);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const retry = () => {
    if (typeof navigator !== "undefined") {
      setOffline(!navigator.onLine);
    }
    // Force a state probe by re-querying; some browsers only update on event
    window.dispatchEvent(new Event("online"));
  };

  return (
    <AnimatePresence>
      {offline && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-1/2 z-40 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2"
          role="alert"
          aria-live="assertive"
        >
          <div
            className="flex items-start gap-3 rounded-lg border p-3 shadow-xl backdrop-blur-md"
            style={{
              backgroundColor: "color-mix(in srgb, var(--warning) 12%, var(--surface-1) 88%)",
              borderColor: "color-mix(in srgb, var(--warning) 35%, transparent)",
            }}
          >
            <WifiOff
              className="mt-0.5 size-5 shrink-0"
              style={{ color: "var(--warning)" }}
              aria-hidden
            />
            <div className="flex-1">
              <p
                className="font-display text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                You appear to be offline
              </p>
              <p
                className="mt-0.5 text-xs leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Some media and dynamic content may not load. Cached pages remain available.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={retry}
                  className="h-7 gap-1.5 border text-xs"
                  style={{ borderColor: "var(--border-strong)" }}
                >
                  <RefreshCw className="size-3" aria-hidden />
                  Retry
                </Button>
              </div>
            </div>
            <button
              type="button"
              aria-label="Dismiss offline notice"
              onClick={() => setDismissed(true)}
              className="inline-flex size-6 items-center justify-center rounded-md hover:bg-[var(--surface-2)]"
              style={{ color: "var(--text-muted)" }}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
