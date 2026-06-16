"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Habit } from "@/types/habit";
import { getHabits, createHabit, updateHabit, ApiError } from "@/lib/api";
import { getLocalDateString, getUser, isAuthenticated } from "@/lib/auth";
import HabitCard from "@/components/HabitCard";
import AppLayout from "@/components/AppLayout";
import {
  Plus,
  TrendingUp,
  Flame,
  Award,
  CheckCircle,
  X,
  PlusCircle,
  Sparkles
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeEditHabit, setActiveEditHabit] = useState<Habit | null>(null);

  // Form inputs
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDesc, setNewHabitDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const [editHabitName, setEditHabitName] = useState("");
  const [editHabitDesc, setEditHabitDesc] = useState("");
  const [updating, setUpdating] = useState(false);

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
      const res = await createHabit({
        name: newHabitName.trim(),
        description: newHabitDesc.trim() || undefined,
      });
      setHabits((prev) => [...prev, { ...res.habit, completedToday: false }]);
      
      // Reset form
      setNewHabitName("");
      setNewHabitDesc("");
      setCreateModalOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create habit");
    } finally {
      setCreating(false);
    }
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!activeEditHabit || !editHabitName.trim()) return;

    setUpdating(true);
    setError(null);
    try {
      const res = await updateHabit(activeEditHabit.id, {
        name: editHabitName.trim(),
        description: editHabitDesc.trim() || "",
      });
      setHabits((prev) =>
        prev.map((h) =>
          h.id === activeEditHabit.id
            ? { ...h, name: res.habit.name, description: res.habit.description }
            : h
        )
      );
      setEditModalOpen(false);
      setActiveEditHabit(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update habit");
    } finally {
      setUpdating(false);
    }
  }

  function handleUpdate(updated: Habit) {
    setHabits((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  }

  function handleDelete(id: number) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  function openEditModal(habit: Habit) {
    setActiveEditHabit(habit);
    setEditHabitName(habit.name);
    setEditHabitDesc(habit.description || "");
    setEditModalOpen(true);
  }

  // Calculate dynamic greeting
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  // Stats calculation
  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  const activeStreaksCount = habits.filter((h) => h.currentStreak > 0).length;
  const longestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.longestStreak)) : 0;

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900/60 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                {getGreeting()}, {user?.name.split(" ")[0] || "Khushi"}!
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-400 font-medium">
              Ready to focus and level up your streaks today?
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:scale-[1.02] hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            Add New Habit
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Stats Cards Section */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Total Habits"
            value={totalCount}
            icon={<CheckCircle className="h-5 w-5 text-indigo-400" />}
            subtitle="Registered items"
          />
          <StatCard
            label="Active Streaks"
            value={activeStreaksCount}
            icon={<Flame className="h-5 w-5 text-amber-500" />}
            subtitle="Active multipliers"
          />
          <StatCard
            label="Longest Streak"
            value={longestStreak}
            icon={<Award className="h-5 w-5 text-rose-400" />}
            subtitle="Personal record"
          />
          <StatCard
            label="Completion Rate"
            value={`${completionPercentage}%`}
            icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
            subtitle="Today's velocity"
          />
        </div>

        {/* Today's Progress Bar */}
        {!loading && habits.length > 0 && (
          <div className="rounded-2xl border border-slate-900 bg-slate-900/15 p-5 backdrop-blur-md">
            <div className="mb-2.5 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-300">Today's Habit Checklist</span>
              <span className="font-extrabold text-indigo-400">
                {completedCount}/{totalCount} Done ({completionPercentage}%)
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-950">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shadow-[0_0_12px_rgba(99,102,241,0.55)] transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Habits Checklist */}
        <div>
          <h2 className="text-xs font-extrabold text-slate-400 tracking-wider uppercase mb-4">
            Daily Routines
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 rounded-2xl border border-slate-900 bg-slate-950/20 animate-pulse" />
              ))}
            </div>
          ) : habits.length === 0 ? (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/10 p-10 text-center backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900/80 border border-slate-800">
                <PlusCircle className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-350">No habits tracked yet</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-semibold">
                Start your journey by adding a customized habit like "Drink Water", "Read books", or "Gym training".
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="mt-5 rounded-xl bg-indigo-600/10 border border-indigo-500/30 px-5 py-2.5 text-xs font-bold text-indigo-400 hover:bg-indigo-650 hover:text-indigo-300 transition-all"
              >
                Create First Habit
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />
          
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl z-10">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-slate-200">Create New Habit</h3>
              </div>
              <p className="text-xs text-slate-500 font-semibold">Add a routine to track consistency and unlock badge rewards</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-400">Habit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 15 pages, Workout..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-400">Description (Optional)</label>
                <textarea
                  placeholder="Details to motivate you"
                  value={newHabitDesc}
                  onChange={(e) => setNewHabitDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={creating || !newHabitName.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:scale-[1.01] hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-55"
              >
                {creating ? "Adding routine..." : "Add Habit"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && activeEditHabit && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setEditModalOpen(false); setActiveEditHabit(null); }} />
          
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl z-10">
            <button
              onClick={() => { setEditModalOpen(false); setActiveEditHabit(null); }}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-200">Edit Habit Details</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Modify settings for {activeEditHabit.name}</p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-400">Habit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 15 pages"
                  value={editHabitName}
                  onChange={(e) => setEditHabitName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-400">Description</label>
                <textarea
                  placeholder="Details"
                  value={editHabitDesc}
                  onChange={(e) => setEditHabitDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={updating || !editHabitName.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:scale-[1.01] hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-55"
              >
                {updating ? "Saving adjustments..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function StatCard({ label, value, icon, subtitle }: { label: string; value: number | string; icon: React.ReactNode; subtitle: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/25 p-5 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-slate-800 hover:shadow-[0_8px_20px_-8px_rgba(99,102,241,0.1)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">{label}</span>
        {icon}
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight transition-transform duration-300 group-hover:scale-105 origin-left">
        {value}
      </p>
      <span className="text-[9px] text-slate-600 font-bold block mt-1 tracking-wider uppercase">{subtitle}</span>
    </div>
  );
}