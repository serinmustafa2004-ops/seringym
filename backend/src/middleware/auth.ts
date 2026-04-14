import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Yetkilendirme başlığı bulunamadı." });
  }

  try {
    const token = header.replace("Bearer ", "");
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: "Geçersiz oturum." });
  }
}
