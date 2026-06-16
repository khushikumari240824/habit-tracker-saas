"use client";

import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function VerifyEmailPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background glowing decorations */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-700/10 blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-700/10 blur-[128px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl p-8 text-center shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] hover:border-slate-700/50 transition-all duration-500"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
          <ShieldCheck className="h-8 w-8 text-white animate-pulse" />
        </div>

        <h1 className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
          Email Verified!
        </h1>
        
        <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-[320px] mx-auto font-medium">
          Thank you for confirming your email address. Your account is now fully activated and secured.
        </p>

        <div className="my-8 rounded-xl border border-slate-800/60 bg-slate-950/40 p-4 inline-flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold">
            🚀
          </span>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-300">Level 1 - Adventurer</p>
            <p className="text-[10px] text-slate-500 font-semibold">Start ticking habits to gain XP</p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:scale-[1.02] hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] transition-all duration-300"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </motion.div>
    </div>
  );
}
