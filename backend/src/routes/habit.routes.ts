// import { z } from "zod";

// export const createHabitSchema = z.object({
//   name: z.string().min(1, "Name is required").max(100),
//   description: z.string().max(500).optional(),
// });

// export const updateHabitSchema = z.object({
//   name: z.string().min(1, "Name is required").max(100).optional(),
//   description: z.string().max(500).optional(),
//   isActive: z.boolean().optional(),
// });

// export const habitIdParamSchema = z.object({
//   id: z.coerce.number().int().positive("Invalid habit id"),
// });

// export type CreateHabitInput = z.infer<typeof createHabitSchema>;
// export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
// export type HabitIdParam = z.infer<typeof habitIdParamSchema>;
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createHabitHandler,
  getHabitsHandler,
  getHabitByIdHandler,
  updateHabitHandler,
  deleteHabitHandler,
} from "../controllers/habit.controller";

const router = Router();

// All habit routes require a valid JWT
router.use(authenticate);

router.post("/", createHabitHandler);
router.get("/", getHabitsHandler);
router.get("/:id", getHabitByIdHandler);
router.patch("/:id", updateHabitHandler);
router.delete("/:id", deleteHabitHandler);

export default router;