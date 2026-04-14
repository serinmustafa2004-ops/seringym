import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { rewardsRouter } from "./routes/rewards.routes.js";
import { trainersRouter } from "./routes/trainers.routes.js";
import { classesRouter } from "./routes/classes.routes.js";
import { paymentsRouter } from "./routes/payments.routes.js";
import { programsRouter } from "./routes/programs.routes.js";
import { recommendationsRouter } from "./routes/recommendations.routes.js";
import { attendanceRouter } from "./routes/attendance.routes.js";
import { entryPassRouter } from "./routes/entry-pass.routes.js";
import { notificationsRouter } from "./routes/notifications.routes.js";
import { adminRouter } from "./routes/admin.routes.js";

export const app = express();

const allowedOrigins = env.CLIENT_URL.split(",")
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Bu kaynaktan erişime izin verilmiyor."));
    }
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/rewards", rewardsRouter);
app.use("/api/trainers", trainersRouter);
app.use("/api/classes", classesRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/programs", programsRouter);
app.use("/api/recommendations", recommendationsRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/entry-pass", entryPassRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/admin", adminRouter);
