"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HeatmapEntry, SummaryStats } from "@/types/habit";
import { getHeatmap, getSummary, ApiError } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import HeatmapCalendar from "@/components/HeatmapCalendar";
import ProgressChart from "@/components/ProgressChart";

export default function AnalyticsPage() {
  const router = useRouter();
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [heatmapRes, summaryRes] = await Promise.all([
        getHeatmap(365),
        getSummary(),
      ]);

      setHeatmap(heatmapRes.heatmap);
      setStats(summaryRes.stats);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute -top-60 -left-60 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-40 -right-60 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 py-10 relative">
        <header className="mb-10 flex items-center justify-between border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                Analytics Report
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-400 font-medium">Deep dive into your habits and streaks</p>
          </div>
          
          <Link
            href="/dashboard"
            className="rounded-lg bg-slate-900/60 border border-slate-800 px-4 py-2 font-semibold text-slate-300 transition-all duration-300 hover:bg-slate-800 hover:text-slate-100 flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </Link>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500">
            <svg className="h-8 w-8 animate-spin text-emerald-500 mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-medium">Aggregating statistics...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        ) : (
          <div className="space-y-8">
            {stats && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Active Habits" value={stats.totalHabits} icon="📊" color="text-indigo-400" />
                <StatCard label="Total Logged" value={stats.totalCompletions} icon="✅" color="text-emerald-400" />
                <StatCard label="Avg Streak" value={stats.averageCurrentStreak} icon="🔥" color="text-amber-400" />
                <StatCard label="Max Streak" value={stats.longestStreakOverall} icon="🏆" color="text-rose-400" />
              </div>
            )}

            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-6 backdrop-blur-md shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-200 tracking-wide uppercase">
                  Habit Heatmap (Yearly)
                </h2>
                <span className="text-xs text-slate-500 font-semibold">Hover squares for details</span>
              </div>
              <HeatmapCalendar data={heatmap} weeks={52} />
            </section>

            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-6 backdrop-blur-md shadow-md">
              <h2 className="mb-4 text-base font-bold text-slate-200 tracking-wide uppercase">
                Activity Speed (Last 30 Days)
              </h2>
              <ProgressChart data={heatmap} days={30} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-slate-700/60 hover:shadow-[0_8px_20px_-8px_rgba(99,102,241,0.15)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">{label}</span>
        <span className="text-base" role="img" aria-label={label}>
          {icon}
        </span>
      </div>
      <p className={`text-3xl font-extrabold ${color} tracking-tight transition-transform duration-300 group-hover:scale-105 origin-left`}>
        {value}
      </p>
    </div>
  );
}