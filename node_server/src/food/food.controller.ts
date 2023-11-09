import { Request as ExpressRequest } from "express";
import { ControllerResult, FoodControllerHelper } from "models/controllerModels";
import { CnItem } from "models/models";
import { env } from "../../src/env";
import DbUtils from "../../src/utils/dbUtils";
import { ApplicationError, BadRequestError } from "../../src/utils/error";
import { AppUtils } from "../../src/utils/utils";
import FoodService from "./food.service";

export default class FoodController implements FoodControllerHelper {
  constructor(private readonly foodService: FoodService) {}

  insertFood = async (req: ExpressRequest): Promise<ControllerResult<string | null>> => {
    const foodName = req.body.foodName?.trim().toLowerCase();
    if (!foodName) throw new BadRequestError();
    const foodId = await this.foodService.isExisting({ name: foodName });
    let food: CnItem;
    if (foodId === -1) {
      const res = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${foodName}`, {
        headers: { "X-API-Key": env.CN_API_KEY },
      });
      if (!res.ok) throw new ApplicationError(res.status, res.statusText);
      // will only insert the first food if there are multiple food, return insertion result
      food = (await res.json()).items[0];
      // not found or wrongly found
      if (!food?.name.includes(foodName))
        return AppUtils.setServerResponse<string>(`fail to search ${foodName}`, false);
    }
    await this.foodService.insert(
      req.session.userId,
      foodId === -1 ? DbUtils.cnItemToInsertFood(food) : foodId
    );
    return AppUtils.setServerResponse<null>();
  };
}
