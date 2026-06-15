import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  date,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ----------------------
// USERS TABLE
// ----------------------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------
// HABITS TABLE
// ----------------------
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------
// HABIT LOGS TABLE
// ----------------------
export const habitLogs = pgTable(
  "habit_logs",
  {
    id: serial("id").primaryKey(),
    habitId: integer("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    completedDate: date("completed_date").notNull(), // stored as YYYY-MM-DD string
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Prevent duplicate check-ins for the same habit on the same day
      habitDateUnique: uniqueIndex("habit_date_unique_idx").on(
        table.habitId,
        table.completedDate
      ),
    };
  }
);

// ----------------------
// RELATIONS
// ----------------------
export const usersRelations = relations(users, ({ many }) => ({
  habits: many(habits),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
  logs: many(habitLogs),
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  habit: one(habits, {
    fields: [habitLogs.habitId],
    references: [habits.id],
  }),
}));