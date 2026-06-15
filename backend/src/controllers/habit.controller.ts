import { Request, Response, NextFunction } from "express";
import {
  createHabitSchema,
  updateHabitSchema,
  habitIdParamSchema,
} from "../validators/habit.validator";
import {
  createHabit,
  getHabitsForUser,
  getHabitById,
  updateHabit,
  deleteHabit,
} from "../services/habit.service";

export async function createHabitHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = createHabitSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const habit = await createHabit(req.user!.userId, parsed.data);

    return res.status(201).json({ message: "Habit created", habit });
  } catch (error) {
    next(error);
  }
}

export async function getHabitsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const habits = await getHabitsForUser(req.user!.userId);
    return res.status(200).json({ habits });
  } catch (error) {
    next(error);
  }
}

export async function getHabitByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsedParams = habitIdParamSchema.safeParse(req.params);

    if (!parsedParams.success) {
      return res.status(400).json({ message: "Invalid habit id" });
    }

    const habit = await getHabitById(req.user!.userId, parsedParams.data.id);
    return res.status(200).json({ habit });
  } catch (error) {
    next(error);
  }
}

export async function updateHabitHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsedParams = habitIdParamSchema.safeParse(req.params);

    if (!parsedParams.success) {
      return res.status(400).json({ message: "Invalid habit id" });
    }

    const parsedBody = updateHabitSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsedBody.error.flatten().fieldErrors,
      });
    }

    const habit = await updateHabit(
      req.user!.userId,
      parsedParams.data.id,
      parsedBody.data
    );

    return res.status(200).json({ message: "Habit updated", habit });
  } catch (error) {
    next(error);
  }
}

export async function deleteHabitHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsedParams = habitIdParamSchema.safeParse(req.params);

    if (!parsedParams.success) {
      return res.status(400).json({ message: "Invalid habit id" });
    }

    const result = await deleteHabit(req.user!.userId, parsedParams.data.id);
    return res.status(200).json({ message: "Habit deleted", ...result });
  } catch (error) {
    next(error);
  }
}