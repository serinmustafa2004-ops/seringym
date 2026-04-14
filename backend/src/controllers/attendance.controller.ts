import { Request, Response } from "express";
import { z } from "zod";
import { getAttendanceOverview } from "../services/attendance.service.js";

const filterSchema = z.object({
  date: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  member: z.string().optional()
});

export async function getAttendance(req: Request, res: Response) {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ message: "Giriş çıkış kayıtları sadece yönetici içindir." });
    }

    const filters = filterSchema.parse(req.query);
    const data = await getAttendanceOverview(filters);
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}
