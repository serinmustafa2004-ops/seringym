import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  exportAdminPayments,
  getAdminUsers,
  patchAdminUser,
  postAdminUser,
  removeAdminUser
} from "../controllers/admin.controller.js";

export const adminRouter = Router();

adminRouter.get("/users", requireAuth, getAdminUsers);
adminRouter.post("/users", requireAuth, postAdminUser);
adminRouter.patch("/users/:userId", requireAuth, patchAdminUser);
adminRouter.delete("/users/:userId", requireAuth, removeAdminUser);
adminRouter.get("/reports/export", requireAuth, exportAdminPayments);
