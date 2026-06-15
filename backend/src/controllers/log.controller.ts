import { Request, Response, NextFunction } from "express";
import { toggleLogSchema, habitIdParamSchema } from "../validators/log.validator";
import { toggleHabitLog, getLogsForHabit } from "../services/streak.service";

export async function toggleLogHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsedParams = habitIdParamSchema.safeParse(req.params);

    if (!parsedParams.success) {
      return res.status(400).json({ message: "Invalid habit id" });
    }

    const parsedBody = toggleLogSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsedBody.error.flatten().fieldErrors,
      });
    }

    const result = await toggleHabitLog(
      req.user!.userId,
      parsedParams.data.habitId,
      parsedBody.data.date
    );

    return res.status(200).json({
      message: result.completed ? "Habit marked complete" : "Habit marked incomplete",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getLogsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsedParams = habitIdParamSchema.safeParse(req.params);

    if (!parsedParams.success) {
      return res.status(400).json({ message: "Invalid habit id" });
    }

    const logs = await getLogsForHabit(req.user!.userId, parsedParams.data.habitId);

    return res.status(200).json({ logs });
  } catch (error) {
    next(error);
  }
}