import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getRoleRecommendations } from "../controllers/recommendations.controller.js";

export const recommendationsRouter = Router();

recommendationsRouter.get("/", requireAuth, getRoleRecommendations);
