import { Request, Response } from "express";
import { z } from "zod";
import { addTrainerReview, listMarketplaceTrainers } from "../services/trainers.service.js";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5).max(500)
});

export async function getMarketplace(req: Request, res: Response) {
  try {
    const specialty = typeof req.query.specialty === "string" ? req.query.specialty : undefined;
    const minRating = typeof req.query.minRating === "string" ? Number(req.query.minRating) : undefined;
    const data = await listMarketplaceTrainers({ specialty, minRating });
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}

export async function postReview(req: Request, res: Response) {
  try {
    if (req.user!.role !== "member") {
      return res.status(403).json({ message: "Yorum ve puanlama sadece üyeler içindir." });
    }
    const payload = reviewSchema.parse(req.body);
    const trainerId = z.string().uuid().parse(req.params.trainerId);
    const result = await addTrainerReview(trainerId, req.user!.sub, payload.rating, payload.comment);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}
