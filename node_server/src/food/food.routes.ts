import { Router } from "express";
import { foodController, gameController } from "../utils/container";
import { AppUtils } from "../utils/utils";

export const foodRoutes = Router();

foodRoutes.post("/", AppUtils.exceptionWrapper(foodController.insertFood));
foodRoutes.put("/", AppUtils.exceptionWrapper(gameController.purchaseFood));
