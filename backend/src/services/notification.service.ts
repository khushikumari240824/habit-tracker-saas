import { and, eq, gte, inArray } from "drizzle-orm";
import { db } from "../config/db";
import { habitLogs, habits, users } from "../db/schema";
import { getPreviousDateString } from "../utils/date";
import type {
  NotificationPreferencesInput,
  UpdateNotificationPreferencesInput,
} from "../validators/notification.validator";

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferencesInput = {
  inAppAlerts: true,
  browserNotifications: false,
  streakAlerts: true,
  dailyReminders: true,
  weeklyDigest: true,
  lastWeeklyDigestKey: null,
};

const DIGEST_HOUR = Number.parseInt(process.env.WEEKLY_DIGEST_HOUR ?? "20", 10);
const DIGEST_FROM = process.env.SMTP_FROM ?? "HabitFlow <no-reply@habitflow.local>";

type DigestRecipient = {
  id: number;
  name: string;
  email: string;
  notificationPreferences: NotificationPreferencesInput;
};

type DigestSummary = {
  totalHabits: number;
  completionsLast7Days: number;
  averageCurrentStreak: number;
  longestStreakOverall: number;
  strongestHabit: string | null;
  streakRiskHabits: Array<{ name: string; currentStreak: number }>;
  completionByHabit: Array<{ name: string; completions: number }>;
};

function normalizePreferences(
  value: Partial<NotificationPreferencesInput> | null | undefined
): NotificationPreferencesInput {
  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(value ?? {}),
    lastWeeklyDigestKey: value?.lastWeeklyDigestKey ?? null,
  };
}

function isValidNotificationPreferences(
  value: unknown
): value is NotificationPreferencesInput {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as NotificationPreferencesInput).inAppAlerts === "boolean" &&
      typeof (value as NotificationPreferencesInput).browserNotifications === "boolean" &&
      typeof (value as NotificationPreferencesInput).streakAlerts === "boolean" &&
      typeof (value as NotificationPreferencesInput).dailyReminders === "boolean" &&
      typeof (value as NotificationPreferencesInput).weeklyDigest === "boolean"
  );
}

function getDigestWeekKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function getDigestDateWindow() {
  const today = new Date().toISOString().split("T")[0];
  let cutoff = today;

  for (let i = 0; i < 6; i += 1) {
    cutoff = getPreviousDateString(cutoff);
  }

  return { cutoff, today };
}

async function getRecipient(userId: number): Promise<DigestRecipient | null> {
  const [recipient] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      notificationPreferences: users.notificationPreferences,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!recipient) return null;

  return {
    ...recipient,
    notificationPreferences: normalizePreferences(
      isValidNotificationPreferences(recipient.notificationPreferences)
        ? recipient.notificationPreferences
        : null
    ),
  };
}

export async function getNotificationPreferences(userId: number) {
  const recipient = await getRecipient(userId);
  return recipient?.notificationPreferences ?? DEFAULT_NOTIFICATION_PREFERENCES;
}

export async function updateNotificationPreferences(
  userId: number,
  input: UpdateNotificationPreferencesInput
) {
  const current = await getNotificationPreferences(userId);
  const next = normalizePreferences({ ...current, ...input });

  const [updated] = await db
    .update(users)
    .set({ notificationPreferences: next })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      notificationPreferences: users.notificationPreferences,
    });

  return normalizePreferences(
    isValidNotificationPreferences(updated.notificationPreferences)
      ? updated.notificationPreferences
      : null
  );
}

async function buildDigestSummary(userId: number): Promise<DigestSummary> {
  const userHabits = await db
    .select()
    .from(habits)
    .where(eq(habits.userId, userId));

  if (userHabits.length === 0) {
    return {
      totalHabits: 0,
      completionsLast7Days: 0,
      averageCurrentStreak: 0,
      longestStreakOverall: 0,
      strongestHabit: null,
      streakRiskHabits: [],
      completionByHabit: [],
    };
  }

  const habitIds = userHabits.map((habit) => habit.id);
  const { cutoff } = getDigestDateWindow();

  const recentLogs = await db
    .select({ habitId: habitLogs.habitId, completedDate: habitLogs.completedDate })
    .from(habitLogs)
    .where(and(inArray(habitLogs.habitId, habitIds), gte(habitLogs.completedDate, cutoff)));

  const completionCounts = new Map<number, number>();
  for (const habitId of habitIds) {
    completionCounts.set(habitId, 0);
  }

  for (const log of recentLogs) {
    completionCounts.set(log.habitId, (completionCounts.get(log.habitId) ?? 0) + 1);
  }

  const completionByHabit = userHabits
    .map((habit) => ({
      name: habit.name,
      completions: completionCounts.get(habit.id) ?? 0,
    }))
    .sort((left, right) => right.completions - left.completions)
    .slice(0, 3);

  const strongestHabit = completionByHabit[0]?.name ?? null;

  return {
    totalHabits: userHabits.length,
    completionsLast7Days: recentLogs.length,
    averageCurrentStreak:
      Math.round(
        (userHabits.reduce((sum, habit) => sum + habit.currentStreak, 0) /
          userHabits.length) *
          10
      ) / 10,
    longestStreakOverall: userHabits.reduce(
      (max, habit) => Math.max(max, habit.longestStreak),
      0
    ),
    strongestHabit,
    streakRiskHabits: userHabits
      .filter((habit) => habit.isActive && habit.currentStreak > 0)
      .sort((left, right) => right.currentStreak - left.currentStreak)
      .slice(0, 3)
      .map((habit) => ({
        name: habit.name,
        currentStreak: habit.currentStreak,
      })),
    completionByHabit,
  };
}

function buildDigestEmail(recipient: DigestRecipient, summary: DigestSummary) {
  const topHabitText = summary.strongestHabit
    ? `Your strongest habit this week was ${summary.strongestHabit}.`
    : "You did not complete any habits this week yet.";

  const riskText =
    summary.streakRiskHabits.length > 0
      ? summary.streakRiskHabits
          .map((habit) => `${habit.name} (${habit.currentStreak}-day streak)`)
          .join(", ")
      : "No active streaks are currently at risk.";

  const subject = `Your weekly HabitFlow digest`;
  const text = [
    `Hi ${recipient.name},`,
    "",
    "Here is your weekly HabitFlow summary:",
    `- Total habits: ${summary.totalHabits}`,
    `- Completions in the last 7 days: ${summary.completionsLast7Days}`,
    `- Average current streak: ${summary.averageCurrentStreak}`,
    `- Longest streak overall: ${summary.longestStreakOverall}`,
    `- ${topHabitText}`,
    `- Streaks to watch: ${riskText}`,
    "",
    "Keep going. Small consistent actions compound quickly.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#e2e8f0;background:#0f172a;padding:24px;border-radius:16px">
      <h2 style="margin:0 0 16px;color:#a5b4fc">Your weekly HabitFlow digest</h2>
      <p style="margin:0 0 16px">Hi ${recipient.name}, here is your weekly progress snapshot.</p>
      <ul style="padding-left:20px;margin:0 0 16px">
        <li>Total habits: ${summary.totalHabits}</li>
        <li>Completions in the last 7 days: ${summary.completionsLast7Days}</li>
        <li>Average current streak: ${summary.averageCurrentStreak}</li>
        <li>Longest streak overall: ${summary.longestStreakOverall}</li>
      </ul>
      <p style="margin:0 0 12px"><strong>Strongest habit:</strong> ${summary.strongestHabit ?? "No completions yet"}</p>
      <p style="margin:0 0 12px"><strong>Streaks to watch:</strong> ${riskText}</p>
      <p style="margin:0">Keep going. Small consistent actions compound quickly.</p>
    </div>
  `;

  return { subject, text, html };
}

async function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  try {
    const nodemailerModule = await import("nodemailer");
    const nodemailer = nodemailerModule.default ?? nodemailerModule;

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } catch (error) {
    console.warn("[digest-email] Nodemailer is unavailable, skipping email delivery", {
      error,
    });
    return null;
  }
}

async function sendEmail(to: string, subject: string, text: string, html: string) {
  const transporter = await createTransport();

  if (!transporter) {
    console.log("[digest-email] SMTP not configured, skipping send", { to, subject, text });
    return { sent: false };
  }

  await transporter.sendMail({
    from: DIGEST_FROM,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
}

export async function sendWeeklyDigestForUser(userId: number) {
  const recipient = await getRecipient(userId);
  if (!recipient) return { sent: false, skipped: true, reason: "user-not-found" };

  const preferences = recipient.notificationPreferences;
  if (!preferences.weeklyDigest) {
    return { sent: false, skipped: true, reason: "disabled" };
  }

  const summary = await buildDigestSummary(userId);
  const body = buildDigestEmail(recipient, summary);
  const result = await sendEmail(recipient.email, body.subject, body.text, body.html);

  return { sent: result.sent, skipped: false, summary };
}

export async function runWeeklyDigestSweep(now = new Date()) {
  const digestDay = 0;

  if (now.getDay() !== digestDay || now.getHours() !== DIGEST_HOUR) {
    return { ran: false, sent: 0 };
  }

  const digestKey = getDigestWeekKey(now);
  const recipients = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      notificationPreferences: users.notificationPreferences,
    })
    .from(users);

  let sent = 0;

  for (const recipient of recipients) {
    const preferences = normalizePreferences(
      isValidNotificationPreferences(recipient.notificationPreferences)
        ? recipient.notificationPreferences
        : null
    );

    if (!preferences.weeklyDigest || preferences.lastWeeklyDigestKey === digestKey) {
      continue;
    }

    const result = await sendWeeklyDigestForUser(recipient.id);
    if (result.sent) {
      await db
        .update(users)
        .set({
          notificationPreferences: {
            ...preferences,
            lastWeeklyDigestKey: digestKey,
          },
        })
        .where(eq(users.id, recipient.id));
      sent += 1;
    }
  }

  return { ran: true, sent };
}