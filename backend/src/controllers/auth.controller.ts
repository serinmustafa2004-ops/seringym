import { Request, Response } from "express";
import { z } from "zod";
import { changePassword, loginUser, resetPassword } from "../services/auth.service.js";

const loginSchema = z.object({
  identifier: z.string().min(3, "Kullanıcı adı veya e-posta gir."),
  password: z.string().min(8),
  role: z.enum(["member", "trainer", "admin"]).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8, "Yeni şifre en az 8 karakter olmalı.")
});

const resetPasswordSchema = z.object({
  identifier: z.string().min(3),
  phoneLast4: z.string().min(4).max(4),
  role: z.enum(["member", "trainer", "admin"]).optional()
});

export async function login(req: Request, res: Response) {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await loginUser(payload.identifier, payload.password, payload.role);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}

export async function updateMyPassword(req: Request, res: Response) {
  try {
    const payload = changePasswordSchema.parse(req.body);
    const result = await changePassword(req.user!.sub, payload.currentPassword, payload.newPassword);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}

export async function createPasswordReset(req: Request, res: Response) {
  try {
    const payload = resetPasswordSchema.parse(req.body);
    const result = await resetPassword(payload.identifier, payload.phoneLast4, payload.role);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen hata";
    return res.status(400).json({ message });
  }
}
