// components/ambient-background/AmbientBackground.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AmbientBackgroundProps {
  /** Optional list of emoji / symbols. Defaults to a cozy, kitchen‑cottage set. */
  elements?: string[];
}

/** Soft, cottage‑friendly symbols that blend with the warm palette. */
const DEFAULT_ELEMENTS = ["🌾", "🍂", "🥐", "🍃", "🌰", "🧺", "🍯", "☕", "🍞", "🌿"];

export function AmbientBackground({ elements = DEFAULT_ELEMENTS }: AmbientBackgroundProps) {
  const [positions, setPositions] = useState<
    { top: number; left: number; rotate: number; delay: number }[]
  >([]);

  useEffect(() => {
    setPositions(
      elements.map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        rotate: Math.random() * 10 - 5,
        delay: Math.random() * 3,
      }))
    );
  }, [elements]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {positions.map((pos, i) => (
        <motion.span
          key={i}
          // Use a warm, low‑contrast text color from the palette
          className="absolute text-xl text-[var(--color-text-ghost)] opacity-[0.12] select-none"
          style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
          animate={{
            y: [0, -12, 0],
            rotate: [pos.rotate, pos.rotate + 4, pos.rotate - 2, pos.rotate],
          }}
          transition={{
            duration: 8 + i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: pos.delay,
          }}
        >
          {elements[i]}
        </motion.span>
      ))}
    </div>
  );
}