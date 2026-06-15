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
}

export default function HabitCard({ habit, onUpdate, onDelete }: HabitCardProps) {
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
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          disabled={loading}
          aria-label={habit.completedToday ? "Mark incomplete" : "Mark complete"}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
            habit.completedToday
              ? "border-green-500 bg-green-500 text-white"
              : "border-gray-300 bg-white hover:border-green-400"
          } ${loading ? "opacity-50" : ""}`}
        >
          {habit.completedToday && (
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div>
          <p className="font-medium text-gray-900">{habit.name}</p>
          {habit.description && (
            <p className="text-sm text-gray-500">{habit.description}</p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <StreakBadge streak={habit.currentStreak} />
        <button
          onClick={handleDelete}
          disabled={loading}
          aria-label="Delete habit"
          className="text-gray-400 hover:text-red-500"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}