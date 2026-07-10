import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { checkDbConnection } from "./config/db";
import authRoutes from "./routes/auth.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import habitRoutes from "./routes/habit.routes";
import logRoutes from "./routes/log.routes";
import analyticsRoutes from "./routes/analytics.routes";
import notificationRoutes from "./routes/notification.routes";
import { runWeeklyDigestSweep } from "./services/notification.service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------
// Global Middleware
// ----------------------
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
// ----------------------
// Health Check
// ----------------------
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ----------------------
// Routes
// ----------------------
app.use("/api/auth", authRoutes);

// ----------------------
// Error Handling (must be last)
// ----------------------
app.use(notFoundHandler);
app.use(errorHandler);

// ----------------------
// Start Server
// ----------------------
async function start() {
  await checkDbConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  const runDigestJob = async () => {
    try {
      const result = await runWeeklyDigestSweep();
      if (result.ran) {
        console.log(`📬 Weekly digest sweep complete. Emails sent: ${result.sent}`);
      }
    } catch (error) {
      console.error("Weekly digest sweep failed:", error);
    }
  };

  await runDigestJob();
  setInterval(runDigestJob, 60 * 1000);
}

start();