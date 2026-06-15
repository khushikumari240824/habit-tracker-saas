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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Today</h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/analytics" className="text-sm text-blue-600 hover:underline">
            Analytics
          </Link>
          <span className="text-sm text-gray-500">{user?.name}</span>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">
            Log out
          </button>
        </div>
      </header>

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="New habit (e.g. Read 10 pages)"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={creating || !newHabitName.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading habits...</p>
      ) : habits.length === 0 ? (
        <p className="text-gray-500">No habits yet. Add one above to get started.</p>
      ) : (
        <div className="space-y-3">
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
  );
}