import { Request as ExpressRequest } from "express";
<<<<<<< HEAD
import { CnItem } from "models/models";
=======
>>>>>>> 20a0bf9c12c2e4d44a0d2f326ed4f980d35f81d6
import { RedisClientType } from "redis";
import DbUtils from "src/utils/dbUtils";
import { AppUtils } from "src/utils/utils";
import { env } from "../../src/env";
import { ApplicationError, BadRequestError } from "../../src/utils/error";
import { logger } from "../../src/utils/logger";
import FoodService from "./food.service";

export default class FoodController {
  constructor(
    private readonly foodService: FoodService,
    private readonly redis?: RedisClientType
  ) {}

  insertFood = async (req: ExpressRequest) => {
    const foodName = req.body.foodName?.trim().toLowerCase();
    logger.debug(foodName);
    if (!foodName) throw new BadRequestError();
    const res = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${foodName}`, {
      headers: { "X-API-Key": env.CN_API_KEY },
    });
    if (!res.ok) throw new ApplicationError(res.status, res.statusText);
    const food: CnItem[] = (await res.json()).items;
    // not found or wrongly found
    if (food.length === 0 || !food[0].name.includes(foodName))
      return AppUtils.setServerResponse(`fail to search ${foodName}`, false);
    return AppUtils.setServerResponse(
      null,
      // will only insert the first food if there are multiple food, return insertion result
      await this.foodService.insert(req.session.userId, DbUtils.cnItemToInsertFood(items[0]))
    );
  };
}

// const foodController = new FoodController(new FoodService(Knex(knexConfig[env.NODE_ENV])));
// foodController.insertFood({ body: { foodName: "pineapple bun" } } as unknown as ExpressRequest);
