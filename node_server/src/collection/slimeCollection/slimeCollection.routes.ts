import { Router } from "express";
import { slimeCollectionController } from "../../utils/container";
import { AppUtils } from "../../utils/utils";

export const slimeCollectionRoutes = Router();

slimeCollectionRoutes.get(
  "/",
  AppUtils.exceptionWrapper(slimeCollectionController.getWholeSlimeCollection)
);
