"use client";

import { useState } from "react";
import { Habit } from "@/types/habit";
import { toggleHabitLog, deleteHabit } from "@/lib/api";
import { getLocalDateString } from "@/lib/auth";
import StreakBadge from "./StreakBadge";

interface HabitCardProps {
  habit: Habit;
  onUpdate: (habit: Habit) => void;
  onDelete: (id: number) => void;
  onEdit?: (habit: Habit) => void;
}

export default function HabitCard({ habit, onUpdate, onDelete, onEdit }: HabitCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setLoading(true);
    setError(null);

    try {
      const today = getLocalDateString();
      const result = await toggleHabitLog(habit.id, today);

      onUpdate({
        ...result.habit,
        completedToday: result.completed,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update habit");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${habit.name}"? This cannot be undone.`)) return;

    setLoading(true);
    setError(null);

    try {
      await deleteHabit(habit.id);
      onDelete(habit.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete habit");
      setLoading(false);
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl glass-card p-5 shadow-lg shadow-black/20 hover:-translate-y-0.5 hover:border-indigo-500/30 hover:shadow-[0_12px_30px_-8px_rgba(99,102,241,0.15)] active:scale-[0.99] transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggle}
            disabled={loading}
            aria-label={habit.completedToday ? "Mark incomplete" : "Mark complete"}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300 ${
              habit.completedToday
                ? "border-emerald-500/80 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)] scale-105"
                : "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950/40 hover:border-indigo-500/80 light:hover:bg-slate-200 dark:hover:bg-slate-950/80"
            } ${loading ? "opacity-50" : ""}`}
          >
            {habit.completedToday ? (
              <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" stroke="currentColor" strokeWidth={3.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <div className="h-1.5 w-1.5 rounded-full bg-transparent group-hover:bg-indigo-500/50 transition-all duration-300" />
            )}
          </button>

          <div>
            <p className={`font-semibold text-base transition-all duration-300 ${
              habit.completedToday ? "text-slate-400 line-through decoration-slate-600/60" : "theme-text"
            }`}>
              {habit.name}
            </p>
            {habit.description && (
              <p className="mt-0.5 text-xs theme-text-muted font-normal">{habit.description}</p>
            )}
            {error && <p className="mt-1 text-xs font-medium text-red-400">{error}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-0.5">
            <StreakBadge streak={habit.currentStreak} />
            {habit.longestStreak > 0 && (
              <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase pr-1">
                Best: {habit.longestStreak} days
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(habit)}
                disabled={loading}
                aria-label="Edit habit"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all duration-200"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}

            <button
              onClick={handleDelete}
              disabled={loading}
              aria-label="Delete habit"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-205"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}