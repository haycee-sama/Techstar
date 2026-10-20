"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

interface NetworkGlobeProps {
  /** Width in px (default 480) */
  width?: number;
  /** Height in px (default 480) */
  height?: number;
  /** Show the constellation ring */
  showRing?: boolean;
  className?: string;
}

/**
 * Interactive network globe — CSS/SVG only (no Three.js).
 * Renders a stylized rotating globe with lat/long lines and animated
 * dots traveling along great-circle paths.
 *
 * Honors prefers-reduced-motion: shows static fallback.
 */
export function NetworkGlobe({
  width = 480,
  height = 480,
  showRing = true,
  className = "",
}: NetworkGlobeProps) {
  const reduce = useReducedMotion();

  // Pre-compute lat/long grid lines
  const { longitudes, latitudes } = useMemo(() => {
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) / 2 - 12;

    // Longitudes (meridians) — vertical ellipses that "tilt" by longitude
    const longitudes = Array.from({ length: 9 }).map((_, i) => {
      const angle = (i / 9) * Math.PI; // 0..PI
      const rx = Math.max(2, Math.abs(Math.cos(angle)) * r);
      return { rx, ry: r, cx, cy };
    });

    // Latitudes — horizontal ellipses at decreasing radius going to poles
    const latitudes = Array.from({ length: 7 }).map((_, i) => {
      const angle = (i / 6 - 0.5) * Math.PI; // -PI/2..PI/2
      const ry = Math.max(2, Math.cos(angle) * r);
      const cyL = cy + Math.sin(angle) * r;
      return { rx: r, ry, cx, cy: cyL };
    });

    return { longitudes, latitudes };
  }, [width, height]);

  // Traveling arc paths between two points on the sphere surface
  const arcs = useMemo(() => {
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) / 2 - 12;

    const pts = [
      { label: "HQ", lat: 0.45, long: 0.1 },
      { label: "PAC", lat: 0.2, long: 0.95 },
      { label: "EU", lat: 0.55, long: 0.5 },
      { label: "ASIA", lat: 0.05, long: 0.7 },
      { label: "SAM", lat: -0.15, long: 0.3 },
      { label: "AFR", lat: -0.05, long: 0.55 },
    ];

    // Project lat/long (0..1) into x,y on the visible hemisphere
    const project = (p: { lat: number; long: number }) => {
      const phi = (0.5 - p.lat) * Math.PI; // latitude angle
      const theta = (p.long - 0.5) * 2 * Math.PI; // longitude angle
      // Only show points on the visible hemisphere
      const x = cx + r * Math.cos(phi) * Math.sin(theta);
      const y = cy + r * Math.sin(phi);
      // Compute a z-depth for fading (visible if cos(theta) > 0 roughly)
      const visible = Math.cos(theta) >= -0.05;
      return { x, y, visible, phi, theta };
    };

    const points = pts.map((p) => ({ ...p, ...project(p) }));

    // Pair HQ to each other point
    const hq = points[0];
    const arcs = points.slice(1).map((p, i) => {
      const mx = (hq.x + p.x) / 2;
      const my = Math.min(hq.y, p.y) - 60 - (i % 3) * 12;
      const path = `M ${hq.x},${hq.y} Q ${mx},${my} ${p.x},${p.y}`;
      return { path, key: `arc-${i}`, target: p };
    });

    return { points, arcs };
  }, [width, height]);

  if (reduce) {
    // Static fallback — single high-quality SVG, no animation
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={className}
        role="img"
        aria-label="Network globe illustration — static fallback"
      >
        <defs>
          <radialGradient id="globe-fill-static" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--surface-2)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--bg-deep)" stopOpacity="1" />
          </radialGradient>
        </defs>
        <circle cx={width / 2} cy={height / 2} r={Math.min(width, height) / 2 - 12} fill="url(#globe-fill-static)" stroke="var(--border-strong)" strokeWidth="1" />
        {longitudes.map((l, i) => (
          <ellipse key={`l${i}`} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} fill="none" stroke="var(--border-subtle)" strokeWidth="0.6" />
        ))}
        {latitudes.map((l, i) => (
          <ellipse key={`la${i}`} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} fill="none" stroke="var(--border-subtle)" strokeWidth="0.6" />
        ))}
        {arcs.points.filter((p) => p.visible).map((p, i) => (
          <circle key={`p${i}`} cx={p.x} cy={p.y} r="3" fill="var(--accent-cyan)" />
        ))}
      </svg>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ width, height }}
      aria-label="Interactive network globe"
      role="img"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 65%)",
        }}
        aria-hidden
      />

      {showRing && (
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          aria-hidden
        >
          <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0">
            <defs>
              <radialGradient id="globe-fill" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--surface-2)" stopOpacity="1" />
                <stop offset="70%" stopColor="var(--bg-graphite)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--bg-deep)" stopOpacity="1" />
              </radialGradient>
              <linearGradient id="globe-edge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--accent-cyan)" />
              </linearGradient>
              <radialGradient id="globe-highlight" cx="30%" cy="25%" r="40%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Sphere base */}
            <circle cx={width / 2} cy={height / 2} r={Math.min(width, height) / 2 - 12} fill="url(#globe-fill)" stroke="url(#globe-edge)" strokeWidth="1.5" />
            <circle cx={width / 2} cy={height / 2} r={Math.min(width, height) / 2 - 12} fill="url(#globe-highlight)" />
          </svg>
        </motion.div>
      )}

      {/* Lat/long lines (slowly counter-rotating) */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        aria-hidden
      >
        <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0">
          {longitudes.map((l, i) => (
            <ellipse
              key={`l${i}`}
              cx={l.cx}
              cy={l.cy}
              rx={l.rx}
              ry={l.ry}
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth="0.6"
              opacity="0.6"
            />
          ))}
          {latitudes.map((l, i) => (
            <ellipse
              key={`la${i}`}
              cx={l.cx}
              cy={l.cy}
              rx={l.rx}
              ry={l.ry}
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </motion.div>

      {/* Great-circle arcs with traveling dots */}
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0">
        {arcs.arcs.map((arc) => (
          <g key={arc.key}>
            <motion.path
              d={arc.path}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1"
              strokeDasharray="3 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 2.4, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
            />
            <motion.circle
              r="3"
              fill="var(--accent-cyan)"
              initial={{ offsetDistance: "0%" }}
              animate={{ offsetDistance: ["0%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ offsetPath: `path('${arc.path}')` }}
            />
            {arc.target.visible && (
              <g>
                <circle cx={arc.target.x} cy={arc.target.y} r="3.5" fill="var(--accent-bright)" />
                <circle cx={arc.target.x} cy={arc.target.y} r="6" fill="none" stroke="var(--accent-bright)" strokeWidth="0.8" opacity="0.4">
                  <animate attributeName="r" from="4" to="9" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
          </g>
        ))}
        {/* HQ node — pulse ring */}
        {arcs.points[0] && (
          <g>
            <circle cx={arcs.points[0].x} cy={arcs.points[0].y} r="5" fill="var(--accent)" />
            <circle cx={arcs.points[0].x} cy={arcs.points[0].y} r="9" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.5">
              <animate attributeName="r" from="6" to="14" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.7" to="0" dur="2.4s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </svg>

      {/* Coordinate tick marks (decorative) */}
      <div className="absolute inset-0 coordinate-marks" aria-hidden />
    </div>
  );
}

/**
 * Lazy-loaded wrapper for code splitting.
 */
export function NetworkGlobeLazy(props: NetworkGlobeProps) {
  // Note: this is a synchronous export — the parent (page.tsx) uses next/dynamic
  // to actually lazy-load it. This wrapper exists so callers can opt-in to a
  // reduced-motion static fallback without re-rendering.
  return <NetworkGlobe {...props} />;
}
