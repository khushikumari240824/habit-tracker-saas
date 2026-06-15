import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getHeatmapHandler, getSummaryHandler } from "../controllers/analytics.controller";

const router = Router();

router.use(authenticate);

router.get("/heatmap", getHeatmapHandler);
router.get("/summary", getSummaryHandler);

export default router;