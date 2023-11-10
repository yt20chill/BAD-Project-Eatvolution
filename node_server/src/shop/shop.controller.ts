import { Request } from "express";
import { ControllerResult, ShopControllerHelper } from "../../models/controllerModels";
import { BriefFood } from "../../models/models";
import { AppUtils } from "../utils/utils";
import ShopService from "./shop.service";

export default class ShopController implements ShopControllerHelper {
  constructor(private readonly shopService: ShopService) {}
  getShopItems = async (req: Request): Promise<ControllerResult<BriefFood[]>> => {
    const userId = req.session.user.id;
    const food = await this.shopService.getShopItems(userId);
    return AppUtils.setServerResponse(food);
  };
  refreshShop = async (req: Request): Promise<ControllerResult<BriefFood[]>> => {
    const userId = req.session.user.id;
    const success = await this.shopService.updateUserShop(userId);
    if (!success) return AppUtils.setServerResponse(null, false);
    const newShop = await this.shopService.getShopItems(userId);
    return AppUtils.setServerResponse(newShop);
  };
}
