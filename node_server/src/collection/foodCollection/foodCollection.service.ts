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
          acc.custom.add(food.id);
        } else {
          acc.universal.add(food.id);
        }
        return acc;
      },
      { universal: new Set<number>(), custom: new Set<number>() }
    );
  };
  getAllFoodIds = async (
    userId: number
  ): Promise<{ unlockedIds: FoodCollectionIds; lockedIds: FoodCollectionIds }> => {
    const unlockedFoodIds = await this.getUnlockedFoodIds(userId);
    const allUnlockedFoodIds = [...unlockedFoodIds.custom, ...unlockedFoodIds.universal];
    const lockedFood = await this.knex("food")
      .select(
        "id",
        this.knex.raw("CASE WHEN food.cost IS NULL THEN true ELSE false END as isCustom")
      )
      .whereNotIn("id", allUnlockedFoodIds);
    const lockedFoodIds = lockedFood.reduce(
      (acc: FoodCollectionIds, food) => {
        if (food.isCustom) {
          acc.custom.add(food.id);
        } else {
          acc.universal.add(food.id);
        }
        return acc;
      },
      { universal: new Set<number>(), custom: new Set<number>() }
    );
    return { unlockedIds: unlockedFoodIds, lockedIds: lockedFoodIds };
  };
  unlock = async (userId: number, foodId: number): Promise<void> => {
    const { universal, custom } = await this.getUnlockedFoodIds(userId);
    // if already unlocked
    if (universal.has(foodId) || custom.has(foodId)) return;
    await this.knex("user_food_collection").insert({ user_id: userId, food_id: foodId });
    return;
  };
}
