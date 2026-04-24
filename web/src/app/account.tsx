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
      <div className="max-w-md mx-auto font-[family-name:var(--font-body)] animate-in fade-in duration-1000 pt-4 pb-16 relative px-4">
        
        <FloatingEmoticon emoji="🍅" x="-10%" y="15%" delay={0} />
        <FloatingEmoticon emoji="🌿" x="110%" y="25%" delay={1} />
        <FloatingEmoticon emoji="🍋" x="0%" y="85%" delay={2} />
        <FloatingEmoticon emoji="🥖" x="100%" y="75%" delay={0.5} />

        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-48 h-48 bg-[var(--color-tomato)]/5 rounded-full blur-[60px] animate-blob -z-10 pointer-events-none" />

        <AnimatePresence mode="popLayout">
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mb-6 rounded-2xl border border-[var(--color-tomato)]/20 bg-[var(--color-tomato)]/5 p-4 flex items-start gap-3 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-tomato)]" />
               <AlertCircle className="w-5 h-5 text-[var(--color-tomato)] shrink-0 mt-0.5" />
               <p className="text-sm text-[var(--color-tomato)] font-medium leading-relaxed">{error}</p>
            </motion.div>
          )}
          {message && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mb-6 rounded-2xl border border-[var(--color-sage)]/20 bg-[var(--color-sage)]/5 p-4 flex items-start gap-3 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-sage)]" />
               <CheckCircle2 className="w-5 h-5 text-[var(--color-sage)] shrink-0 mt-0.5" />
               <p className="text-sm text-[var(--color-sage)] font-medium leading-relaxed">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-8">
          <motion.div 
            animate={{ rotate: [0, -12, 12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            <ChefHat className="w-10 h-10 text-[var(--color-ink-muted)]/40 mb-4" />
          </motion.div>
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-light italic text-[var(--color-ink)] tracking-tight leading-none mb-2">
            {isLogin ? "Welcome back" : "Join us"}
          </h2>
          <p className="font-[family-name:var(--font-body)] text-[var(--color-ink-muted)] text-base italic">
            {isLogin ? "Ready to cook something new?" : "Start your culinary journey today."}
          </p>
        </div>

        <motion.div layout transition={spring} className="relative bg-[var(--color-surface)] rounded-[2.5rem] p-8 md:p-10 border border-[var(--color-border)] shadow-sm z-10">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-tomato)] opacity-40" />
          
          <form action={isLogin ? signInAccount : signUpAccount} className="space-y-6">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative group overflow-hidden">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-1 block ml-1">Chef Handle</label>
                  <input
                    name="username"
                    type="text"
                    required={!isLogin}
                    placeholder="Gordon"
                    className="w-full bg-transparent border-b border-[var(--color-border)] px-1 py-2 text-lg text-[var(--color-ink)] focus:border-[var(--color-tomato)] outline-none transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-1 block ml-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="chef@lazycook.com"
                className="w-full bg-transparent border-b border-[var(--color-border)] px-1 py-2 text-lg text-[var(--color-ink)] focus:border-[var(--color-tomato)] outline-none transition-all"
              />
            </div>

            <div className="relative group">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-1 block ml-1">Secret Key</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-[var(--color-border)] px-1 py-2 text-lg text-[var(--color-ink)] focus:border-[var(--color-tomato)] outline-none transition-all"
              />
            </div>

            <div className="pt-4">
              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="group w-full rounded-full bg-[var(--color-ink)] px-8 py-4 font-[family-name:var(--font-body)] text-[13px] font-medium text-[var(--color-cream)] tracking-wide transition-all duration-300 hover:bg-[var(--color-tomato)] hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                {isLogin ? "Enter Kitchen" : "Create Account"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-[var(--color-border-light)] pt-6">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] transition-colors cursor-pointer border-b border-transparent hover:border-[var(--color-tomato)] pb-0.5 italic"
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
    <div className="max-w-6xl mx-auto font-[family-name:var(--font-body)] animate-in fade-in duration-1000 pb-4 w-full relative px-4 sm:px-6">
      
      {/* Notifications */}
      <AnimatePresence mode="popLayout">
        {(error || message) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6">
            {error && (
              <div className="rounded-2xl border border-[var(--color-tomato)]/20 bg-[var(--color-tomato)]/5 p-3.5 flex items-start gap-3 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-tomato)]" />
                <AlertCircle className="w-4 h-4 text-[var(--color-tomato)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--color-tomato)] font-medium leading-relaxed">{error}</p>
              </div>
            )}
            {message && (
              <div className="rounded-2xl border border-[var(--color-sage)]/20 bg-[var(--color-sage)]/5 p-3.5 flex items-start gap-3 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-sage)]" />
                <CheckCircle2 className="w-4 h-4 text-[var(--color-sage)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--color-sage)] font-medium leading-relaxed">{message}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-8 lg:grid-cols-12 items-start relative z-10">
        
        {/* LEFT: IDENTITY (The "Chef's Pass" Card) */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={spring}
          className="lg:col-span-5 space-y-6 lg:sticky lg:top-4"
        >
          <div className="relative bg-[var(--color-surface)] rounded-[2.5rem] border border-[var(--color-border)] p-8 shadow-sm overflow-hidden group transition-all duration-500 hover:border-[var(--color-tomato)]/30">
            {/* Corner Decorative Star */}
            <Sparkles className="absolute top-6 right-6 w-5 h-5 text-[var(--color-turmeric)] opacity-20 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-500" />
            
            <div className="relative z-10">
              <span className="font-[family-name:var(--font-display)] text-2xl italic text-[var(--color-tomato)] block mb-1">
                the chef
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] tracking-tight leading-tight mb-4">
                {currentAccount.username || "Anonymous"}
              </h3>
              <p className="text-[var(--color-ink-light)] text-base leading-relaxed italic mb-8 max-w-xs">
                Cultivating a pantry and drafting recipes from the heart <Heart className="inline w-3.5 h-3.5 text-[var(--color-berry)] fill-[var(--color-berry)]/20" />.
              </p>

              <div className="grid gap-5 pt-6 border-t border-[var(--color-border-light)]">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-1">Kitchen Rank</span>
                  <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-turmeric)]/10 border border-[var(--color-turmeric)]/20 text-[9px] font-bold uppercase tracking-widest text-[var(--color-turmeric)] w-fit">
                    {getRoleLabel(currentAccount.role)}
                  </span>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-1">Status</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-sage)] animate-pulse" />
                      <span className="text-xs font-medium text-[var(--color-ink)] capitalize">{currentAccount.status || "Active"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-1">Chef UID</span>
                    <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--color-ink-light)] opacity-50">#{currentAccount.userId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Faint watermark emoticons inside the card */}
            <FloatingEmoticon emoji="🌿" x="80%" y="60%" delay={1} />
            <FloatingEmoticon emoji="🍅" x="5%" y="40%" delay={3} />
          </div>

          <div className="px-4 space-y-4">
             <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-0.5">Primary Contact</span>
                <span className="text-sm text-[var(--color-ink)] font-light truncate">{currentAccount.email}</span>
             </div>
             {currentAccount.createdAt && (
                <div className="text-[10px] text-[var(--color-ink-muted)] italic flex items-center gap-1.5 opacity-60">
                  <Calendar className="w-3 h-3" />
                  Kitchen established {new Date(currentAccount.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                </div>
             )}
          </div>
        </motion.section>

        {/* RIGHT: SETTINGS */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="relative bg-[var(--color-surface)] rounded-[2.5rem] p-8 md:p-10 overflow-hidden border border-[var(--color-border)] shadow-sm"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-peach)/70_0%,transparent_70%)] pointer-events-none" />

            <div className="mb-8 relative z-10">
              <h3 className="font-[family-name:var(--font-display)] text-3xl font-light italic text-[var(--color-ink)] mb-1">
                Settings
              </h3>
              <p className="text-[var(--color-ink-muted)] text-[8px] font-bold tracking-widest uppercase opacity-70">Update your chef profile</p>
            </div>

            <form action={updateCurrentAccount} className="space-y-8 relative z-10">
              <div className="relative group">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] block mb-0.5 ml-1">Chef Handle</label>
                <input
                  name="username"
                  defaultValue={currentAccount.username ?? ""}
                  placeholder="Your name..."
                  className="w-full bg-transparent border-b border-[var(--color-border)] py-2 text-xl font-[family-name:var(--font-display)] text-[var(--color-ink)] focus:border-[var(--color-tomato)] outline-none transition-all"
                />
              </div>

              <div className="relative group">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] block mb-0.5 ml-1">Email address</label>
                <input
                  name="email"
                  defaultValue={currentAccount.email}
                  placeholder="Email..."
                  className="w-full bg-transparent border-b border-[var(--color-border)] py-2 text-xl font-[family-name:var(--font-display)] text-[var(--color-ink)] focus:border-[var(--color-tomato)] outline-none transition-all"
                />
              </div>

              <div className="relative group">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] block mb-0.5 ml-1">New password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep..."
                  className="w-full bg-transparent border-b border-[var(--color-border)] py-2 text-xl font-[family-name:var(--font-display)] text-[var(--color-ink)] focus:border-[var(--color-tomato)] outline-none transition-all"
                />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="rounded-full bg-[var(--color-ink)] px-10 py-3.5 font-[family-name:var(--font-body)] text-xs font-medium text-[var(--color-cream)] tracking-wide transition-all duration-300 hover:bg-[var(--color-tomato)] hover:shadow-md cursor-pointer"
                >
                  Save Changes
                </motion.button>
                <div className="flex items-center gap-2 opacity-50">
                   <ShieldCheck className="w-4 h-4 text-[var(--color-sage)]" />
                   <span className="text-[10px] text-[var(--color-ink-muted)] italic leading-tight">Your data is stored securely</span>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Utility Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 }}
            className="flex items-center justify-between px-6"
          >
            <form action={signOutAccount}>
              <button className="group flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all cursor-pointer">
                <span className="w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center group-hover:bg-white group-hover:border-[var(--color-ink)] transition-all">
                  <LogOut className="w-4 h-4" />
                </span>
                Sign Out
              </button>
            </form>

            <form action={deleteCurrentAccount}>
              <button className="group flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] transition-all cursor-pointer" title="Delete Account">
                <span className="w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center group-hover:bg-[var(--color-tomato)]/5 group-hover:border-[var(--color-tomato)] transition-all">
                  <Trash2 className="w-4 h-4 text-[var(--color-tomato)]" />
                </span>
                Delete Account
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}