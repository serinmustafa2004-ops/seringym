import { Request, Response } from "express";
import { z } from "zod";
import {
  getEntryPass,
  getRecentEntryScans,
  scanEntryPass
} from "../services/entry-pass.service.js";

const scanSchema = z.object({
  passToken: z.string().min(20)
});

export async function getMyEntryPass(req: Request, res: Response) {
  try {
    const data = await getEntryPass(req.user!.sub, req.user!.role);
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}

export async function scanMemberEntryPass(req: Request, res: Response) {
  try {
    const payload = scanSchema.parse(req.body);
    const data = await scanEntryPass(payload.passToken, req.user!.role);
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}

export async function getRecentScans(req: Request, res: Response) {
  try {
    const data = await getRecentEntryScans(req.user!.role);
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}
