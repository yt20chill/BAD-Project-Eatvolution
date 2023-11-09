import { Router } from "express";
import { AppUtils } from "src/utils/utils";
import { slimeController } from "../container";

export const slimeRoutes = Router();

slimeRoutes.post('/slimeFeed',AppUtils.redirectWrapper(slimeController.slimeFeed))