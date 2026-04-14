import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getAttendance } from "../controllers/attendance.controller.js";

export const attendanceRouter = Router();

attendanceRouter.get("/", requireAuth, getAttendance);
