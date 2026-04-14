import { Request, Response } from "express";
import { z } from "zod";
import { bookClass, listClasses } from "../services/classes.service.js";

export async function getClasses(req: Request, res: Response) {
  try {
    const classes = await listClasses(req.user!.sub);
    return res.json(classes);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}

export async function createBooking(req: Request, res: Response) {
  try {
    if (req.user!.role !== "member") {
      return res.status(403).json({ message: "Rezervasyon sadece üye hesaplarıyla yapılabilir." });
    }
    const classId = z.string().uuid().parse(req.params.classId);
    const result = await bookClass(req.user!.sub, classId);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}
