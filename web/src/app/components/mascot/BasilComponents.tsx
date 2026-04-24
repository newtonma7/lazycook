// components/mascot/BasilComponents.tsx
"use client";

import { motion } from "framer-motion";
import { basilFloat } from "@/lib/animation";

export function BasilLoading() {
  return (
    <motion.div
      animate={basilFloat.animate}
      transition={basilFloat.transition}
      className="flex items-center justify-center"
    >
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Simple warm line-art Basil stirring a pot */}
        <circle cx="40" cy="45" r="12" stroke="var(--color-text-primary)" strokeWidth="2" fill="none"/>
        <path d="M35 35 L45 35 L42 25 L38 25 Z" fill="var(--color-sage)" fillOpacity="0.4" stroke="var(--color-text-primary)" strokeWidth="1.5"/>
        <line x1="30" y1="45" x2="28" y2="48" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="50" y1="45" x2="52" y2="48" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round"/>
        {/* Spoon */}
        <line x1="55" y1="35" x2="45" y2="35" stroke="var(--color-terracotta)" strokeWidth="2" strokeLinecap="round"/>
        <ellipse cx="55" cy="35" rx="3" ry="5" stroke="var(--color-terracotta)" strokeWidth="1.5" fill="var(--color-blush-soft)"/>
        {/* Bubbles */}
        <circle cx="38" cy="42" r="1.5" fill="var(--color-butter)"/>
        <circle cx="42" cy="43" r="1" fill="var(--color-butter)"/>
      </svg>
    </motion.div>
  );
}

export function BasilEmpty() {
  return (
    <motion.div
      animate={basilFloat.animate}
      transition={basilFloat.transition}
      className="flex items-center justify-center"
    >
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Basil peering into an empty pot */}
        <circle cx="40" cy="50" r="14" stroke="var(--color-text-primary)" strokeWidth="2" fill="none"/>
        <ellipse cx="40" cy="36" rx="10" ry="14" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.5"/>
        {/* Eyes half-moon, sleepy */}
        <path d="M35 36 Q37 34 39 36" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none"/>
        <path d="M41 36 Q43 34 45 36" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none"/>
        {/* Drooping chef hat */}
        <path d="M30 32 L40 20 L50 32" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.5"/>
        <circle cx="40" cy="20" r="2" fill="var(--color-butter)"/>
      </svg>
    </motion.div>
  );
}

export function BasilSuccess() {
  return (
    <motion.div
      animate={basilFloat.animate}
      transition={basilFloat.transition}
      className="flex items-center justify-center"
    >
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Basil happy, arms up */}
        <circle cx="40" cy="48" r="12" stroke="var(--color-text-primary)" strokeWidth="2" fill="none"/>
        <path d="M35 30 L40 20 L45 30" fill="var(--color-blush-soft)" stroke="var(--color-text-primary)" strokeWidth="1.5"/>
        <line x1="28" y1="44" x2="22" y2="38" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="52" y1="44" x2="58" y2="38" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round"/>
        {/* Chef hat */}
        <rect x="32" y="16" width="16" height="6" rx="3" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1"/>
        <path d="M32 22 Q40 14 48 22" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1"/>
        {/* Smile */}
        <path d="M36 52 Q40 56 44 52" stroke="var(--color-sage)" strokeWidth="1.5" fill="none"/>
      </svg>
    </motion.div>
  );
}