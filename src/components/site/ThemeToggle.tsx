"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  /**
   * Reserved for future use — kept in the public API so existing call
   * sites don't break. The icon color is now always theme-aware via
   * `--text-secondary` (which is light gray in dark mode, dark gray
   * in light mode — both pass WCAG AA against the hero / page bg).
   */
  forceOverlayColor?: boolean;
}

export function ThemeToggle({ className, forceOverlayColor = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = mounted ? resolvedTheme || theme : "dark";
  void forceOverlayColor; // no-op; kept for API stability.

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${current === "dark" ? "light" : "dark"} theme`}
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className={cn(className)}
      style={{ color: "var(--text-secondary)" }}
    >
      {mounted ? (
        current === "dark" ? (
          <Sun className="size-4" aria-hidden />
        ) : (
          <Moon className="size-4" aria-hidden />
        )
      ) : (
        <span className="size-4" aria-hidden />
      )}
    </Button>
  );
}
