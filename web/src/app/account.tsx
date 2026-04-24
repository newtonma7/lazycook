"use client";

import { useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Trash2,
  LogOut,
  KeyRound,
  Fingerprint,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChefHat,
  ArrowRight,
  Sparkles,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { spring } from "@/lib/animation";
import {
  deleteCurrentAccount,
  signOutAccount,
  updateCurrentAccount,
  signInAccount, 
  signUpAccount,
} from "./actions";
import { getRoleLabel } from "./auth/auth-shared";
import { BasilOnboarding, BasilIdle } from "./components/mascot/BasilComponents";

type Props = {
  message?: string;
  error?: string;
  currentAccount: any;
};

// Personable floating elements to bring back the "cuteness"
const FloatingEmoticon = ({ emoji, delay = 0, x = "0%", y = "0%" }: { emoji: string, delay?: number, x?: string, y?: string }) => (
  <motion.span
    initial={{ y: 0 }}
    animate={{ 
      y: [0, -10, 0],
      rotate: [0, 8, -8, 0]
    }}
    transition={{ 
      duration: 6, 
      repeat: Infinity, 
      delay, 
      ease: "easeInOut" 
    }}
    className="absolute text-lg md:text-xl pointer-events-none select-none opacity-40 z-0"
    style={{ left: x, top: y }}
  >
    {emoji}
  </motion.span>
);

export function AccountPanel({ message, error, currentAccount }: Props) {
  const [isLogin, setIsLogin] = useState(true);

  // --- AUTHENTICATION STATE (LOGGED OUT) ---
  if (!currentAccount) {
    return (
      <div className="max-w-md mx-auto font-[family-name:var(--font-body)] animate-in fade-in duration-1000 pt-2 pb-12 relative px-4">
        
        <FloatingEmoticon emoji="🍅" x="-10%" y="15%" delay={0} />
        <FloatingEmoticon emoji="🌿" x="110%" y="25%" delay={1} />
        <FloatingEmoticon emoji="🍋" x="0%" y="85%" delay={2} />
        <FloatingEmoticon emoji="🥖" x="100%" y="75%" delay={0.5} />

        {/* Basil napping peacefully */}
        <div className="absolute bottom-2 right-3 opacity-30 hover:opacity-60 transition-opacity duration-500">
            <BasilIdle size={70} />
        </div>
        
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-40 h-40 bg-[var(--color-tomato)]/5 rounded-full blur-[60px] animate-blob -z-10 pointer-events-none" />

        <AnimatePresence mode="popLayout">
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mb-4 rounded-2xl border border-[var(--color-tomato)]/20 bg-[var(--color-tomato)]/5 p-3 flex items-start gap-3 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-tomato)]" />
               <AlertCircle className="w-4 h-4 text-[var(--color-tomato)] shrink-0 mt-0.5" />
               <p className="text-xs text-[var(--color-tomato)] font-medium leading-relaxed">{error}</p>
            </motion.div>
          )}
          {message && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mb-4 rounded-2xl border border-[var(--color-sage)]/20 bg-[var(--color-sage)]/5 p-3 flex items-start gap-3 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-sage)]" />
               <CheckCircle2 className="w-4 h-4 text-[var(--color-sage)] shrink-0 mt-0.5" />
               <p className="text-xs text-[var(--color-sage)] font-medium leading-relaxed">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-6">
            <div className="inline-block mb-3">
                <BasilOnboarding size={90} />
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-light italic text-[var(--color-ink)] tracking-tight leading-none mb-1">
                {isLogin ? "Welcome back" : "Join us"}
            </h2>
            <p className="font-[family-name:var(--font-body)] text-[var(--color-ink-muted)] text-sm italic">
                {isLogin ? "Ready to cook something new?" : "Basil’s excited to meet you."}
            </p>
        </div>

        <motion.div layout transition={spring} className="relative bg-[var(--color-surface)] rounded-[2rem] p-6 md:p-8 border border-[var(--color-border)] shadow-sm z-10">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-tomato)] opacity-40" />
          
          <form action={isLogin ? signInAccount : signUpAccount} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative group overflow-hidden">
                  <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-0.5 block ml-1">Chef Handle</label>
                  <input
                    name="username"
                    type="text"
                    required={!isLogin}
                    placeholder="Gordon"
                    className="w-full bg-transparent border-b border-[var(--color-border)] px-1 py-1.5 text-base text-[var(--color-ink)] focus:border-[var(--color-tomato)] outline-none transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-0.5 block ml-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="chef@lazycook.com"
                className="w-full bg-transparent border-b border-[var(--color-border)] px-1 py-1.5 text-base text-[var(--color-ink)] focus:border-[var(--color-tomato)] outline-none transition-all"
              />
            </div>

            <div className="relative group">
              <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-0.5 block ml-1">Secret Key</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-[var(--color-border)] px-1 py-1.5 text-base text-[var(--color-ink)] focus:border-[var(--color-tomato)] outline-none transition-all"
              />
            </div>

            <div className="pt-3">
              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="group w-full rounded-full bg-[var(--color-ink)] px-8 py-3 font-[family-name:var(--font-body)] text-xs font-medium text-[var(--color-cream)] tracking-wide transition-all duration-300 hover:bg-[var(--color-tomato)] hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isLogin ? "Enter Kitchen" : "Create Account"}
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
          </form>

          <div className="mt-6 text-center border-t border-[var(--color-border-light)] pt-4">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[11px] font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] transition-colors cursor-pointer border-b border-transparent hover:border-[var(--color-tomato)] pb-0.5 italic"
            >
              {isLogin ? "Need an account? Create one" : "Already a member? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- DASHBOARD STATE (LOGGED IN) ---
  return (
    <div className="max-w-6xl mx-auto font-[family-name:var(--font-body)] animate-in fade-in duration-1000 pb-2 w-full relative px-4 sm:px-6">
      
      <AnimatePresence mode="popLayout">
        {(error || message) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4">
            {error && (
              <div className="rounded-xl border border-[var(--color-tomato)]/20 bg-[var(--color-tomato)]/5 p-3 flex items-start gap-3 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-tomato)]" />
                <AlertCircle className="w-4 h-4 text-[var(--color-tomato)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--color-tomato)] font-medium leading-relaxed">{error}</p>
              </div>
            )}
            {message && (
              <div className="rounded-xl border border-[var(--color-sage)]/20 bg-[var(--color-sage)]/5 p-3 flex items-start gap-3 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-sage)]" />
                <CheckCircle2 className="w-4 h-4 text-[var(--color-sage)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--color-sage)] font-medium leading-relaxed">{message}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-12 items-start relative z-10">
        
        {/* LEFT: IDENTITY (Chef's Pass Card) */}
        <motion.section
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={spring}
          className="lg:col-span-5 space-y-4 lg:sticky lg:top-2"
        >
          <div className="relative bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-border)] p-6 shadow-sm overflow-hidden group transition-all duration-500 hover:border-[var(--color-tomato)]/30">
            <Sparkles className="absolute top-4 right-4 w-4 h-4 text-[var(--color-turmeric)] opacity-20 group-hover:opacity-100 transition-all duration-500" />
            
            <div className="relative z-10">
              <span className="font-[family-name:var(--font-display)] text-xl italic text-[var(--color-tomato)] block mb-0.5">
                the chef
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] tracking-tight leading-tight mb-2">
                {currentAccount.username || "Anonymous"}
              </h3>
              <p className="text-[var(--color-ink-light)] text-sm leading-relaxed italic mb-6 max-w-xs">
                Cultivating a pantry and drafting recipes from the heart <Heart className="inline w-3 h-3 text-[var(--color-berry)] fill-[var(--color-berry)]/20" />.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border-light)]">
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-[var(--color-ink-muted)] mb-0.5">Rank</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[var(--color-turmeric)]/10 border border-[var(--color-turmeric)]/20 text-[8px] font-bold uppercase tracking-widest text-[var(--color-turmeric)] w-fit">
                    {getRoleLabel(currentAccount.role)}
                  </span>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-[var(--color-ink-muted)] mb-0.5">Status</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-[var(--color-sage)] animate-pulse" />
                    <span className="text-[10px] font-medium text-[var(--color-ink)] capitalize">{currentAccount.status || "Active"}</span>
                  </div>
                </div>
              </div>
            </div>

            <FloatingEmoticon emoji="🌿" x="85%" y="65%" delay={1} />
          </div>

          <div className="px-2 space-y-2">
             <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-[var(--color-ink-muted)]">Chef ID</span>
                <span className="text-xs font-[family-name:var(--font-mono)] opacity-40">#{currentAccount.userId}</span>
             </div>
             {currentAccount.createdAt && (
                <div className="text-[9px] text-[var(--color-ink-muted)] italic flex items-center gap-1 opacity-50">
                  <Calendar className="w-2.5 h-2.5" />
                  Est. {new Date(currentAccount.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                </div>
             )}
          </div>
        </motion.section>

        {/* RIGHT: SETTINGS */}
        <div className="lg:col-span-7 space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="relative bg-[var(--color-surface)] rounded-[2rem] p-6 md:p-8 overflow-hidden border border-[var(--color-border)] shadow-sm"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-peach)/50_0%,transparent_75%)] pointer-events-none" />

            <div className="mb-6 relative z-10">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-light italic text-[var(--color-ink)] mb-0.5">
                Settings
              </h3>
              <p className="text-[var(--color-ink-muted)] text-[8px] font-bold tracking-widest uppercase opacity-70">Update Profile</p>
            </div>

            <form action={updateCurrentAccount} className="space-y-6 relative z-10">
              <div className="relative group">
                <label className="text-[8px] font-bold uppercase tracking-[0.15em] text-[var(--color-ink-muted)] block mb-0.5 ml-1">Chef Handle</label>
                <input
                  name="username"
                  defaultValue={currentAccount.username ?? ""}
                  placeholder="Name..."
                  className="w-full bg-transparent border-b border-[var(--color-border)] py-1.5 text-lg font-[family-name:var(--font-display)] text-[var(--color-ink)] focus:border-[var(--color-tomato)] outline-none transition-all"
                />
              </div>

              <div className="relative group">
                <label className="text-[8px] font-bold uppercase tracking-[0.15em] text-[var(--color-ink-muted)] block mb-0.5 ml-1">Primary Email</label>
                <input
                  name="email"
                  defaultValue={currentAccount.email}
                  placeholder="Email..."
                  className="w-full bg-transparent border-b border-[var(--color-border)] py-1.5 text-lg font-[family-name:var(--font-display)] text-[var(--color-ink)] focus:border-[var(--color-tomato)] outline-none transition-all"
                />
              </div>

              <div className="relative group">
                <label className="text-[8px] font-bold uppercase tracking-[0.15em] text-[var(--color-ink-muted)] block mb-0.5 ml-1">Update Security Key</label>
                <input
                  name="password"
                  type="password"
                  placeholder="New password (optional)..."
                  className="w-full bg-transparent border-b border-[var(--color-border)] py-1.5 text-lg font-[family-name:var(--font-display)] text-[var(--color-ink)] focus:border-[var(--color-tomato)] outline-none transition-all"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="rounded-full bg-[var(--color-ink)] px-8 py-2.5 font-[family-name:var(--font-body)] text-[10px] font-medium text-[var(--color-cream)] tracking-wide transition-all duration-300 hover:bg-[var(--color-tomato)] hover:shadow-md cursor-pointer"
                >
                  Save Changes
                </motion.button>
                <div className="flex items-center gap-1.5 opacity-40">
                   <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                   <span className="text-[9px] text-[var(--color-ink-muted)] italic">Settings are private</span>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Utility Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 }}
            className="flex items-center justify-between px-4"
          >
            <form action={signOutAccount}>
              <button className="group flex items-center gap-2 text-[10px] font-bold tracking-widest text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all cursor-pointer uppercase">
                <span className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center group-hover:bg-white transition-all">
                  <LogOut className="w-3.5 h-3.5" />
                </span>
                Sign Out
              </button>
            </form>

            <form action={deleteCurrentAccount}>
              <button className="group flex items-center gap-2 text-[10px] font-bold tracking-widest text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] transition-all cursor-pointer uppercase" title="Delete Account">
                Delete Account
                <span className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center group-hover:bg-[var(--color-tomato)]/5 transition-all">
                  <Trash2 className="w-3.5 h-3.5 text-[var(--color-tomato)]" />
                </span>
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}