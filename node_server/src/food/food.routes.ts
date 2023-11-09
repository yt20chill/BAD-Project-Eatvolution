import { Router } from "express";
import { foodController } from "../container";
import { AppUtils } from "../utils/utils";

export const foodRoutes = Router();

foodRoutes.post("/food", AppUtils.exceptionWrapper(foodController.insertFood));
