"use client";

import { motion, AnimatePresence } from "framer-motion";
import { basilFloat } from "@/lib/animation";

// ─────────────────────────────────────────────────────────────────
// DESIGN INTENT
//
// Each Basil state is engineered around a specific psychological
// moment in the user journey. Animation curves are not decorative —
// they communicate emotional subtext:
//
//   floatBob    → "alive but resting" (home, idle)
//   stir        → "working on your behalf" (AI loading)
//   successBounce → "genuine joy, shared with you" (celebration)
//   errorShake  → "oops, not alarming" (tension release)
//   peekBob     → "curiosity, invitation" (empty states)
//   onboardWave → "welcoming, warm" (first-time)
//   sweepBroom  → "playful urgency" (expiry)
//   thinkDot    → "honest processing" (non-recipe AI)
//
// All SVGs are 2–3 color palette max per the Lazy Cook brand spec.
// Max height 120px. Each is its own component for tree-shaking.
// ─────────────────────────────────────────────────────────────────

// ── Shared wrapper: applies the default idle float to any Basil
const BasilWrapper = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    animate={basilFloat.animate}
    transition={basilFloat.transition}
    className={`flex items-center justify-center ${className}`}
  >
    {children}
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────
// BasilIdle — napping on a stack of cookbooks
// When: Dashboard when no active task. Rewards attention without demanding it.
// Psychology: Calm companionship. Users feel the app is "alive" even at rest.
// ─────────────────────────────────────────────────────────────────
export function BasilIdle({ size = 100 }: { size?: number }) {
  return (
    <BasilWrapper>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Basil napping on cookbooks"
      >
        {/* Cookbook stack */}
        <rect x="18" y="72" width="64" height="8" rx="3" fill="var(--color-butter)" stroke="var(--color-text-primary)" strokeWidth="1.2" />
        <rect x="22" y="63" width="56" height="10" rx="3" fill="var(--color-blush)" stroke="var(--color-text-primary)" strokeWidth="1.2" />
        <rect x="26" y="55" width="48" height="10" rx="3" fill="var(--color-sage)" stroke="var(--color-text-primary)" strokeWidth="1.2" />

        {/* Sleeping Basil */}
        <motion.g
          animate={{ y: [0, -5, 0], rotate: [0, 1, -0.5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50px 50px" }}
        >
          <ellipse cx="50" cy="51" rx="16" ry="11" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
          {/* Tucked arms */}
          <path d="M34 53 Q28 57 30 62" stroke="var(--color-text-primary)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M66 53 Q72 57 70 62" stroke="var(--color-text-primary)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          {/* Head */}
          <circle cx="50" cy="37" r="13" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
          {/* Sleeping eyes */}
          <path d="M43 37 Q45.5 34.5 48 37" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M52 37 Q54.5 34.5 57 37" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Tiny content smile */}
          <path d="M46 42 Q50 45 54 42" stroke="var(--color-sage)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          {/* Chef hat, drooped lazily */}
          <motion.g
            animate={{ rotate: [-4, 2, -4], y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "50px 20px" }}
          >
            <path d="M40 29 L50 17 L60 29 Z" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
            <rect x="36" y="27" width="28" height="5" rx="2.5" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.1" />
            {/* Drooped tip */}
            <path d="M54 17 Q66 11 64 21" stroke="var(--color-text-primary)" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          </motion.g>
        </motion.g>

        {/* Z Z Z — staggered rise and fade */}
        {[
          { x: 66, y: 30, size: 9, delay: 0 },
          { x: 73, y: 22, size: 11, delay: 0.8 },
          { x: 80, y: 13, size: 14, delay: 1.5 },
        ].map((z, i) => (
          <motion.text
            key={i}
            x={z.x} y={z.y}
            fontFamily="DM Sans, sans-serif"
            fontSize={z.size}
            fill="var(--color-text-ghost)"
            animate={{ opacity: [0, 0.8, 0], y: [0, -8, -16] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: z.delay }}
          >
            z
          </motion.text>
        ))}
      </svg>
    </BasilWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────
// BasilLoading — stirring a bubbling pot
// When: AI recipe generation in AI Chef screen.
// Psychology: Active work rhythm. The 0.9s stir matches a human stirring
//             cadence — users subconsciously feel reassured, not waiting.
// ─────────────────────────────────────────────────────────────────
export function BasilLoading({ size = 110 }: { size?: number }) {
  return (
    <motion.div
      animate={basilFloat.animate}
      transition={basilFloat.transition}
      className="flex items-center justify-center"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Basil stirring a pot"
      >
        {/* Pot */}
        <path d="M22 62 L22 88 Q22 96 32 96 L68 96 Q78 96 78 88 L78 62 Z" fill="var(--color-warm-surface-2)" stroke="var(--color-text-primary)" strokeWidth="1.5" />
        <rect x="17" y="57" width="66" height="8" rx="4" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
        {/* Handles */}
        <path d="M17 63 Q8 63 8 70 Q8 77 17 77" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M83 63 Q92 63 92 70 Q92 77 83 77" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Bubbles in pot */}
        {[
          { cx: 36, cy: 59, r: 3, delay: 0 },
          { cx: 50, cy: 57, r: 2, delay: 0.4 },
          { cx: 62, cy: 60, r: 2.5, delay: 0.9 },
        ].map((b, i) => (
          <motion.circle
            key={i}
            cx={b.cx} cy={b.cy} r={b.r}
            fill="var(--color-butter)"
            animate={{ y: [0, -22], opacity: [0.8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: b.delay }}
          />
        ))}

        {/* Basil body */}
        <motion.g
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50px 30px" }}
        >
          <ellipse cx="50" cy="50" rx="15" ry="10" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
          {/* Left arm steady */}
          <path d="M35 52 Q26 56 28 62" stroke="var(--color-text-primary)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* Right arm + spoon: animated stir */}
          <motion.g
            animate={{ rotate: [-20, 20, -20] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "62px 52px" }}
          >
            <path d="M65 52 Q74 48 76 42" stroke="var(--color-text-primary)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <line x1="76" y1="42" x2="82" y2="34" stroke="var(--color-terracotta)" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="84" cy="32" rx="4" ry="5.5" fill="var(--color-blush-soft)" stroke="var(--color-terracotta)" strokeWidth="1.3" />
          </motion.g>
          {/* Head */}
          <circle cx="50" cy="34" r="13" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
          {/* Focused squint */}
          <path d="M43 33 Q46 31 49 33" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M51 33 Q54 31 57 33" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M47 38 Q50 37 53 38" stroke="var(--color-text-primary)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          {/* Hat */}
          <path d="M40 26 L50 14 L60 26 Z" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
          <rect x="36" y="24" width="28" height="5" rx="2.5" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.1" />
          <circle cx="50" cy="14" r="2.5" fill="var(--color-butter)" />
        </motion.g>
      </svg>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// BasilThinking — leaning on elbow, eyes looking up, thought dots
// When: Non-recipe AI tasks (pantry analysis, meal suggestions).
// Psychology: Thought dots pulse at ~1.2s — matches human "processing"
//             expectation. Tilted head reads as genuinely considering.
// ─────────────────────────────────────────────────────────────────
export function BasilThinking({ size = 100 }: { size?: number }) {
  return (
    <BasilWrapper>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Basil thinking"
      >
        <ellipse cx="50" cy="68" rx="18" ry="12" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
        {/* Elbow arm */}
        <path d="M32 68 Q22 72 24 80" stroke="var(--color-text-primary)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* Chin-rest arm */}
        <path d="M68 68 Q78 68 78 60 Q78 53 70 50" stroke="var(--color-text-primary)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <circle cx="68" cy="49" r="5" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.2" />
        {/* Head — gently tilted */}
        <motion.g
          animate={{ rotate: [8, 10, 7, 8], y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50px 46px" }}
        >
          <circle cx="50" cy="46" r="13" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
          {/* One eyebrow raised — quizzical */}
          <path d="M41 43 Q43.5 41 46 43" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M54 41 Q57 38.5 60 41" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Eyes gazing up-right */}
          <circle cx="43.5" cy="45" r="2" fill="var(--color-text-primary)" />
          <circle cx="44.5" cy="44.2" r="0.8" fill="var(--color-warm-surface)" />
          <circle cx="56.5" cy="45" r="2" fill="var(--color-text-primary)" />
          <circle cx="57.5" cy="44.2" r="0.8" fill="var(--color-warm-surface)" />
          {/* Hat */}
          <path d="M40 38 L50 26 L60 38 Z" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
          <rect x="36" y="36" width="28" height="5" rx="2.5" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.1" />
        </motion.g>
        {/* Thought dots — honest pulse at 1.2s cadence */}
        {[
          { cx: 72, cy: 25, r: 3.5, delay: 0 },
          { cx: 80, cy: 18, r: 4.5, delay: 0.3 },
          { cx: 88, cy: 9,  r: 6,   delay: 0.6 },
        ].map((d, i) => (
          <motion.circle
            key={i}
            cx={d.cx} cy={d.cy} r={d.r}
            fill="var(--color-sage)"
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1.1, 0.85] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: d.delay }}
          />
        ))}
      </svg>
    </BasilWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────
// BasilSuccess — arms raised, hat bouncing, rosy cheeks
// When: Recipe saved, meal planned, streak milestone.
// Psychology: Shared celebration. The bounce is calibrated to feel
//             like a human cheer — not a notification ping.
//             Use with canvas-confetti for milestone moments.
// ─────────────────────────────────────────────────────────────────
export function BasilSuccess({ size = 110 }: { size?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -16, -6, -10, -2, 0], scale: [1, 1.06, 0.97, 1.03, 0.99, 1] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
      className="flex items-center justify-center"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Basil celebrating with arms raised"
      >
        <ellipse cx="50" cy="72" rx="18" ry="14" fill="var(--color-blush-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
        {/* Left arm up */}
        <motion.g
          animate={{ rotate: [-10, 30, -10] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "32px 70px" }}
        >
          <path d="M32 70 Q18 60 16 50" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="15" cy="48" r="3.5" fill="var(--color-butter)" stroke="var(--color-text-primary)" strokeWidth="1" />
        </motion.g>
        {/* Right arm up */}
        <motion.g
          animate={{ rotate: [10, -30, 10] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "68px 70px" }}
        >
          <path d="M68 70 Q82 60 84 50" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="85" cy="48" r="3.5" fill="var(--color-butter)" stroke="var(--color-text-primary)" strokeWidth="1" />
        </motion.g>
        {/* Head */}
        <circle cx="50" cy="52" r="14" fill="var(--color-blush-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
        {/* Happy squint eyes */}
        <path d="M42 50 Q45 47 48 50" stroke="var(--color-text-primary)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M52 50 Q55 47 58 50" stroke="var(--color-text-primary)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* Big smile */}
        <path d="M42 56 Q50 63 58 56" stroke="var(--color-blush)" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Rosy cheeks */}
        <circle cx="41" cy="55" r="4" fill="var(--color-blush)" opacity="0.4" />
        <circle cx="59" cy="55" r="4" fill="var(--color-blush)" opacity="0.4" />
        {/* Bouncing hat */}
        <motion.g
          animate={{ rotate: [-4, 2, -4], y: [0, -5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50px 30px" }}
        >
          <path d="M38 44 L50 30 L62 44 Z" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
          <rect x="34" y="42" width="32" height="5.5" rx="2.5" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.1" />
          <circle cx="50" cy="30" r="2.5" fill="var(--color-butter)" />
        </motion.g>
        {/* Sparkles */}
        {[
          { x: 20, y: 38, delay: 0 },
          { x: 72, y: 36, delay: 0.5 },
        ].map((s, i) => (
          <motion.text
            key={i}
            x={s.x} y={s.y}
            fontSize="12"
            fill="var(--color-butter)"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
          >
            ✦
          </motion.text>
        ))}
      </svg>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// BasilEmpty — peeking into an empty pot, wide curious eyes
// When: Empty pantry state, no recipes state.
// Psychology: Curiosity replaces emptiness. "I wonder what's in here"
//             is an invitation to act — not a failure message.
// ─────────────────────────────────────────────────────────────────
export function BasilEmpty({ size = 110 }: { size?: number }) {
  return (
    <BasilWrapper>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Basil peeking into an empty pot"
      >
        {/* Big empty pot */}
        <path d="M18 62 L18 96 Q18 105 30 105 L70 105 Q82 105 82 96 L82 62 Z" fill="var(--color-warm-surface-2)" stroke="var(--color-text-primary)" strokeWidth="1.5" />
        <rect x="12" y="56" width="76" height="9" rx="4.5" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
        {/* Empty interior hint */}
        <ellipse cx="50" cy="82" rx="22" ry="8" fill="var(--color-warm-border)" opacity="0.4" />
        {/* Handles */}
        <path d="M12 62 Q4 62 4 70 Q4 78 12 78" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M88 62 Q96 62 96 70 Q96 78 88 78" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Basil peeking — gentle bob */}
        <motion.g
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ellipse cx="50" cy="60" rx="14" ry="7" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
          {/* Hands gripping rim */}
          <circle cx="34" cy="58" r="4" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.2" />
          <circle cx="66" cy="58" r="4" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.2" />
          {/* Head */}
          <circle cx="50" cy="44" r="13" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
          {/* Wide curious eyes */}
          <circle cx="44" cy="43" r="3.5" fill="var(--color-text-primary)" />
          <circle cx="45.2" cy="41.8" r="1.2" fill="var(--color-warm-surface)" />
          <circle cx="56" cy="43" r="3.5" fill="var(--color-text-primary)" />
          <circle cx="57.2" cy="41.8" r="1.2" fill="var(--color-warm-surface)" />
          {/* Little O-mouth of wonder */}
          <circle cx="50" cy="48" r="2.5" fill="none" stroke="var(--color-text-primary)" strokeWidth="1.3" />
          {/* Hat just visible */}
          <path d="M41 33 L50 22 L59 33 Z" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
          <rect x="37" y="31" width="26" height="4.5" rx="2" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1" />
        </motion.g>
      </svg>
    </BasilWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────
// BasilError — sitting with a slightly burnt pan, sheepish
// When: Network error, generation failure, any error state.
// Psychology: Self-deprecating humor diffuses frustration. Users laugh
//             rather than rage-quit. The single shake fires once on mount,
//             then settles — mimicking a real "oops" moment.
// ─────────────────────────────────────────────────────────────────
export function BasilError({ size = 110 }: { size?: number }) {
  return (
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: [-5, 5, -4, 4, -2, 2, 0] }}
      transition={{ duration: 0.8, ease: "easeInOut", times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1] }}
      className="flex items-center justify-center"
    >
      <motion.div
        animate={basilFloat.animate}
        transition={{ ...basilFloat.transition, delay: 0.9 }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Basil looking sheepish next to a burnt pan"
        >
          {/* Tilted burnt pan */}
          <g style={{ transform: "rotate(-8deg)", transformOrigin: "50px 88px" }}>
            <rect x="72" y="84" width="22" height="5" rx="2.5" fill="var(--color-text-primary)" opacity="0.7" />
            <circle cx="52" cy="88" r="20" fill="var(--color-text-secondary)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
            <circle cx="48" cy="86" r="5" fill="var(--color-text-primary)" opacity="0.25" />
            <circle cx="57" cy="90" r="3" fill="var(--color-text-primary)" opacity="0.2" />
            {/* Smoke wisps */}
            {[
              { d: "M46 68 Q44 62 46 56 Q48 50 46 44", delay: 0 },
              { d: "M52 66 Q54 60 52 54 Q50 48 52 42", delay: 0.4 },
            ].map((s, i) => (
              <motion.path
                key={i}
                d={s.d}
                stroke="var(--color-text-ghost)"
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
                animate={{ y: [0, -8, 0], opacity: [0.6, 0.2, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
              />
            ))}
          </g>
          {/* Body */}
          <ellipse cx="50" cy="65" rx="17" ry="12" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
          {/* Sheepish arms hanging down */}
          <path d="M33 66 Q24 72 26 78" stroke="var(--color-text-primary)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M67 66 Q76 72 74 78" stroke="var(--color-text-primary)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* Head */}
          <circle cx="50" cy="48" r="13" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
          {/* Sheepish expression */}
          <path d="M40 46 Q42 43.5 44 45" stroke="var(--color-text-primary)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M56 44 Q58.5 42 61 44" stroke="var(--color-text-primary)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* Wavy uncertain mouth */}
          <path d="M44 53 Q47 51 50 53 Q53 55 56 53" stroke="var(--color-text-primary)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          {/* Sweat drop */}
          <path d="M63 40 Q65 36 63 34 Q61 36 63 40Z" fill="#3B8BD4" opacity="0.7" />
          {/* Hat drooped sideways */}
          <motion.g
            animate={{ rotate: [12, 14, 11, 12] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "50px 34px" }}
          >
            <path d="M40 40 L50 28 L60 40 Z" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
            <rect x="36" y="38" width="28" height="5" rx="2.5" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.1" />
          </motion.g>
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// BasilOnboarding — waving from behind a cookbook
// When: First-time user welcome, onboarding step 1.
// Psychology: The wave cadence (1s) is warm and unhurried. Cookbook
//             as prop signals "this is a cooking app" without a word.
//             Rosy cheeks signal genuine friendliness.
// ─────────────────────────────────────────────────────────────────
export function BasilOnboarding({ size = 110 }: { size?: number }) {
  return (
    <BasilWrapper>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Basil waving from behind a cookbook"
      >
        {/* Cookbook */}
        <rect x="14" y="50" width="50" height="58" rx="5" fill="var(--color-blush)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
        <rect x="20" y="50" width="4" height="58" rx="2" fill="var(--color-terracotta)" opacity="0.5" />
        {[62, 70, 78].map((y) => (
          <line key={y} x1="26" y1={y} x2="56" y2={y} stroke="var(--color-text-primary)" strokeWidth="0.8" opacity="0.3" />
        ))}
        {/* Body */}
        <motion.g animate={basilFloat.animate} transition={basilFloat.transition}>
          <ellipse cx="58" cy="78" rx="18" ry="13" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
          {/* Waving arm */}
          <motion.g
            animate={{ rotate: [-5, 25, -5] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "40px 75px" }}
          >
            <path d="M40 75 Q30 68 24 60" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="22" cy="58" r="5" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
            {/* Tiny fingers */}
            {[
              { x1: 20, y1: 54, x2: 18, y2: 50 },
              { x1: 22, y1: 53, x2: 21, y2: 49 },
              { x1: 24, y1: 53, x2: 24, y2: 49 },
            ].map((f, i) => (
              <line key={i} x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} stroke="var(--color-text-primary)" strokeWidth="1" strokeLinecap="round" />
            ))}
          </motion.g>
          {/* Head */}
          <circle cx="62" cy="60" r="14" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
          {/* Warm happy eyes */}
          <path d="M55 58 Q58 55.5 61 58" stroke="var(--color-text-primary)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M63 58 Q66 55.5 69 58" stroke="var(--color-text-primary)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* Big smile */}
          <path d="M56 64 Q62 69 68 64" stroke="var(--color-sage)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* Rosy cheeks */}
          <circle cx="54" cy="63" r="3.5" fill="var(--color-blush)" opacity="0.4" />
          <circle cx="70" cy="63" r="3.5" fill="var(--color-blush)" opacity="0.4" />
          {/* Hat upright & proud */}
          <path d="M52 52 L62 40 L72 52 Z" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
          <rect x="48" y="50" width="28" height="5.5" rx="2.5" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.1" />
          <circle cx="62" cy="40" r="2.5" fill="var(--color-butter)" />
        </motion.g>
      </svg>
    </BasilWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────
// BasilExpiry — sweeping up fallen ingredients
// When: Ingredient expiry warning banner / pantry alert.
// Psychology: Urgency through playful action, not alarm color.
//             Users smile at the vignette, then act on it.
//             The ! badge uses terracotta — the urgency color per spec.
// ─────────────────────────────────────────────────────────────────
export function BasilExpiry({ size = 110 }: { size?: number }) {
  return (
    <BasilWrapper>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Basil sweeping up expiring ingredients"
      >
        {/* Floor */}
        <line x1="10" y1="100" x2="90" y2="100" stroke="var(--color-warm-border)" strokeWidth="2" strokeLinecap="round" />
        {/* Broom — animated sweep */}
        <motion.g
          animate={{ rotate: [-15, 15, -15] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "70px 70px" }}
        >
          <line x1="70" y1="38" x2="52" y2="92" stroke="var(--color-text-secondary)" strokeWidth="3" strokeLinecap="round" />
          <path d="M46 90 L58 90 L60 100 L44 100 Z" fill="var(--color-butter)" stroke="var(--color-text-primary)" strokeWidth="1" />
          {[48, 52, 56].map((x) => (
            <line key={x} x1={x} y1="90" x2={x - 2} y2="100" stroke="var(--color-text-primary)" strokeWidth="0.8" opacity="0.5" />
          ))}
        </motion.g>
        {/* Scattered items on floor */}
        {[
          { x: 12, emoji: "🥕" },
          { x: 36, emoji: "🫐" },
          { x: 60, emoji: "🍋" },
        ].map((item) => (
          <text key={item.x} x={item.x} y="100" fontSize="10">{item.emoji}</text>
        ))}
        {/* Basil body leaning forward */}
        <motion.g animate={basilFloat.animate} transition={basilFloat.transition}>
          <ellipse cx="32" cy="76" rx="16" ry="11" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
          {/* Arms gripping broom handle */}
          <path d="M46 74 Q56 68 64 60" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M44 80 Q54 78 68 74" stroke="var(--color-text-primary)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* Head */}
          <circle cx="32" cy="60" r="13" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
          {/* Determined squint */}
          <path d="M25 59 Q27.5 57 30 59" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M34 59 Q36.5 57 39 59" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Effort tongue */}
          <path d="M29 64 Q32 63 35 64" stroke="var(--color-text-primary)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          {/* Hat tilted with effort */}
          <motion.g
            animate={{ rotate: [-6, -8, -5, -6] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "32px 46px" }}
          >
            <path d="M22 52 L32 40 L42 52 Z" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
            <rect x="18" y="50" width="28" height="5" rx="2.5" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.1" />
          </motion.g>
          {/* Urgency badge — terracotta per spec */}
          <circle cx="44" cy="52" r="4.5" fill="var(--color-terracotta)" />
          <text x="41.8" y="55.5" fontSize="6" fill="var(--color-warm-surface)" fontFamily="DM Sans, sans-serif" fontWeight="600">!</text>
        </motion.g>
      </svg>
    </BasilWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────
// BasilMealPlan — peeking over the edge of a planner/calendar
// When: Meal planner empty day, prep insight banner.
// Psychology: Basil as co-planner, not just assistant. Peeking over
//             the calendar creates a "we're doing this together" feeling.
// ─────────────────────────────────────────────────────────────────
export function BasilMealPlan({ size = 110 }: { size?: number }) {
  return (
    <BasilWrapper>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Basil peeking over a meal planner"
      >
        {/* Planner/calendar */}
        <rect x="10" y="55" width="80" height="52" rx="8" fill="var(--color-warm-surface-2)" stroke="var(--color-warm-border)" strokeWidth="1.5" />
        {/* Calendar header strip */}
        <rect x="10" y="55" width="80" height="14" rx="8" fill="var(--color-sage-soft)" stroke="var(--color-warm-border)" strokeWidth="1.5" />
        <rect x="10" y="63" width="80" height="6" fill="var(--color-sage-soft)" />
        {/* Day columns */}
        {[22, 36, 50, 64, 78].map((x, i) => (
          <g key={i}>
            <rect x={x - 5} y="74" width="12" height="12" rx="3" fill="var(--color-warm-border)" opacity="0.5" />
            <rect x={x - 5} y="90" width="12" height="10" rx="3" fill="var(--color-warm-border)" opacity="0.3" />
          </g>
        ))}
        {/* One day filled in — sage */}
        <rect x="17" y="74" width="12" height="12" rx="3" fill="var(--color-sage-soft)" stroke="var(--color-sage)" strokeWidth="1" />
        {/* Basil peeking over top edge */}
        <motion.g
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Tiny hands on top of planner */}
          <circle cx="35" cy="56" r="4" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.2" />
          <circle cx="65" cy="56" r="4" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.2" />
          {/* Head */}
          <circle cx="50" cy="42" r="14" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
          {/* Excited wide eyes */}
          <circle cx="44" cy="41" r="3" fill="var(--color-text-primary)" />
          <circle cx="45" cy="40" r="1" fill="var(--color-warm-surface)" />
          <circle cx="56" cy="41" r="3" fill="var(--color-text-primary)" />
          <circle cx="57" cy="40" r="1" fill="var(--color-warm-surface)" />
          {/* Eyebrows raised — excited */}
          <path d="M40 37 Q43 35 46 37" stroke="var(--color-text-primary)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M54 37 Q57 35 60 37" stroke="var(--color-text-primary)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          {/* Excited open smile */}
          <path d="M44 48 Q50 53 56 48" stroke="var(--color-sage)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Hat */}
          <path d="M40 34 L50 22 L60 34 Z" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
          <rect x="36" y="32" width="28" height="5" rx="2.5" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.1" />
          <circle cx="50" cy="22" r="2.5" fill="var(--color-butter)" />
        </motion.g>
      </svg>
    </BasilWrapper>
  );
}

export function BasilFloating({ size = 70 }: { size?: number }) {
  return (
    <motion.div
      animate={{
        y: [0, -8, 0],
        rotate: [0, 3, -2, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="flex items-center justify-center"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 70 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Basil floating peacefully"
      >
        {/* Small, cloud-like body */}
        <ellipse cx="35" cy="48" rx="16" ry="10" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.3" opacity="0.9" />
        {/* Tiny arms tucked */}
        <path d="M22 50 Q18 55 20 58" stroke="var(--color-text-primary)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M48 50 Q52 55 50 58" stroke="var(--color-text-primary)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Head */}
        <circle cx="35" cy="34" r="12" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.3" />
        {/* Closed, content eyes */}
        <path d="M29 34 Q31 32 33 34" stroke="var(--color-text-primary)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <path d="M37 34 Q39 32 41 34" stroke="var(--color-text-primary)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        {/* Tiny smile */}
        <path d="M32 39 Q35 41 38 39" stroke="var(--color-sage)" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        {/* Mini chef hat */}
        <path d="M28 26 L35 18 L42 26 Z" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.1" />
        <rect x="26" y="25" width="18" height="4" rx="2" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1" />
      </svg>
    </motion.div>
  );
}

export function BasilPeeking({ size = 90 }: { size?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -3, 0], rotate: [0, 2, -1, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="flex items-center justify-center"
      style={{ transformOrigin: "bottom center" }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Basil peeking over the edge"
      >
        {/* Edge bar that Basil hangs onto — use currentColor or a border var */}
        <rect x="0" y="65" width="100" height="28" rx="14"
          fill="var(--color-border-light)" stroke="var(--color-border)" strokeWidth="1.5" />
        
        {/* Basil's body — halfway over */}
        <g transform="translate(50, 58)">
          {/* Torso */}
          <ellipse cx="0" cy="22" rx="16" ry="9" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
          {/* Arms gripping edge */}
          <path d="M-16 20 Q-24 10 -18 0" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="-18" cy="2" r="4" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.2" />
          <path d="M16 20 Q24 10 18 0" stroke="var(--color-text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="18" cy="2" r="4" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.2" />
          {/* Head — tilted */}
          <g transform="rotate(6)">
            <circle cx="0" cy="-5" r="13" fill="var(--color-sage-soft)" stroke="var(--color-text-primary)" strokeWidth="1.4" />
            {/* Wide, interested eyes */}
            <circle cx="-5" cy="-7" r="3.2" fill="var(--color-text-primary)" />
            <circle cx="-4" cy="-8.2" r="1.2" fill="var(--color-warm-surface)" />
            <circle cx="5" cy="-7" r="3.2" fill="var(--color-text-primary)" />
            <circle cx="6" cy="-8.2" r="1.2" fill="var(--color-warm-surface)" />
            {/* Small smile */}
            <path d="M-3 -1 Q0 3 3 -1" stroke="var(--color-sage)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            {/* Chef hat */}
            <path d="M-10 -16 L0 -27 L10 -16 Z" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1.2" />
            <rect x="-14" y="-18" width="28" height="5" rx="2.5" fill="var(--color-warm-surface)" stroke="var(--color-text-primary)" strokeWidth="1" />
            <circle cx="0" cy="-27" r="2.5" fill="var(--color-butter)" />
          </g>
        </g>
        {/* Tiny recipe card pinned to the edge */}
        <rect x="72" y="62" width="20" height="14" rx="2" fill="var(--color-warm-surface)" stroke="var(--color-sage)" strokeWidth="1" />
        <line x1="76" y1="66" x2="88" y2="66" stroke="var(--color-text-ghost)" strokeWidth="0.8" />
        <line x1="76" y1="69" x2="86" y2="69" stroke="var(--color-text-ghost)" strokeWidth="0.8" />
        <line x1="76" y1="72" x2="87" y2="72" stroke="var(--color-text-ghost)" strokeWidth="0.8" />
      </svg>
    </motion.div>
  );
}