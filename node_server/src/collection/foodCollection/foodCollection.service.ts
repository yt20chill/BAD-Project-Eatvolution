import { Knex } from "knex";
import { FoodCollectionIds } from "../../../models/models";
import { FoodCollectionServiceHelper } from "../../../models/serviceModels";

export default class FoodCollectionService implements FoodCollectionServiceHelper {
  constructor(private readonly knex: Knex) {}
  getUnlockedFoodIds = async (userId: number): Promise<FoodCollectionIds> => {
    const unlockedFood = await this.knex("food")
      .select(
        "food.id",
        this.knex.raw("CASE WHEN food.cost IS NULL THEN true ELSE false END as isCustom")
      )
      .join("user_food_collection", "user_food_collection.food_id", "food.id")
      .where("user_food_collection.user_id", userId);
    return unlockedFood.reduce(
      (acc: FoodCollectionIds, food) => {
        if (food.isCustom) {
          acc.custom.push(food.id);
        } else {
          acc.universal.push(food.id);
        }
        return acc;
      },
      { universal: [], custom: [] }
    );
  };
  getAllFoodIds = async (
    userId: number
  ): Promise<{ unlockedIds: FoodCollectionIds; lockedIds: FoodCollectionIds }> => {
    const unlockedFoodIds = await this.getUnlockedFoodIds(userId);
    const allUnlockedFoodIds = unlockedFoodIds.universal.concat(unlockedFoodIds.custom);
    const lockedFood = await this.knex("food")
      .select(
        "id",
        this.knex.raw("CASE WHEN food.cost IS NULL THEN true ELSE false END as isCustom")
      )
      .whereNotIn("id", allUnlockedFoodIds);
    const lockedFoodIds = lockedFood.reduce(
      (acc, food) => {
        if (food.isCustom) {
          acc.custom.push(food.id);
        } else {
          acc.universal.push(food.id);
        }
        return acc;
      },
      { universal: [], custom: [] } as FoodCollectionIds
    );
    return { unlockedIds: unlockedFoodIds, lockedIds: lockedFoodIds };
  };
}
