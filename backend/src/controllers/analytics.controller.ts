import { Request, Response, NextFunction } from "express";
import { getHeatmapData, getSummaryStats } from "../services/analytics.service";

export async function getHeatmapHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const daysParam = req.query.days;
    const days = daysParam ? Number(daysParam) : 365;

    if (Number.isNaN(days) || days <= 0 || days > 730) {
      return res.status(400).json({ message: "days must be between 1 and 730" });
    }

    const data = await getHeatmapData(req.user!.userId, days);
    return res.status(200).json({ heatmap: data });
  } catch (error) {
    next(error);
  }
}

export async function getSummaryHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await getSummaryStats(req.user!.userId);
    return res.status(200).json({ stats });
  } catch (error) {
    next(error);
  }
}