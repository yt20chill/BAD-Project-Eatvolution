import { Router } from "express";
import { AppUtils } from "../utils/utils";
import { testController } from "../utils/container";

export const slimeRoutes = Router();

slimeRoutes.post('/slimeFeed',AppUtils.redirectWrapper(testController.slimeFeed))
slimeRoutes.get('/getSlimeData',AppUtils.redirectWrapper(testController.getSlimeData))
