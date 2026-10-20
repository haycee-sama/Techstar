"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{
        scaleX,
        transformOrigin: "0% 50%",
      }}
      className="fixed inset-x-0 top-0 z-50 h-0.5"
    >
      <div
        className="h-full w-full"
        style={{
          background: `linear-gradient(90deg, var(--accent), var(--accent-cyan))`,
          boxShadow: "0 0 12px var(--accent)",
        }}
      />
    </motion.div>
  );
}
