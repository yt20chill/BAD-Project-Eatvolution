import { Router } from "express";
import { authController } from "../utils/container";
import { AppUtils } from "../utils/utils";
export const authRoutes = Router();

authRoutes.post("/login", AppUtils.exceptionWrapper(authController.login));
authRoutes.post("/signup", AppUtils.exceptionWrapper(authController.signUp));
authRoutes.post("/logout", AppUtils.exceptionWrapper(authController.logout));
authRoutes.get("/google-login", AppUtils.redirectWrapper(authController.oauthLogin));
