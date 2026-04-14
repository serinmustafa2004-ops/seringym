import { Request, Response } from "express";
import { bildirimleriGetir, tumBildirimleriOkunduYap } from "../services/notifications.service.js";

export async function getNotifications(req: Request, res: Response) {
  try {
    const data = await bildirimleriGetir(req.user!.sub, req.user!.role);
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}

export async function markNotificationsRead(req: Request, res: Response) {
  try {
    const data = await tumBildirimleriOkunduYap(req.user!.sub);
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}
