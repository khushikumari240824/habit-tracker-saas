"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  BarChart3,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plus,
  Play,
  Heart,
  ChevronDown,
  Sun,
  Moon
} from "lucide-react";
import { motion } from "framer-motion";
import { saveAuth } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("annually");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const initialTheme = (localStorage.getItem("theme_preference") as "dark" | "light") || "dark";
      setThemeState(initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setThemeState(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme_preference", nextTheme);
      if (nextTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }
  };

  // Quick Demo entry logic
  function handleViewDemo() {
    // Save dummy token and user credentials to auto-login
    saveAuth("demo-token", {
      id: 999,
      name: "Khushi Kumari (Demo)",
      email: "khushi@example.com",
      createdAt: new Date().toISOString(),
    });
    router.push("/dashboard");
  }

  const features = [
    {
      title: "Atomic Habit Tracking",
      desc: "Tick off habits in single clicks. Organize your daily actions with smooth transitions.",
      icon: CheckCircle2,
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Daily Streaks & Multipliers",
      desc: "Gamified streak counters with neon status visualizers. Build habits and stack XP rewards.",
      icon: Zap,
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "Progress Analytics & Charts",
      desc: "7-day average line charts, completion trends, and monthly breakdown summaries.",
      icon: BarChart3,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "GitHub Heatmaps",
      desc: "Grid matrix tracking your completion consistency over 365 days. Never break the chain.",
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Trophies & Milestones",
      desc: "Level up your profile. Earn achievement badges and progress level multipliers.",
      icon: Award,
      color: "from-rose-500 to-red-500",
    },
    {
      title: "Intelligent Insights",
      desc: "Automatic progress alerts generating written tips to optimize your routine.",
      icon: Sparkles,
      color: "from-indigo-500 to-purple-500",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Senior Software Architect",
      text: "The glassmorphic layout is absolutely beautiful. Tracking my technical writing streak on HabitFlow has completely reformed my evening routine.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    {
      name: "Alex Rivera",
      role: "Product Designer at Stripe",
      text: "HabitFlow feels like Linear met Notion. The dark theme is extremely premium, and the leveling system makes tracking habits actually fun.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
    {
      name: "David Kim",
      role: "Fitness Instructor",
      text: "I recommend HabitFlow to my clients. The visual analytics charts and weekly summary options make consistency straightforward to review.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    },
  ];

  const faqs = [
    {
      q: "How does the gamified XP level-up system work?",
      a: "Every time you log a completion, you gain +10 XP. Unlocking 100 XP triggers a Level Up, unlocking progress multipliers and achievement trophies visible on your dashboard.",
    },
    {
      q: "Can I use HabitFlow on my smartphone?",
      a: "Yes, HabitFlow is built with a mobile-first responsive layout, featuring collapsing side navigation and swipeable analytics tables designed to run smoothly on any modern device.",
    },
    {
      q: "Is there a limit to the number of habits I can track?",
      a: "The Free plan supports tracking up to 5 habits concurrently. Upgrading to the Pro version unlocks unlimited habits, deep yearly summaries, and priority email logs.",
    },
    {
      q: "How does the local database fallback function?",
      a: "If the backend database servers are offline, our frontend seamlessly switches to local sandboxed storage. Your credentials and habits stay secured directly in your browser's persistent registry.",
    },
  ];

  return (
    <div className="min-h-screen theme-bg theme-text overflow-x-hidden selection:bg-indigo-500/30">
      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-[500px] w-[500px] rounded-full bg-emerald-600/5 blur-[130px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-900/20 dark:border-slate-900/60 light:border-slate-200/80 z-55">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r dark:from-white dark:to-slate-300 light:from-slate-900 light:to-slate-700 bg-clip-text text-transparent">
            HabitFlow
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <a href="#features" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Pricing</a>
          <a href="#faqs" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">FAQs</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex h-10 w-10 items-center justify-center rounded-xl glass-input text-slate-400 hover:text-slate-200 transition-all duration-300"
          >
            {theme === "dark" ? (
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-indigo-400" />
            )}
          </button>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-900/40 hover:border-slate-200/60 dark:hover:border-slate-800 border border-transparent transition-all duration-300"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:scale-[1.02] hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative max-w-5xl mx-auto px-6 pt-20 pb-12 text-center z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 mb-6 text-xs font-semibold text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
          <Sparkles className="h-3.5 w-3.5 animate-spin" />
          Introducing HabitFlow 2.0
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-indigo-300 light:from-slate-900 light:via-slate-800 light:to-indigo-950 bg-clip-text text-transparent">
          Build Habits <br />That Last
        </h1>

        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Unlock your true productivity potential with daily streak tracking, interactive progress charts, and customized profile achievements in a premium glassmorphic dashboard.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/25 hover:scale-[1.02] hover:from-indigo-500 hover:to-purple-500 transition-all duration-300"
          >
            Get Started Free
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <button
            onClick={handleViewDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl glass-input px-7 py-3.5 text-sm font-bold text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300"
          >
            <Play className="h-4 w-4 text-indigo-400 fill-indigo-400/20" />
            View Live Demo
          </button>
        </div>
      </section>

      {/* DASHBOARD MOCKUP PREVIEW */}
      <section className="max-w-5xl mx-auto px-6 pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-2xl glass-card p-4 sm:p-6 shadow-[0_0_80px_rgba(99,102,241,0.15)] glow-border-indigo"
        >
          {/* Mockup Header bar */}
          <div className="flex items-center justify-between border-b border-slate-800/20 dark:border-slate-850 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="rounded-lg bg-slate-950/20 dark:bg-slate-950 border border-slate-800/20 dark:border-slate-850 px-8 py-1 text-[10px] font-semibold text-slate-500 tracking-wide">
              habitflow.saas/dashboard
            </div>
            <div className="h-3 w-3" />
          </div>

          {/* Dummy Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Left Col: Habits Summary */}
            <div className="sm:col-span-2 glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Today's Progress</p>
                  <p className="text-base font-bold text-slate-700 dark:text-slate-200 mt-0.5">3 of 4 completed (75%)</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-500/10 text-indigo-400">🔥 Level 2</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-900/20 dark:bg-slate-900 overflow-hidden mb-6">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 w-3/4 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              </div>

              {/* Mock Habits */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-100/80 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500 text-white text-[10px]">✓</div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Meditation & Breathing 🧘</p>
                      <p className="text-[10px] text-slate-500">10 mins mindfulness</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-450 border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 rounded-full">🔥 5 days</span>
                </div>
                <div className="flex items-center justify-between bg-slate-100/80 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500 text-white text-[10px]">✓</div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Read 15 Pages 📚</p>
                      <p className="text-[10px] text-slate-500">Design systems and system architecture</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-450 border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 rounded-full">🔥 3 days</span>
                </div>
                <div className="flex items-center justify-between bg-slate-100/80 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 rounded-lg p-3 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded border border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-950" />
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Drink 3L Water 💧</p>
                      <p className="text-[10px] text-slate-500">Hourly logs</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 rounded-full">— 0 days</span>
                </div>
              </div>
            </div>

            {/* Right Col: Stats */}
            <div className="flex flex-col gap-4">
              <div className="glass-card rounded-xl p-5 flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Consistency Velocity</p>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-indigo-400">89.2%</span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
                    <TrendingUp className="h-3 w-3 mr-0.5" /> +4.2%
                  </span>
                </div>
                <div className="mt-4 flex items-end gap-1 h-16 pl-1">
                  <div className="w-full bg-slate-800/20 dark:bg-slate-800 h-10 rounded-sm" />
                  <div className="w-full bg-slate-800/20 dark:bg-slate-800 h-12 rounded-sm" />
                  <div className="w-full bg-indigo-500/20 h-14 rounded-sm" />
                  <div className="w-full bg-indigo-500 h-16 rounded-sm shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                </div>
              </div>

              <div className="glass-card rounded-xl p-5">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Longest Streak</p>
                <p className="text-2xl font-extrabold text-amber-400 mt-2">12 Days</p>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">On Morning Meditation</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 border-t border-slate-900/10 dark:border-slate-900/80 light:border-slate-200/80 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r dark:from-white dark:to-slate-400 light:from-slate-900 light:to-slate-650 bg-clip-text text-transparent">
            Re-engineered Habit Building
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium">
            Designed for software developers, product designers, and creators who value professional analytics and atomic routines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl glass-card p-6 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_-8px_rgba(99,102,241,0.12)]"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feat.color} shadow-lg text-white mb-5`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-205 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                  {feat.title}
                </h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-slate-900/10 dark:border-slate-900/80 light:border-slate-200/80 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-200">
            Backed by Consistent Creators
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <div
              key={idx}
              className="rounded-2xl glass-card p-6 flex flex-col justify-between"
            >
              <p className="text-slate-650 dark:text-slate-350 text-sm leading-relaxed italic font-medium">
                "{test.text}"
              </p>
              <div className="flex items-center gap-3 mt-6 border-t border-slate-800/10 dark:border-slate-900/60 light:border-slate-200/60 pt-4">
                <img src={test.avatar} alt={test.name} className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{test.name}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-24 border-t border-slate-900/10 dark:border-slate-900/80 light:border-slate-200/80 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r dark:from-white dark:to-slate-400 light:from-slate-900 light:to-slate-650 bg-clip-text text-transparent">
            Honest, Simple Pricing
          </h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm font-medium">
            Start completely free. Upgrade anytime to level up your workflow.
          </p>

          {/* Pricing Toggle */}
          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-950/10 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 p-1 mt-8">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billingPeriod === "monthly" 
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-transparent" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annually")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingPeriod === "annually" 
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-transparent" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Annually
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-[9px] font-extrabold uppercase">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-4">
          {/* Free Card */}
          <div className="rounded-2xl glass-card p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Base Tier</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-2">Free Sandbox</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5">For core accountability habits.</p>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">$0</span>
                <span className="text-xs text-slate-500">/ forever</span>
              </div>

              <ul className="space-y-3 mt-8 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-450 dark:text-indigo-400" /> Up to 5 Active Habits</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-455 dark:text-indigo-400" /> Heatmap & Calendar View</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-455 dark:text-indigo-400" /> Standard Level Rewards (XP)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-455 dark:text-indigo-400" /> Localstorage Fallback Database</li>
              </ul>
            </div>
            
            <Link
              href="/register"
              className="mt-8 block w-full rounded-xl glass-input py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Pro Card */}
          <div className="relative rounded-2xl border-2 border-indigo-500 glass-card p-8 shadow-2xl flex flex-col justify-between shadow-indigo-500/10">
            <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-[10px] font-extrabold text-white uppercase tracking-wider shadow">
              Most Popular
            </span>
            <div>
              <p className="text-xs font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Premium Tier</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-2">HabitFlow Pro</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5">For individuals optimizing daily performance.</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                  {billingPeriod === "annually" ? "$8" : "$10"}
                </span>
                <span className="text-xs text-slate-500">/ user / month</span>
              </div>

              <ul className="space-y-3 mt-8 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> **Unlimited** Habits tracking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> Automatic Progress Insights panel</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> Premium Trophy unlock rewards</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> Weekly summary email reports</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> Priority API sync latency support</li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-8 block w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-center text-xs font-bold text-white shadow-lg hover:scale-[1.02] transition-all"
            >
              Get Pro Access
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faqs" className="max-w-3xl mx-auto px-6 py-20 border-t border-slate-900/10 dark:border-slate-900/80 light:border-slate-200/80 relative z-10">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-center text-slate-800 dark:text-slate-200 mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${openFaq === idx ? "rotate-180 text-indigo-500 dark:text-indigo-400" : ""}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold border-t border-slate-800/10 dark:border-slate-900/40 light:border-slate-200/60 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900/15 dark:border-slate-900/80 light:border-slate-200 bg-slate-950/5 dark:bg-black backdrop-blur-md py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-350">HabitFlow SaaS</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-350 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-350 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-350 transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
