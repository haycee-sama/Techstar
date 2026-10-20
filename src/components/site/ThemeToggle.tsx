"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  /**
   * When true, the toggle sits over a dark cinematic hero image in BOTH
   * themes — force the icon to a near-white color so it stays visible
   * in light mode too (otherwise dark navy icon on dark photo = invisible).
   */
  forceOverlayColor?: boolean;
}

export function ThemeToggle({ className, forceOverlayColor = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = mounted ? resolvedTheme || theme : "dark";

  const iconColor = forceOverlayColor
    ? "var(--text-on-dark-overlay-secondary)"
    : "var(--text-secondary)";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${current === "dark" ? "light" : "dark"} theme`}
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className={cn(className)}
      style={{ color: iconColor }}
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
