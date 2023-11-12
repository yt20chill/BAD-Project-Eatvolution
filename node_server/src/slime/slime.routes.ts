import { Router } from "express";
import { slimeController } from "../utils/container";
import { AppUtils } from "../utils/utils";

export const slimeRoutes = Router();

slimeRoutes.get("/", AppUtils.exceptionWrapper(slimeController.getData));
