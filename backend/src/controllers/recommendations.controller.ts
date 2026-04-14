import { Request, Response } from "express";
import { getRecommendations } from "../services/recommendations.service.js";

export async function getRoleRecommendations(req: Request, res: Response) {
  try {
    const data = await getRecommendations(req.user!.sub, req.user!.role);
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}
