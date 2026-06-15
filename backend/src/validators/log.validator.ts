import { z } from "zod";
import { isValidDateString } from "../utils/date";

export const toggleLogSchema = z.object({
  date: z
    .string()
    .refine(isValidDateString, "date must be a valid YYYY-MM-DD string"),
});

export const habitIdParamSchema = z.object({
  habitId: z.coerce.number().int().positive("Invalid habit id"),
});

export type ToggleLogInput = z.infer<typeof toggleLogSchema>;