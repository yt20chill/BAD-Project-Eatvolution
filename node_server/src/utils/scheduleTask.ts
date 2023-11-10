import schedule from "node-schedule";
import { redis, shopService } from "./container";
import gameConfig from "./gameConfig";
import RedisClientWrapper from "./redisUtils";

// TODO: test case
export const scheduleUpdateShop = async () =>
  schedule.scheduleJob(gameConfig.SHOP_REFRESH_SCHEDULE, async () => {
    await shopService.updateUniversalShop();
    const extendedRedis = new RedisClientWrapper(redis);
    // delete all keys that start with shop
    extendedRedis.deleteKeys("shop*");
  });

export const scheduleUpdateUserSavings = async () =>
  schedule.scheduleJob(gameConfig.MONEY_UPDATE_SCHEDULE, async () => {});
