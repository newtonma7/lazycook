// components/ai-recipe-panel/components/CozyLoading.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BasilLoading } from "../../components/mascot/BasilComponents";

const encouragements = [
  "stirring magic into your ingredients… ✨",
  "a pinch of love, a dash of creativity…",
  "basil is humming a little tune 🎵",
  "whisking up something special…",
  "thinking like a cozy michelin chef…",
  "combining pantry treasures…",
];

const floatingIngredients = ["🥕", "🧅", "🍅", "🧄", "🌿", "🍄", "🧀", "🥖"];

export function CozyLoading() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % encouragements.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 relative">
      {/* Basil */}
      <BasilLoading />

      {/* Encouragement message */}
      <motion.p
        key={messageIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-text-primary)] mt-6 text-center"
      >
        {encouragements[messageIndex]}
      </motion.p>

      {/* Floating ingredient emojis rising like steam */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingIngredients.map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl opacity-20"
            initial={{ bottom: "0%", x: `${Math.random() * 80 + 10}%` }}
            animate={{ bottom: "100%", opacity: [0.2, 0.4, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeOut", delay: i * 0.3 }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      {/* Soft shimmer placeholders */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[280px] rounded-[2rem] border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)] overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-warm-surface-2)] to-transparent animate-pulse" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-sage-soft)] to-[var(--color-blush-soft)]" />
            {/* Fake recipe card content */}
            <div className="p-6 space-y-3">
              <div className="h-4 bg-[var(--color-warm-border-soft)] rounded-full w-3/4" />
              <div className="h-3 bg-[var(--color-warm-border-soft)] rounded-full w-full" />
              <div className="h-3 bg-[var(--color-warm-border-soft)] rounded-full w-5/6" />
              <div className="mt-8 pt-4 border-t border-[var(--color-warm-border-soft)] flex justify-between">
                <div className="h-2 bg-[var(--color-warm-border-soft)] rounded-full w-12" />
                <div className="h-2 bg-[var(--color-warm-border-soft)] rounded-full w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}