import { Router } from "express";
import { authController } from "src/container";
import { AppUtils } from "src/utils/utils";
export const authRoutes = Router();

authRoutes.post("/login", AppUtils.exceptionWrapper<boolean>(authController.login));
// authRoutes.post("/google-login", AppUtils.exceptionWrapper<boolean>(authController.login));
