import schedule from "node-schedule";
import gameConfig from "../config/gameConfig";
import { logger } from "../config/logger";
import { io } from "../socket";
import { gameService, shopService } from "./container";

// TODO: test case
export const scheduleUpdateShop = () =>
  schedule.scheduleJob(gameConfig.SHOP_REFRESH_SCHEDULE, async () => {
    try {
      await shopService.updateUniversalShop();
      io.emit(gameConfig.GAME_STATUS_CODE.refreshShop);
    } catch (error) {
      logger.error(error);
    }
  });

export const scheduleUpdateUsers = () =>
  schedule.scheduleJob(gameConfig.USER_UPDATE_SCHEDULE, async () => {
    try {
      await gameService.updateAllUsers();
      io.emit(gameConfig.GAME_STATUS_CODE.payDay);
    } catch (error) {
      logger.error(error);
    }
  });
