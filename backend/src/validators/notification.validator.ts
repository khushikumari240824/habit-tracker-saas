import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  inAppAlerts: z.boolean(),
  browserNotifications: z.boolean(),
  streakAlerts: z.boolean(),
  dailyReminders: z.boolean(),
  weeklyDigest: z.boolean(),
  lastWeeklyDigestKey: z.string().nullable().optional(),
});

export const updateNotificationPreferencesSchema = notificationPreferencesSchema
  .omit({ lastWeeklyDigestKey: true })
  .partial();

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>;