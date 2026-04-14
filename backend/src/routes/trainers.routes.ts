import { Router } from "express";
import { getMarketplace, postReview } from "../controllers/trainers.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const trainersRouter = Router();

trainersRouter.get("/", requireAuth, getMarketplace);
trainersRouter.post("/:trainerId/reviews", requireAuth, postReview);
