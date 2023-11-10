import { Router } from "express";
import { userController } from "../utils/container";
import { AppUtils } from "../utils/utils";

export const userRoutes = Router();

userRoutes.get("/finance", AppUtils.exceptionWrapper(userController.getFinancialData));
