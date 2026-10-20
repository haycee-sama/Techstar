"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  /**
   * Kept for API stability — no longer affects color (the icon is now
   * always theme-aware via next-themes' resolvedTheme).
   */
  forceOverlayColor?: boolean;
}

/**
 * Three-state theme cycle: light → dark → system → light.
 *
 * - Light (Sun icon): always light regardless of OS preference.
 * - Dark (Moon icon): always dark.
 * - System (Monitor icon): follows the OS `prefers-color-scheme`.
 *
 * The cycle starts at "light" because that's the project's default
 * (set in root layout's ThemeProvider). After the first user click,
 * next-themes persists the choice to localStorage so the preference
 * survives refresh.
 *
 * The aria-label is dynamic so screen-reader users know what state
 * they're currently in + what the next click will do.
 */
const CYCLE: Array<{
  theme: "light" | "dark" | "system";
  label: string;
  next: string;
  Icon: typeof Sun;
}> = [
  {
    theme: "light",
    label: "Theme: light. Click for dark.",
    next: "dark",
    Icon: Sun,
  },
  {
    theme: "dark",
    label: "Theme: dark. Click for system.",
    next: "system",
    Icon: Moon,
  },
  {
    theme: "system",
    label: "Theme: system (follows OS). Click for light.",
    next: "light",
    Icon: Monitor,
  },
];

export function ThemeToggle({ className, forceOverlayColor = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  void forceOverlayColor; // kept for API stability, no longer used.

  // Before mount, render a neutral placeholder to avoid hydration
  // mismatch (next-themes can't read localStorage during SSR).
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className={cn(className)}
      >
        <span className="size-4" aria-hidden />
      </Button>
    );
  }

  const current = (theme as typeof CYCLE[number]["theme"] | undefined) || "light";
  const idx = CYCLE.findIndex((c) => c.theme === current);
  const active = idx >= 0 ? CYCLE[idx] : CYCLE[0];
  const { Icon, label } = active;

  // For the icon color: when resolved theme is dark, use light icon
  // (visible on dark surface); when light, use dark icon. This works
  // regardless of whether the user picked light/dark/system — the
  // resolved theme reflects what's actually rendering.
  const iconColor =
    resolvedTheme === "dark" ? "var(--text-secondary)" : "var(--text-secondary)";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={() => setTheme(active.next)}
      className={cn(className)}
      style={{ color: iconColor }}
      title={label}
    >
      <Icon className="size-4" aria-hidden />
    </Button>
  );
}
