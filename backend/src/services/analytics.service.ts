import { and, eq, gte, inArray } from "drizzle-orm";
import { db } from "../config/db";
import { habits, habitLogs } from "../db/schema";
import { getPreviousDateString } from "../utils/date";

/**
 * Returns a heatmap-ready dataset: for each date in the lookback window,
 * how many of the user's habits were completed.
 *
 * Output shape: [{ date: "2026-06-15", count: 3 }, ...]
 * `count` can be used directly to control heatmap shading intensity.
 */
export async function getHeatmapData(userId: number, days: number = 365) {
  // Get all habit ids belonging to this user
  const userHabits = await db
    .select({ id: habits.id })
    .from(habits)
    .where(eq(habits.userId, userId));

  const habitIds = userHabits.map((h) => h.id);

  if (habitIds.length === 0) {
    return [];
  }

  // Compute the cutoff date (oldest date in the window)
  let cutoff = new Date().toISOString().split("T")[0];
  for (let i = 0; i < days; i++) {
    cutoff = getPreviousDateString(cutoff);
  }

  const logs = await db
    .select({
      completedDate: habitLogs.completedDate,
      habitId: habitLogs.habitId,
    })
    .from(habitLogs)
    .where(
      and(
        inArray(habitLogs.habitId, habitIds),
        gte(habitLogs.completedDate, cutoff)
      )
    );

  // Aggregate: date -> count of habits completed that day
  const countsByDate = new Map<string, number>();

  for (const log of logs) {
    countsByDate.set(
      log.completedDate,
      (countsByDate.get(log.completedDate) ?? 0) + 1
    );
  }

  return Array.from(countsByDate.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/**
 * Returns simple summary stats for the analytics dashboard:
 * total habits, total completions, average current streak, longest streak overall.
 */
export async function getSummaryStats(userId: number) {
  const userHabits = await db
    .select()
    .from(habits)
    .where(eq(habits.userId, userId));

  if (userHabits.length === 0) {
    return {
      totalHabits: 0,
      totalCompletions: 0,
      averageCurrentStreak: 0,
      longestStreakOverall: 0,
    };
  }

  const habitIds = userHabits.map((h) => h.id);

  const logs = await db
    .select({ id: habitLogs.id })
    .from(habitLogs)
    .where(inArray(habitLogs.habitId, habitIds));

  const totalCurrentStreak = userHabits.reduce(
    (sum, h) => sum + h.currentStreak,
    0
  );

  const longestStreakOverall = userHabits.reduce(
    (max, h) => Math.max(max, h.longestStreak),
    0
  );

  return {
    totalHabits: userHabits.length,
    totalCompletions: logs.length,
    averageCurrentStreak:
      Math.round((totalCurrentStreak / userHabits.length) * 10) / 10,
    longestStreakOverall,
  };
}