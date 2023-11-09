import { Request } from "express";
import { RedisClientType } from "redis";
import { ControllerResult } from "../../models/controllerModels";
import { BriefFood } from "../../models/models";
import { AppUtils } from "../utils/utils";
import ShopService from "./shop.service";

export default class ShopController {
  private foodQtyInShop = 12;
  constructor(
    private readonly shopService: ShopService,
    private readonly redis: RedisClientType
  ) {}

  getShopItems = async (req: Request): Promise<ControllerResult<BriefFood[]>> => {
    const { userId } = req.session;
    const exists = await this.redis.exists("shop");
    if (exists) {
      const food = JSON.parse(await this.redis.get("shop"));
      return AppUtils.setServerResponse(food);
    }
    const food = await this.shopService.getShopItems(userId);
    // TODO: update redis by node-cron
    this.redis.set("shop", JSON.stringify(food));
    return AppUtils.setServerResponse(food);
  };
}
