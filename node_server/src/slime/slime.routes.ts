import { Router } from "express";
import { AppUtils } from "../utils/utils";
import { slimeController } from "../container";

export const slimeRoutes = Router();

slimeRoutes.post('/slimeFeed',AppUtils.redirectWrapper(slimeController.slimeFeed))
slimeRoutes.get('/getSlimeData',AppUtils.redirectWrapper(slimeController.getSlimeData))
