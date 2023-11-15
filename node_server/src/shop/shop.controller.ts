import { Request } from "express";
import { ControllerResult, ShopControllerHelper } from "../../models/controllerModels";
import { BriefFood } from "../../models/models";
import GameConfig from "../utils/gameConfig";
import { AppUtils } from "../utils/utils";
import ShopService from "./shop.service";

export default class ShopController implements ShopControllerHelper {
  constructor(private readonly shopService: ShopService) {}
  getFoodShop = async (req: Request): Promise<ControllerResult<BriefFood[]>> => {
    const userId = req.session.user.id;
    const food = await this.shopService.getFoodShop(userId);
    return AppUtils.setServerResponse(food);
  };
  refreshShop = async (req: Request): Promise<ControllerResult<BriefFood[]>> => {
    const userId = req.session.user.id;
    const success = await this.shopService.updateUserShop(userId);
    if (!success) return AppUtils.setServerResponse(null, false);
    const newShop = await this.shopService.getFoodShop(userId);
    return AppUtils.setServerResponse(newShop);
  };
  getItemCost = async (_req: Request) => {
    const refreshCost = GameConfig.REFRESH_PRICE;
    const customFoodCost = GameConfig.CUSTOM_FOOD_PRICE;
    return AppUtils.setServerResponse({ refreshCost, customFoodCost });
  };
}
