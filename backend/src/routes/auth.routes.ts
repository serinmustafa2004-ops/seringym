import { Router } from "express";
import { createPasswordReset, login, updateMyPassword } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/reset-password", createPasswordReset);
authRouter.patch("/change-password", requireAuth, updateMyPassword);
