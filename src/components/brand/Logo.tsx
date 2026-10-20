"use client";

import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  size?: LogoSize;
  showWordmark?: boolean;
  showTagline?: boolean;
  className?: string;
}

const DIMENSIONS: Record<LogoSize, { mark: number; wordmark: string; tagline: string }> = {
  sm: { mark: 22, wordmark: "text-base", tagline: "text-[8px]" },
  md: { mark: 28, wordmark: "text-lg", tagline: "text-[9px]" },
  lg: { mark: 40, wordmark: "text-2xl", tagline: "text-[10px]" },
};

export function Logo({
  size = "md",
  showWordmark = true,
  showTagline = false,
  className,
}: LogoProps) {
  const dim = DIMENSIONS[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <LogoMark size={dim.mark} />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display font-bold tracking-tight",
              dim.wordmark
            )}
          >
            <span style={{ color: "var(--text-primary)" }}>TECH</span>
            <span style={{ color: "var(--accent-bright)" }}>STAR</span>
          </span>
          {showTagline && (
            <span
              className={cn(
                "font-sans mt-1 uppercase tracking-[0.28em]",
                dim.tagline
              )}
              style={{ color: "var(--text-muted)" }}
            >
              Security. Infrastructure. Intelligence.
            </span>
          )}
        </span>
      )}
    </span>
  );
}

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 28, className }: LogoMarkProps) {
  const gradientId = "techstar-mark-grad";
  const strokeId = "techstar-mark-stroke";
  const fillRef = `url(#${gradientId})`;
  const strokeRef = `url(#${strokeId})`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Techstar logo mark"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id={strokeId} x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      {/* Outer hex shield shape */}
      <path
        d="M24 1.5 L43.5 12.75 V35.25 L24 46.5 L4.5 35.25 V12.75 Z"
        fill={fillRef}
        stroke={strokeRef}
        strokeWidth="1.25"
        strokeOpacity="0.55"
      />
      {/* Carved "T" + arrow form */}
      <path
        d="M14 18 H34 M24 18 V34 M19 22 L24 28 L29 22"
        stroke="#0A0F1F"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Center accent dot */}
      <circle cx="24" cy="34.5" r="1.6" fill="#0A0F1F" />
    </svg>
  );
}
