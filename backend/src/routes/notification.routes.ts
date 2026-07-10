import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getNotificationPreferencesHandler,
  runWeeklyDigestSweepHandler,
  sendWeeklyDigestHandler,
  updateNotificationPreferencesHandler,
} from "../controllers/notification.controller";

const router = Router();

router.use(authenticate);

router.get("/preferences", getNotificationPreferencesHandler);
router.patch("/preferences", updateNotificationPreferencesHandler);
router.post("/digest/send", sendWeeklyDigestHandler);
router.post("/digest/run", runWeeklyDigestSweepHandler);

export default router;