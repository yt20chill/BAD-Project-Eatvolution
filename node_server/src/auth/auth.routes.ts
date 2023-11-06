import { Router } from "express";
import { authController } from "../container";
import { AppUtils } from "../utils/utils";
export const authRoutes = Router();

authRoutes.post("/login", AppUtils.exceptionWrapper<boolean>(authController.login));
authRoutes.get("/google-login", AppUtils.exceptionWrapper<boolean>(authController.oauthLogin));
