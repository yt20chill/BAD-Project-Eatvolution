import { Router } from "express";
import { authController } from "../container";
import { AppUtils } from "../utils/utils";
export const authRoutes = Router();

authRoutes.post("/login", AppUtils.exceptionWrapper<null>(authController.login));
authRoutes.get("/google-login", AppUtils.exceptionWrapper<null>(authController.oauthLogin));
authRoutes.post("/signUp", AppUtils.exceptionWrapper<string | null>(authController.signUp));
authRoutes.post("/logout", AppUtils.exceptionWrapper<null>(authController.logout));
