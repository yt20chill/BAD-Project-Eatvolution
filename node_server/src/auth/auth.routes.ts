import { Router } from "express";
import { authController } from "../container";
import { AppUtils } from "../utils/utils";
export const authRoutes = Router();

authRoutes.post("/login", AppUtils.redirectWrapper(authController.login));
authRoutes.get("/google-login", AppUtils.redirectWrapper(authController.oauthLogin));
authRoutes.post("/signUp", AppUtils.redirectWrapper(authController.signUp));
authRoutes.post("/logout", AppUtils.redirectWrapper(authController.logout));
