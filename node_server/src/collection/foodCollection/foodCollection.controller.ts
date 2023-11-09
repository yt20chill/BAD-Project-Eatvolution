import { Request } from "express";
import { ControllerResult, FoodCollectionControllerHelper } from "../../../models/controllerModels";
import { ExportFoodCollection, FoodCollection } from "../../../models/models";
import FoodService from "../../food/food.service";
import { AppUtils } from "../../utils/utils";
import FoodCollectionService from "./foodCollection.service";

export default class FoodCollectionController implements FoodCollectionControllerHelper {
  constructor(
    private readonly foodCollectionService: FoodCollectionService,
    private readonly foodService: FoodService
  ) {}
  getWholeFoodCollection = async (
    req: Request
  ): Promise<ControllerResult<ExportFoodCollection>> => {
    const { userId } = req.session;
    const { unlockedIds, lockedIds } = await this.foodCollectionService.getAllFoodIds(userId);
    const unlockedUniversalFood =
      unlockedIds.universal.length > 0
        ? await this.getFoodDetails(...unlockedIds.universal)
        : ([] as FoodCollection[]);
    const unlockedCustomFood =
      unlockedIds.custom.length > 0
        ? await this.getFoodDetails(...unlockedIds.custom)
        : ([] as FoodCollection[]);
    return AppUtils.setServerResponse({
      unlocked: { universal: unlockedUniversalFood, custom: unlockedCustomFood },
      locked: lockedIds,
    });
  };
  private getFoodDetails = async (...foodIds: number[]) => {
    return await this.foodService.getDetails(...foodIds);
  };
}
