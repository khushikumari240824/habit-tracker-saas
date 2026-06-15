import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { toggleLogHandler, getLogsHandler } from "../controllers/log.controller";

const router = Router();

router.use(authenticate);

router.post("/:habitId/toggle", toggleLogHandler);
router.get("/:habitId", getLogsHandler);

export default router;