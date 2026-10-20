"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/utils";

interface UseCountUpOptions {
  duration?: number; // ms
  start?: number;
  startOnInView?: boolean;
  decimals?: number;
}

export function useCountUp(target: number, opts: UseCountUpOptions = {}) {
  const { duration = 1600, start = 0, decimals = 0 } = opts;
  const [value, setValue] = useState(start);
  const ref = useRef<HTMLSpanElement | null>(null);
  const startedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    const node = ref.current;
    if (!node) return;

    const runAnimation = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      if (reduce) {
        setValue(target);
        return;
      }

      const startTs = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTs;
        const t = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        const next = start + (target - start) * eased;
        setValue(parseFloat(next.toFixed(decimals)));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setValue(target);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            runAnimation();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, start, decimals]);

  return { ref, value };
}
