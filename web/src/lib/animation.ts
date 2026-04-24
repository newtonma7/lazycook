// lib/animation.ts
import type { Transition } from "framer-motion";

// Standard physics-based spring for quick, responsive UI elements
export const spring: Transition = { 
  type: "spring", 
  stiffness: 400, 
  damping: 30 
};

// Softer spring for larger transitions
export const softSpring: Transition = { 
  type: "spring", 
  stiffness: 200, 
  damping: 25 
};

// Standard easing for subtle opacity or color transitions
export const easeOut: Transition = { 
  duration: 0.25, 
  ease: [0.16, 1, 0.3, 1] 
};

// Micro-ease for very fast interactions
export const microEase: Transition = { 
  duration: 0.15, 
  ease: "easeOut" 
};