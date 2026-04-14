import { Request, Response } from "express";
import { z } from "zod";
import { getRewardOverview, redeemReward } from "../services/rewards.service.js";

const redeemSchema = z.object({
  rewardId: z.string().uuid()
});

export async function getRewards(req: Request, res: Response) {
  try {
    if (req.user!.role !== "member") {
      return res.status(403).json({ message: "Ödül sistemi sadece üyeler içindir." });
    }
    const data = await getRewardOverview(req.user!.sub);
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}

export async function postRedeem(req: Request, res: Response) {
  try {
    if (req.user!.role !== "member") {
      return res.status(403).json({ message: "Ödül kullanımı sadece üyeler içindir." });
    }
    const payload = redeemSchema.parse(req.body);
    const result = await redeemReward(req.user!.sub, payload.rewardId);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}
