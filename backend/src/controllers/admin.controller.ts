import { Request, Response } from "express";
import { z } from "zod";
import {
  createManagedUser,
  deleteManagedUser,
  exportAdminReport,
  getAdminUserOverview,
  updateManagedUser
} from "../services/admin.service.js";

const createUserSchema = z.object({
  fullName: z.string().min(3).max(120),
  username: z.string().min(3).max(80),
  email: z.string().email(),
  role: z.enum(["member", "trainer", "admin"]),
  phone: z.string().max(20).optional().or(z.literal("")),
  gender: z.string().max(20).optional().or(z.literal("")),
  password: z.string().min(8).max(120),
  membershipType: z.enum(["daily", "monthly", "yearly"]).optional(),
  trainerTitle: z.string().max(120).optional().or(z.literal("")),
  trainerHourlyRate: z.coerce.number().min(0).optional(),
  trainerBio: z.string().max(500).optional().or(z.literal("")),
  specialties: z.array(z.string()).optional()
});

const updateUserSchema = createUserSchema.omit({ role: true, password: true }).extend({
  membershipType: z.enum(["daily", "monthly", "yearly"]).optional()
});

const exportSchema = z.object({
  format: z.enum(["excel", "pdf"])
});

export async function getAdminUsers(req: Request, res: Response) {
  try {
    const data = await getAdminUserOverview(req.user!.role);
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}

export async function postAdminUser(req: Request, res: Response) {
  try {
    const payload = createUserSchema.parse(req.body);
    const data = await createManagedUser(req.user!.role, {
      ...payload,
      phone: payload.phone || undefined,
      gender: payload.gender || undefined,
      trainerTitle: payload.trainerTitle || undefined,
      trainerBio: payload.trainerBio || undefined
    });
    return res.status(201).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}

export async function patchAdminUser(req: Request, res: Response) {
  try {
    const userId = z.string().uuid().parse(req.params.userId);
    const payload = updateUserSchema.parse(req.body);
    const data = await updateManagedUser(req.user!.role, userId, {
      ...payload,
      phone: payload.phone || undefined,
      gender: payload.gender || undefined,
      trainerTitle: payload.trainerTitle || undefined,
      trainerBio: payload.trainerBio || undefined
    });
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}

export async function removeAdminUser(req: Request, res: Response) {
  try {
    const userId = z.string().uuid().parse(req.params.userId);
    const data = await deleteManagedUser(req.user!.role, userId);
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}

export async function exportAdminPayments(req: Request, res: Response) {
  try {
    const { format } = exportSchema.parse(req.query);
    const report = await exportAdminReport(req.user!.role, format);
    res.setHeader("Content-Type", report.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${report.filename}"`);
    return res.send(report.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}
