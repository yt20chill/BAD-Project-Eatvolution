import { Router } from "express";
import { foodController } from "../utils/container";
import { AppUtils } from "../utils/utils";

export const foodRoutes = Router();

foodRoutes.post(
  "/",
  AppUtils.nextWrapper(foodController.insertFood),
  AppUtils.exceptionWrapper(foodController.purchaseFood)
);
foodRoutes.put("/", AppUtils.exceptionWrapper(foodController.purchaseFood));
