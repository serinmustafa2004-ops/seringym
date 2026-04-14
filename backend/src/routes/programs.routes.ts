import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getPrograms, postProgram } from "../controllers/programs.controller.js";

export const programsRouter = Router();

programsRouter.get("/", requireAuth, getPrograms);
programsRouter.post("/", requireAuth, postProgram);
