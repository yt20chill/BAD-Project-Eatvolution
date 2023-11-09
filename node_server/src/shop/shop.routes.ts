import { Router } from "express";
import { shopController } from "../container";
import { AppUtils } from "../utils/utils";

export const shopRoutes = Router();

shopRoutes.get("/", AppUtils.exceptionWrapper(shopController.getShopItems));
shopRoutes.put("/", AppUtils.exceptionWrapper(shopController.refreshShop));
