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

// Cute floating decorative elements
const FloatingEmoticon = ({ emoji, delay = 0, x = "0%", y = "0%" }: { emoji: string, delay?: number, x?: string, y?: string }) => (
  <motion.span
    initial={{ y: 0 }}
    animate={{ 
      y: [0, -12, 0],
      rotate: [0, 5, -5, 0]
    }}
    transition={{ 
      duration: 5, 
      repeat: Infinity, 
      delay, 
      ease: "easeInOut" 
    }}
    className="absolute text-xl md:text-2xl pointer-events-none select-none opacity-40 z-0"
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
      <div className="max-w-md mx-auto font-[family-name:var(--font-body)] animate-in fade-in duration-1000 pt-10 pb-24 relative px-4">
        
        <FloatingEmoticon emoji="🍅" x="-5%" y="15%" delay={0} />
        <FloatingEmoticon emoji="🌿" x="105%" y="25%" delay={1} />
        <FloatingEmoticon emoji="🍋" x="5%" y="75%" delay={2} />
        <FloatingEmoticon emoji="🥖" x="95%" y="65%" delay={0.5} />

        <div className="absolute top-[5%] -left-10 w-64 h-64 bg-[var(--color-tomato)]/5 rounded-full blur-[80px] animate-blob -z-10 pointer-events-none" />
        <div className="absolute bottom-[5%] -right-10 w-64 h-64 bg-[var(--color-sage)]/5 rounded-full blur-[80px] animate-blob [animation-delay:4s] -z-10 pointer-events-none" />

        <AnimatePresence mode="popLayout">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="mb-6 rounded-2xl border border-[var(--color-tomato)]/20 bg-[var(--color-tomato)]/5 p-4 flex items-start gap-3 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-tomato)]" />
               <AlertCircle className="w-5 h-5 text-[var(--color-tomato)] shrink-0 mt-0.5" />
               <p className="text-sm text-[var(--color-tomato)] font-medium leading-relaxed">{error}</p>
            </motion.div>
          )}
          {message && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="mb-6 rounded-2xl border border-[var(--color-sage)]/20 bg-[var(--color-sage)]/5 p-4 flex items-start gap-3 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-sage)]" />
               <CheckCircle2 className="w-5 h-5 text-[var(--color-sage)] shrink-0 mt-0.5" />
               <p className="text-sm text-[var(--color-sage)] font-medium leading-relaxed">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-10">
          <motion.div 
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            <ChefHat className="w-12 h-12 text-[var(--color-ink-muted)]/30 mb-6" />
          </motion.div>
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-light italic text-[var(--color-ink)] tracking-tight leading-none mb-3">
            {isLogin ? "Welcome back" : "Join our kitchen"}
          </h2>
          <p className="font-[family-name:var(--font-body)] text-[var(--color-ink-muted)] text-base italic">
            {isLogin ? "Sign in to see what's cooking." : "Start your culinary journey today."}
          </p>
        </div>

        <motion.div layout transition={spring} className="relative bg-[var(--color-surface)]/40 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-10 border border-[var(--color-border-light)] shadow-sm z-10">
          <form action={isLogin ? signInAccount : signUpAccount} className="space-y-6">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="relative group">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-0.5 block ml-1">Chef Handle</label>
                  <input
                    name="username"
                    type="text"
                    required={!isLogin}
                    placeholder="Gordon"
                    className="w-full bg-transparent border-b border-[var(--color-border)] px-1 py-2.5 text-lg text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/30 focus:border-[var(--color-tomato)] outline-none transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-0.5 block ml-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="chef@lazycook.com"
                className="w-full bg-transparent border-b border-[var(--color-border)] px-1 py-2.5 text-lg text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/30 focus:border-[var(--color-tomato)] outline-none transition-all"
              />
            </div>

            <div className="relative group">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-0.5 block ml-1">Security Key</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-[var(--color-border)] px-1 py-2.5 text-lg text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/30 focus:border-[var(--color-tomato)] outline-none transition-all"
              />
            </div>

            <div className="pt-4">
              <motion.button 
                whileTap={{ scale: 0.98 }}
                whileHover={{ y: -1 }}
                type="submit"
                className="group w-full rounded-full bg-[var(--color-ink)] px-8 py-4 font-[family-name:var(--font-body)] text-sm font-medium text-[var(--color-cream)] tracking-wide transition-all duration-300 hover:bg-[var(--color-tomato)] hover:shadow-lg hover:shadow-[var(--color-tomato)]/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLogin ? "Enter Kitchen" : "Create Account"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] transition-colors cursor-pointer border-b border-transparent hover:border-[var(--color-tomato)] pb-0.5 italic"
            >
              {isLogin ? "Need an account? Create one" : "Already a chef? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- DASHBOARD STATE (LOGGED IN) ---
  return (
    <div className="max-w-6xl mx-auto font-[family-name:var(--font-body)] animate-in fade-in duration-1000 pb-12 w-full relative px-4 sm:px-6">
      
      {/* Notifications */}
      <AnimatePresence mode="popLayout">
        {(error || message) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8">
            {error && (
              <div className="rounded-2xl border border-[var(--color-tomato)]/20 bg-[var(--color-tomato)]/5 p-4 flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-[var(--color-tomato)] shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--color-tomato)] font-medium leading-relaxed">{error}</p>
              </div>
            )}
            {message && (
              <div className="rounded-2xl border border-[var(--color-sage)]/20 bg-[var(--color-sage)]/5 p-4 flex items-start gap-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-sage)] shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--color-sage)] font-medium leading-relaxed">{message}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-12 lg:grid-cols-12 items-start relative z-10">
        
        {/* LEFT: IDENTITY */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={spring}
          className="lg:col-span-5 space-y-8 lg:sticky lg:top-24"
        >
          <div className="relative">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-[family-name:var(--font-display)] text-2xl italic text-[var(--color-tomato)] block">
                the chef
              </span>
              <Sparkles className="w-4 h-4 text-[var(--color-turmeric)] animate-float" />
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-ink)] tracking-tight leading-tight">
              {currentAccount.username || "Anonymous"}
            </h3>
            <p className="mt-4 text-[var(--color-ink-light)] text-lg leading-relaxed italic max-w-sm">
              Cultivating a thoughtful pantry and drafting recipes from the heart <Heart className="inline w-3.5 h-3.5 text-[var(--color-berry)] fill-[var(--color-berry)]/20" />.
            </p>
          </div>

          <div className="space-y-6 pt-6 border-t border-[var(--color-border-light)]">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-1">Primary Contact</span>
              <span className="text-lg text-[var(--color-ink)] font-light tracking-tight">{currentAccount.email}</span>
            </div>

            <div className="flex flex-wrap gap-x-12 gap-y-6">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-1.5">Kitchen Rank</span>
                <span className="inline-block px-3 py-1 rounded-md bg-[var(--color-turmeric)]/10 border border-[var(--color-turmeric)]/20 text-[9px] font-bold uppercase tracking-widest text-[var(--color-turmeric)]">
                  {getRoleLabel(currentAccount.role)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-1.5">Chef UID</span>
                <span className="text-base font-[family-name:var(--font-mono)] text-[var(--color-ink-light)] opacity-60">#{currentAccount.userId}</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)] mb-1.5">Kitchen Status</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-sage)] animate-pulse" />
                <span className="text-sm font-medium text-[var(--color-ink)] capitalize">{currentAccount.status || "Active"}</span>
              </div>
            </div>

            {currentAccount.createdAt && (
              <div className="pt-4 text-[10px] text-[var(--color-ink-muted)] italic flex items-center gap-1.5 opacity-70">
                <Calendar className="w-3 h-3" />
                Member since {new Date(currentAccount.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </div>
            )}
          </div>
        </motion.section>

        {/* RIGHT: SETTINGS */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="relative bg-[var(--color-surface)]/50 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 overflow-hidden border border-[var(--color-border)] shadow-sm"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-peach)/10_0%,transparent_70%)] pointer-events-none" />

            <div className="mb-10 relative z-10">
              <h3 className="font-[family-name:var(--font-display)] text-4xl font-light italic text-[var(--color-ink)] mb-1.5">
                Settings
              </h3>
              <p className="text-[var(--color-ink-muted)] text-[10px] font-bold tracking-widest uppercase opacity-70">update your profile details</p>
            </div>

            <form action={updateCurrentAccount} className="space-y-10 relative z-10">
              <div className="relative group">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Chef Handle</label>
                  <User className="w-3.5 h-3.5 text-[var(--color-ink-muted)] opacity-0 group-focus-within:opacity-100 transition-opacity" />
                </div>
                <input
                  name="username"
                  defaultValue={currentAccount.username ?? ""}
                  placeholder="Your handle..."
                  className="w-full bg-transparent border-b border-[var(--color-border)] py-2.5 text-xl font-[family-name:var(--font-display)] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/20 focus:border-[var(--color-tomato)] outline-none transition-all"
                />
              </div>

              <div className="relative group">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Primary Email</label>
                  <Mail className="w-3.5 h-3.5 text-[var(--color-ink-muted)] opacity-0 group-focus-within:opacity-100 transition-opacity" />
                </div>
                <input
                  name="email"
                  defaultValue={currentAccount.email}
                  placeholder="Your email..."
                  className="w-full bg-transparent border-b border-[var(--color-border)] py-2.5 text-xl font-[family-name:var(--font-display)] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/20 focus:border-[var(--color-tomato)] outline-none transition-all"
                />
              </div>

              <div className="relative group">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">New Password</label>
                  <KeyRound className="w-3.5 h-3.5 text-[var(--color-ink-muted)] opacity-0 group-focus-within:opacity-100 transition-opacity" />
                </div>
                <input
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep current"
                  className="w-full bg-transparent border-b border-[var(--color-border)] py-2.5 text-xl font-[family-name:var(--font-display)] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/20 focus:border-[var(--color-tomato)] outline-none transition-all"
                />
              </div>

              <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -1 }}
                  type="submit"
                  className="rounded-full bg-[var(--color-ink)] px-10 py-4 font-[family-name:var(--font-body)] text-xs font-medium text-[var(--color-cream)] tracking-wide transition-all duration-300 hover:bg-[var(--color-tomato)] hover:shadow-[0_12px_30px_rgba(193,68,14,0.15)] cursor-pointer"
                >
                  Save Changes
                </motion.button>
                <div className="flex flex-col opacity-60">
                   <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--color-sage)]">Secure Connection</span>
                   <span className="text-[10px] text-[var(--color-ink-muted)] italic leading-tight">Your data is yours alone</span>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Utility Row */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 }}
            className="flex flex-wrap items-center justify-between gap-6 px-4"
          >
            <form action={signOutAccount}>
              <button className="group flex items-center gap-2.5 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all cursor-pointer">
                <span className="w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center group-hover:bg-white group-hover:border-[var(--color-ink)] transition-all">
                  <LogOut className="w-4 h-4" />
                </span>
                Sign Out
              </button>
            </form>

            <form action={deleteCurrentAccount}>
              <button className="group flex items-center gap-2.5 text-xs font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] transition-all cursor-pointer" title="Delete Account">
                <span className="text-right hidden sm:block opacity-60">
                   <p className="leading-tight">Close Kitchen</p>
                   <p className="text-[9px]">Irreversible action</p>
                </span>
                <span className="w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center group-hover:bg-[var(--color-tomato)]/5 group-hover:border-[var(--color-tomato)] transition-all">
                  <Trash2 className="w-4 h-4 text-[var(--color-tomato)]" />
                </span>
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}