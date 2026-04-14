import { Request, Response } from "express";
import { z } from "zod";
import { createWorkoutProgram, getProgramsOverview } from "../services/programs.service.js";

const daySchema = z.object({
  dayIndex: z.number().int().min(1).max(7),
  dayLabel: z.string().min(2).max(60),
  focusArea: z.string().min(2).max(120),
  exerciseName: z.string().min(2).max(140),
  sets: z.string().min(1).max(20),
  reps: z.string().min(1).max(20),
  restSeconds: z.number().int().min(0).max(600),
  notes: z.string().max(240).optional().or(z.literal(""))
});

const createProgramSchema = z.object({
  memberId: z.string().uuid(),
  title: z.string().min(3).max(140),
  goalSummary: z.string().min(5).max(400),
  notes: z.string().max(500).optional().or(z.literal("")),
  days: z.array(daySchema).min(1)
});

export async function getPrograms(req: Request, res: Response) {
  try {
    const data = await getProgramsOverview(req.user!.sub, req.user!.role);
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}

export async function postProgram(req: Request, res: Response) {
  try {
    if (!["trainer", "admin"].includes(req.user!.role)) {
      return res.status(403).json({ message: "Program yazma yetkisi sadece antrenör ve yöneticide var." });
    }

    const payload = createProgramSchema.parse(req.body);
    const result = await createWorkoutProgram(req.user!.sub, req.user!.role, payload);
    return res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}
