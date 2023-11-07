import { Request as ExpressRequest } from "express";
import { ControllerResult, FoodControllerHelper } from "models/controllerModels";
import { CnItem } from "models/models";
import { RedisClientType } from "redis";
import DbUtils from "src/utils/dbUtils";
import { AppUtils } from "src/utils/utils";
import { env } from "../../src/env";
import { ApplicationError, BadRequestError } from "../../src/utils/error";
import { logger } from "../../src/utils/logger";
import FoodService from "./food.service";

export default class FoodController implements FoodControllerHelper {
  constructor(
    private readonly foodService: FoodService,
    private readonly redis?: RedisClientType
  ) {}

  insertFood = async (req: ExpressRequest): Promise<ControllerResult<boolean>> => {
    const foodName = req.body.foodName?.trim().toLowerCase();
    logger.debug(foodName);
    if (!foodName) throw new BadRequestError();
    const found = (await this.foodService.isExisting(foodName)) === -1;
    if (!found) {
    }
    const res = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${foodName}`, {
      headers: { "X-API-Key": env.CN_API_KEY },
    });
    if (!res.ok) throw new ApplicationError(res.status, res.statusText);
    // will only insert the first food if there are multiple food, return insertion result
    const food: CnItem = (await res.json()).items[0];
    // not found or wrongly found
    if (!food?.name.includes(foodName))
      return AppUtils.setServerResponse(`fail to search ${foodName}`, false);
    return AppUtils.setServerResponse(
      null,
      await this.foodService.insert(req.session.userId, DbUtils.cnItemToInsertFood(food))
    );
  };
}

// const foodController = new FoodController(new FoodService(Knex(knexConfig[env.NODE_ENV])));
// foodController.insertFood({ body: { foodName: "pineapple bun" } } as unknown as ExpressRequest);
