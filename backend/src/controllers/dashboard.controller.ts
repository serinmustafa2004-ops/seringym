import { Request, Response } from "express";
import { getDashboardSummary } from "../services/dashboard.service.js";

export async function getSummary(req: Request, res: Response) {
  try {
    const summary = await getDashboardSummary(req.user!.sub);
    return res.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}
