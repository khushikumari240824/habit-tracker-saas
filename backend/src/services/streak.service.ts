import { and, desc, eq } from "drizzle-orm";
import { db } from "../config/db";
import { habits, habitLogs } from "../db/schema";
import { AuthError } from "./auth.service";
import {
  getPreviousDateString,
  compareDateStrings,
} from "../utils/date";

export async function toggleHabitLog(
  userId: number,
  habitId: number,
  dateStr: string
) {
  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);

  if (!habit) {
    throw new AuthError("Habit not found", 404);
  }

  const [existingLog] = await db
    .select()
    .from(habitLogs)
    .where(
      and(eq(habitLogs.habitId, habitId), eq(habitLogs.completedDate, dateStr))
    )
    .limit(1);

  let completed: boolean;

  if (existingLog) {
    await db.delete(habitLogs).where(eq(habitLogs.id, existingLog.id));
    completed = false;
  } else {
    await db.insert(habitLogs).values({
      habitId,
      completedDate: dateStr,
    });
    completed = true;
  }

  const { currentStreak, longestStreak } = await recalculateStreaks(
    habitId,
    dateStr
  );

  const [updatedHabit] = await db
    .update(habits)
    .set({ currentStreak, longestStreak })
    .where(eq(habits.id, habitId))
    .returning();

  return { habit: updatedHabit, completed };
}

export async function recalculateStreaks(
  habitId: number,
  today: string
) {
  const logs = await db
    .select({ completedDate: habitLogs.completedDate })
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId))
    .orderBy(desc(habitLogs.completedDate));

  const completedDates = new Set(logs.map((log) => log.completedDate));

  let currentStreak = 0;
  let cursor = today;

  if (!completedDates.has(today)) {
    const yesterday = getPreviousDateString(today);

    if (completedDates.has(yesterday)) {
      cursor = yesterday;
    } else {
      cursor = "";
    }
  }

  if (cursor) {
    while (completedDates.has(cursor)) {
      currentStreak++;
      cursor = getPreviousDateString(cursor);
    }
  }

  const sortedDates = [...completedDates].sort(compareDateStrings);

  let longestStreak = 0;
  let runLength = 0;
  let previousDate: string | null = null;

  for (const dateStr of sortedDates) {
    if (
      previousDate &&
      getPreviousDateString(dateStr) === previousDate
    ) {
      runLength++;
    } else {
      runLength = 1;
    }

    if (runLength > longestStreak) {
      longestStreak = runLength;
    }

    previousDate = dateStr;
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
}

export async function getLogsForHabit(
  userId: number,
  habitId: number
) {
  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);

  if (!habit) {
    throw new AuthError("Habit not found", 404);
  }

  return db
    .select({ completedDate: habitLogs.completedDate })
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId))
    .orderBy(desc(habitLogs.completedDate));
}