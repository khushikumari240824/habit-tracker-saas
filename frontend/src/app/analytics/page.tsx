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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </header>

      {loading ? (
        <p className="text-gray-500">Loading analytics...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <div className="space-y-8">
          {stats && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Active Habits" value={stats.totalHabits} />
              <StatCard label="Total Completions" value={stats.totalCompletions} />
              <StatCard label="Avg Current Streak" value={stats.averageCurrentStreak} />
              <StatCard label="Longest Streak" value={stats.longestStreakOverall} />
            </div>
          )}

          <section>
            <h2 className="mb-3 text-sm font-medium text-gray-700">
              Contribution Calendar
            </h2>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <HeatmapCalendar data={heatmap} weeks={52} />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-medium text-gray-700">
              Progress (Last 30 Days)
            </h2>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <ProgressChart data={heatmap} days={30} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}