// lib/animation.ts
import type { Transition, Variants } from "framer-motion";

export const spring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const softSpring: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 22,
};

export const bouncySpring: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 20,
};

export const easeOut: Transition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1],
};

export const microEase: Transition = {
  duration: 0.15,
  ease: "easeOut",
};

export const pageEntry: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: easeOut },
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export const cardHover = {
  whileHover: { y: -4, boxShadow: "0 12px 32px rgba(44,32,22,0.12)" },
  whileTap: { scale: 0.98 },
  transition: softSpring,
};

export const ingredientAdd: Variants = {
  initial: { scale: 0.7, opacity: 0 },
  animate: {
    scale: [0.7, 1.08, 1],
    opacity: 1,
    transition: bouncySpring,
  },
};

export const ingredientRemove: Variants = {
  exit: { x: -24, opacity: 0, transition: microEase },
};

export const celebrationPop: Variants = {
  initial: { scale: 0, rotate: -12 },
  animate: {
    scale: [0, 1.2, 1],
    rotate: [-12, 6, 0],
    transition: bouncySpring,
  },
};

export const basilFloat = {
  animate: {
    y: [0, -6, 0],
    rotate: [0, 2, -1, 0],
  },
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};