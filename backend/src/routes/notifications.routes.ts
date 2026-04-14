import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getNotifications, markNotificationsRead } from "../controllers/notifications.controller.js";

export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, getNotifications);
notificationsRouter.patch("/read-all", requireAuth, markNotificationsRead);
