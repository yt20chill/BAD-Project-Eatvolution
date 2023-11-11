import { Router } from "express";
import { testController } from "../utils/container";
import { AppUtils } from "../utils/utils";

export const slimeRoutes = Router();

slimeRoutes.get("/slimeFeed", testController.slimeFeed);
slimeRoutes.get("/getSlimeData", AppUtils.redirectWrapper(testController.getSlimeData));
slimeRoutes.get("/test", testController.test);
