import { Request } from "express";
import { RedisClientType } from "redis";
import { ControllerResult, ShopControllerHelper } from "../../models/controllerModels";
import { BriefFood } from "../../models/models";
import { AppUtils } from "../utils/utils";
import ShopService from "./shop.service";

export default class ShopController implements ShopControllerHelper {
  constructor(
    private readonly shopService: ShopService,
    private readonly redis: RedisClientType
  ) {}
  // redis maybe buggy. need testing
  getShopItems = async (req: Request): Promise<ControllerResult<BriefFood[]>> => {
    const { userId } = req.session;
    const existsCustomShop = await this.redis.exists(`shop-${userId}`);
    const existsUniversalShop = await this.redis.exists("shop");
    if (existsCustomShop) {
      const food = JSON.parse(await this.redis.get(`shop-${userId}`));
      return AppUtils.setServerResponse(food);
    }
    if (existsUniversalShop) {
      const food = JSON.parse(await this.redis.get("shop"));
      return AppUtils.setServerResponse(food);
    }
    const { food, isUniversal } = await this.shopService.getShopItems(userId);
    console.dir(food, isUniversal);
    isUniversal
      ? this.redis.set("shop", JSON.stringify(food))
      : this.redis.set(`shop-${userId}`, JSON.stringify(food));
    return AppUtils.setServerResponse(food);
  };
  refreshShop = async (req: Request): Promise<ControllerResult<BriefFood[]>> => {
    const { userId } = req.session;
    const success = await this.shopService.updateUserShop(userId);
    if (success) {
      const newShop = (await this.shopService.getShopItems(userId)).food;
      await this.redis.set(`shop-${userId}`, JSON.stringify(newShop));
      return AppUtils.setServerResponse(newShop);
    }
    return AppUtils.setServerResponse(null, false);
  };
}
