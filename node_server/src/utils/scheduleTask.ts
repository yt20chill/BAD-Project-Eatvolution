import schedule from "node-schedule";
import { io } from "../socket";
import { gameService, shopService } from "./container";
import gameConfig from "./gameConfig";
import { logger } from "./logger";

// TODO: test case
export const scheduleUpdateShop = async () =>
  schedule.scheduleJob(gameConfig.SHOP_REFRESH_SCHEDULE, async () => {
    try {
      await shopService.updateUniversalShop();
      io.emit(gameConfig.GAME_STATUS_CODE.refreshShop);
    } catch (error) {
      logger.error(error);
    }
  });

export const scheduleUpdateUsers = async () =>
  schedule.scheduleJob(gameConfig.USER_UPDATE_SCHEDULE, async () => {
    try {
      await gameService.updateAllUsers();
      io.emit(gameConfig.GAME_STATUS_CODE.payDay);
    } catch (error) {
      logger.error(error);
    }
  });
