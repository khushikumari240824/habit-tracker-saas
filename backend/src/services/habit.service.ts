import { and, eq } from "drizzle-orm";
import { db } from "../config/db";
import { habits } from "../db/schema";
import { CreateHabitInput, UpdateHabitInput } from "../validators/habit.validator";
import { AuthError } from "./auth.service";

export async function createHabit(userId: number, input: CreateHabitInput) {
  const [newHabit] = await db
    .insert(habits)
    .values({
      userId,
      name: input.name,
      description: input.description ?? null,
    })
    .returning();

  return newHabit;
}

export async function getHabitsForUser(userId: number) {
  return db.select().from(habits).where(eq(habits.userId, userId));
}

export async function getHabitById(userId: number, habitId: number) {
  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);

  if (!habit) {
    throw new AuthError("Habit not found", 404);
  }

  return habit;
}

export async function updateHabit(
  userId: number,
  habitId: number,
  input: UpdateHabitInput
) {
  // Ensure habit exists and belongs to this user
  await getHabitById(userId, habitId);

  const [updated] = await db
    .update(habits)
    .set(input)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .returning();

  return updated;
}

export async function deleteHabit(userId: number, habitId: number) {
  // Ensure habit exists and belongs to this user
  await getHabitById(userId, habitId);

  await db
    .delete(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)));

  return { id: habitId };
}