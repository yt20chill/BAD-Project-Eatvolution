import { Router } from "express";
import { shopController } from "../container";
import { AppUtils } from "../utils/utils";

export const shopRoutes = Router();

shopRoutes.get("/shop", AppUtils.exceptionWrapper(shopController.getShopItems));
