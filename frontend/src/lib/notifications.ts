import type { Habit } from "@/types/habit";

export type NotificationType = "success" | "warning" | "info";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  dedupeKey: string;
  habitId?: number;
}

export interface NotificationPreferences {
  inAppAlerts: boolean;
  browserNotifications: boolean;
  streakAlerts: boolean;
  dailyReminders: boolean;
  weeklyDigest: boolean;
}

const NOTIFICATIONS_KEY = "habitflow_notifications";
const NOTIFICATION_PREFERENCES_KEY = "habitflow_notification_preferences";
const NOTIFICATION_EVENT = "habitflow:notifications-updated";
const PREFERENCES_EVENT = "habitflow:notification-preferences-updated";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  inAppAlerts: true,
  browserNotifications: false,
  streakAlerts: true,
  dailyReminders: true,
  weeklyDigest: false,
};

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;

  const value = window.localStorage.getItem(key);
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function emitChange(eventName: string) {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(eventName));
}

export function getNotificationPreferences(): NotificationPreferences {
  return readJson(NOTIFICATION_PREFERENCES_KEY, DEFAULT_PREFERENCES);
}

export function setNotificationPreferences(nextPreferences: NotificationPreferences) {
  writeJson(NOTIFICATION_PREFERENCES_KEY, nextPreferences);
  emitChange(PREFERENCES_EVENT);
}

export function getNotifications(): AppNotification[] {
  const notifications = readJson<AppNotification[]>(NOTIFICATIONS_KEY, []);
  return notifications.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export function setNotifications(notifications: AppNotification[]) {
  writeJson(NOTIFICATIONS_KEY, notifications.slice(0, 20));
  emitChange(NOTIFICATION_EVENT);
}

export function markNotificationsRead() {
  const notifications = getNotifications().map((notification) => ({
    ...notification,
    read: true,
  }));
  setNotifications(notifications);
}

function notifyBrowser(notification: AppNotification) {
  if (!isBrowser()) return;

  const preferences = getNotificationPreferences();
  if (!preferences.browserNotifications) return;
  if (typeof window.Notification === "undefined") return;
  if (window.Notification.permission !== "granted") return;

  new window.Notification(notification.title, {
    body: notification.message,
    tag: notification.dedupeKey,
  });
}

export async function requestBrowserNotificationPermission() {
  if (!isBrowser() || typeof window.Notification === "undefined") {
    return "unsupported" as const;
  }

  return window.Notification.requestPermission();
}

export function buildCompletionNotification(habit: Habit, date: string) {
  return {
    id: `${habit.id}-${date}-completed`,
    type: "success" as const,
    title: "Habit completed",
    message: `${habit.name} was marked complete for ${date}.`,
    createdAt: new Date().toISOString(),
    read: false,
    dedupeKey: `completed-${habit.id}-${date}`,
    habitId: habit.id,
  } satisfies AppNotification;
}

export function buildStreakNotifications(habits: Habit[], currentDate = new Date()) {
  const preferences = getNotificationPreferences();
  if (!preferences.inAppAlerts || !preferences.streakAlerts) return [];

  const dateKey = currentDate.toISOString().split("T")[0];

  return habits
    .filter((habit) => habit.isActive && habit.currentStreak > 0 && !habit.completedToday)
    .map((habit) => ({
      id: `${habit.id}-${dateKey}-streak-risk`,
      type: "warning" as const,
      title: "Streak at risk",
      message: `${habit.name} has a ${habit.currentStreak}-day streak. Finish it today to keep the chain alive.`,
      createdAt: new Date().toISOString(),
      read: false,
      dedupeKey: `streak-risk-${habit.id}-${dateKey}`,
      habitId: habit.id,
    } satisfies AppNotification));
}

export function buildDailyReminderNotification(habits: Habit[], currentDate = new Date()) {
  const preferences = getNotificationPreferences();
  if (!preferences.inAppAlerts || !preferences.dailyReminders) return [];

  const hour = currentDate.getHours();
  if (hour < 18) return [];

  const incompleteHabits = habits.filter((habit) => habit.isActive && !habit.completedToday);

  if (incompleteHabits.length === 0) return [];

  const dateKey = currentDate.toISOString().split("T")[0];

  return [
    {
      id: `${dateKey}-daily-reminder`,
      type: "info" as const,
      title: "Evening reminder",
      message: `${incompleteHabits.length} habit${incompleteHabits.length === 1 ? " is" : "s are"} still incomplete today.`,
      createdAt: new Date().toISOString(),
      read: false,
      dedupeKey: `daily-reminder-${dateKey}`,
    } satisfies AppNotification,
  ];
}

export function syncNotificationCenter(habits: Habit[]) {
  const preferences = getNotificationPreferences();
  if (!preferences.inAppAlerts) return [] as AppNotification[];

  const notifications = [
    ...buildStreakNotifications(habits),
    ...buildDailyReminderNotification(habits),
  ];

  if (notifications.length === 0) {
    return getNotifications();
  }

  const existing = getNotifications();
  const next = [...notifications, ...existing].reduce<AppNotification[]>((acc, item) => {
    if (acc.some((current) => current.dedupeKey === item.dedupeKey)) {
      return acc;
    }
    acc.push(item);
    return acc;
  }, []);

  setNotifications(next);
  return next;
}

export function recordCompletionNotification(habit: Habit, date: string) {
  const preferences = getNotificationPreferences();
  const notification = buildCompletionNotification(habit, date);

  if (preferences.inAppAlerts) {
    const next = [notification, ...getNotifications()].filter(
      (item, index, list) =>
        list.findIndex((candidate) => candidate.dedupeKey === item.dedupeKey) === index
    );

    setNotifications(next);
  }

  notifyBrowser(notification);
  return notification;
}

export const notificationEvents = {
  notificationsUpdated: NOTIFICATION_EVENT,
  preferencesUpdated: PREFERENCES_EVENT,
};