import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getRecentScans,
  getMyEntryPass,
  scanMemberEntryPass
} from "../controllers/entry-pass.controller.js";

export const entryPassRouter = Router();

entryPassRouter.get("/me", requireAuth, getMyEntryPass);
entryPassRouter.get("/recent", requireAuth, getRecentScans);
entryPassRouter.post("/scan", requireAuth, scanMemberEntryPass);
