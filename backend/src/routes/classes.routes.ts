import { Router } from "express";
import { createBooking, getClasses } from "../controllers/classes.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const classesRouter = Router();

classesRouter.get("/", requireAuth, getClasses);
classesRouter.post("/:classId/bookings", requireAuth, createBooking);
