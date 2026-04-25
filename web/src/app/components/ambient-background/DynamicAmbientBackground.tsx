"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

// Collections of kitchen‑cozy emojis that fit the theme
const EMOJI_COLLECTIONS = [
  ["🥕", "🌿", "🍋", "🧅", "🫐", "🌾"],
  ["🍎", "🥖", "🧀", "🍇", "🍑", "🌱"],
  ["🫒", "🍅", "🧄", "🫘", "🌶️", "🍃"],
  ["🧈", "🥐", "🫧", "🍯", "☕", "🍞"],
];

type Props = {
  // Optionally override the emoji set per screen
  collection?: string[];
};

export function DynamicAmbientBackground({ collection }: Props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Pick a random collection (or use the prop) only on the client
  const elements = useMemo(() => {
    if (!isClient) return [];
    if (collection) return collection;
    const pick = EMOJI_COLLECTIONS[Math.floor(Math.random() * EMOJI_COLLECTIONS.length)];
    return pick;
  }, [isClient, collection]);

  // Generate random positions once on mount
  const positions = useMemo(() => {
    if (!isClient) return [];
    return elements.map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      rotate: Math.random() * 10 - 5,
      delay: Math.random() * 3,
    }));
  }, [isClient, elements]);

  if (!isClient) return null; // render nothing on server

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {positions.map((pos, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl opacity-[0.12] text-[var(--color-text-ghost)] select-none"
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