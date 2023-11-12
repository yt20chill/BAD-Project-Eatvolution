import { Request } from "express";
import { ControllerResult, FoodControllerHelper } from "models/controllerModels";
import { CnItem } from "models/models";
import DbUtils from "../../src/utils/dbUtils";
import { ApplicationError, BadRequestError } from "../../src/utils/error";
import { AppUtils } from "../../src/utils/utils";
import { env } from "../utils/env";
import FoodService from "./food.service";

export default class FoodController implements FoodControllerHelper {
  constructor(private readonly foodService: FoodService) {}

  insertFood = async (req: Request): Promise<ControllerResult<string | null>> => {
    const userId = req.session.user.id;
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
    const insertedFoodId = await this.foodService.insert(
      userId,
      foodId === -1 ? DbUtils.cnItemToInsertFood(food) : foodId
    );
    req.foodId = insertedFoodId;
    return AppUtils.setServerResponse();
  };
  purchaseFood = async (req: Request) => {
    const userId = req.session.user.id;
    const foodId = req.foodId;
    if (!foodId || foodId === -1) throw new BadRequestError();
    await this.foodService.purchaseFood(userId, foodId);
    return AppUtils.setServerResponse(null);
  };
}
