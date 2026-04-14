import { Request, Response } from "express";
import { z } from "zod";
import {
  createMembershipPayment,
  createPersonalTrainingPayment,
  getPaymentOverview
} from "../services/payments.service.js";

const cardSchema = z.object({
  cardHolderName: z.string().min(5),
  cardNumber: z.string().min(16),
  expiryMonth: z.string().min(1),
  expiryYear: z.string().min(4),
  cvc: z.string().min(3)
});

const membershipPaymentSchema = cardSchema.extend({
  planCode: z.enum(["aylik_1", "aylik_3", "aylik_6", "yillik_12"])
});

const personalTrainingPaymentSchema = cardSchema.extend({
  trainerId: z.string().uuid(),
  sessionCount: z.union([z.literal(1), z.literal(4), z.literal(8)])
});

export async function getPayments(req: Request, res: Response) {
  try {
    const data = await getPaymentOverview(req.user!.sub, req.user!.role);
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}

export async function payMembership(req: Request, res: Response) {
  try {
    if (req.user!.role !== "member") {
      return res.status(403).json({ message: "Bu işlem sadece üyeler için kullanılabilir." });
    }

    const payload = membershipPaymentSchema.parse(req.body);
    const result = await createMembershipPayment(req.user!.sub, payload);
    return res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}

export async function payPersonalTraining(req: Request, res: Response) {
  try {
    if (req.user!.role !== "member") {
      return res.status(403).json({ message: "Bu işlem sadece üyeler için kullanılabilir." });
    }

    const payload = personalTrainingPaymentSchema.parse(req.body);
    const result = await createPersonalTrainingPayment(req.user!.sub, payload);
    return res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}
