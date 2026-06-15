import { Request, Response, NextFunction } from "express";
import { AuthError } from "../services/auth.service";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err);

  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof Error) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }

  return res.status(500).json({ message: "Internal server error" });
}

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({ message: `Route ${req.originalUrl} not found` });
}