import { Request, Response, NextFunction } from "express";
import {
  getNotificationPreferences,
  runWeeklyDigestSweep,
  sendWeeklyDigestForUser,
  updateNotificationPreferences,
} from "../services/notification.service";
import { updateNotificationPreferencesSchema } from "../validators/notification.validator";

export async function getNotificationPreferencesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const preferences = await getNotificationPreferences(req.user!.userId);
    return res.status(200).json({ notificationPreferences: preferences });
  } catch (error) {
    next(error);
  }
}

export async function updateNotificationPreferencesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsedBody = updateNotificationPreferencesSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsedBody.error.flatten().fieldErrors,
      });
    }

    const preferences = await updateNotificationPreferences(
      req.user!.userId,
      parsedBody.data
    );

    return res.status(200).json({
      message: "Notification preferences updated",
      notificationPreferences: preferences,
    });
  } catch (error) {
    next(error);
  }
}

export async function sendWeeklyDigestHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await sendWeeklyDigestForUser(req.user!.userId);
    return res.status(200).json({ message: "Digest processed", ...result });
  } catch (error) {
    next(error);
  }
}

export async function runWeeklyDigestSweepHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await runWeeklyDigestSweep();
    return res.status(200).json({ message: "Weekly digest sweep complete", ...result });
  } catch (error) {
    next(error);
  }
}