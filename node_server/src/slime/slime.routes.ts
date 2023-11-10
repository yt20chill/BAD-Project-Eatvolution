import { Router } from "express";
import { AppUtils } from "../utils/utils";
import { testController } from "../utils/container";

export const slimeRoutes = Router();

slimeRoutes.get('/slimeFeed',testController.slimeFeed)
slimeRoutes.get('/getSlimeData',AppUtils.redirectWrapper(testController.getSlimeData))
slimeRoutes.get('/test', testController.test)
