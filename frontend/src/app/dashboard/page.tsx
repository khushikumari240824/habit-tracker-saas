"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Habit } from "@/types/habit";
import { getHabits, createHabit, ApiError } from "@/lib/api";
import { getLocalDateString, getUser, clearAuth, isAuthenticated } from "@/lib/auth";
import HabitCard from "@/components/HabitCard";

export default function DashboardPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newHabitName, setNewHabitName] = useState("");
  const [creating, setCreating] = useState(false);

  const user = getUser();
  const today = getLocalDateString();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    loadHabits();
  }, []);

  async function loadHabits() {
    setLoading(true);
    setError(null);

    try {
      const res = await getHabits(today);
      setHabits(res.habits);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load habits");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const res = await createHabit({ name: newHabitName.trim() });
      setHabits((prev) => [...prev, { ...res.habit, completedToday: false }]);
      setNewHabitName("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create habit");
    } finally {
      setCreating(false);
    }
  }

  function handleUpdate(updated: Habit) {
    setHabits((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  }

  function handleDelete(id: number) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute -top-60 -left-60 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-80 -right-60 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="mx-auto max-w-3xl px-4 py-10 relative">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                My Dashboard
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-400 font-medium">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="rounded-lg bg-slate-900/60 border border-slate-800 px-3 py-1.5 font-medium text-slate-300">
              ⚡ {user?.name}
            </span>
            <Link
              href="/analytics"
              className="rounded-lg bg-indigo-600/10 border border-indigo-500/30 px-3 py-1.5 font-semibold text-indigo-400 transition-all duration-300 hover:bg-indigo-600/20 hover:text-indigo-300"
            >
              Analytics
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-slate-800/50 border border-slate-700/60 px-3 py-1.5 font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
            >
              Log out
            </button>
          </div>
        </header>

        {/* New Habit Form */}
        <form onSubmit={handleCreate} className="mb-8 flex gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/30 p-4 backdrop-blur-md">
          <input
            type="text"
            placeholder="Build a new habit (e.g. Read 10 pages, Meditate...)"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            className="flex-1 rounded-xl border border-slate-800/80 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
          />
          <button
            type="submit"
            disabled={creating || !newHabitName.trim()}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/10 hover:scale-[1.02] hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
          >
            {creating ? "Adding..." : "Add Habit"}
          </button>
        </form>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Completion Progress Bar */}
        {!loading && habits.length > 0 && (
          <div className="mb-8 rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 backdrop-blur-md shadow-md">
            <div className="mb-2.5 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-300">Today's Progress</span>
              <span className="font-bold text-indigo-400">
                {completedCount}/{totalCount} completed ({completionPercentage}%)
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-950">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Habits List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <svg className="h-8 w-8 animate-spin text-indigo-500 mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-medium">Loading your habits...</p>
          </div>
        ) : habits.length === 0 ? (
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/10 p-10 text-center backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900/80 border border-slate-800">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-slate-500" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-300">No habits yet</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Create your very first habit in the box above to begin tracking and build your streaks!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}