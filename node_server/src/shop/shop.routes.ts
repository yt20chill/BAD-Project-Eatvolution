import { Router } from "express";
import { shopController } from "../utils/container";
import { AppUtils } from "../utils/utils";

export const shopRoutes = Router();
//fetch url: /api/shop
shopRoutes.get("/", AppUtils.exceptionWrapper(shopController.getFoodShop));
shopRoutes.put("/", AppUtils.exceptionWrapper(shopController.refreshShop));
