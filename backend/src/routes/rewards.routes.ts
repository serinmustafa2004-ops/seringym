import { Router } from "express";
import { getRewards, postRedeem } from "../controllers/rewards.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const rewardsRouter = Router();

rewardsRouter.get("/", requireAuth, getRewards);
rewardsRouter.post("/redeem", requireAuth, postRedeem);
