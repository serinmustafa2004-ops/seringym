import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getPayments,
  payMembership,
  payPersonalTraining
} from "../controllers/payments.controller.js";

export const paymentsRouter = Router();

paymentsRouter.get("/overview", requireAuth, getPayments);
paymentsRouter.post("/membership", requireAuth, payMembership);
paymentsRouter.post("/personal-training", requireAuth, payPersonalTraining);
