import { Knex } from "knex";
import { BriefFood, FoodCollection, InsertFood } from "models/models";
import { FoodServiceHelper } from "models/serviceModels";
import { Food } from "../../models/dbModels";
import { env } from "../../src/env";
import { BadRequestError } from "../../src/utils/error";
import { logger } from "../../src/utils/logger";

export default class FoodService implements FoodServiceHelper {
  constructor(private readonly knex: Knex) {}
  insert = async (userId: number, food: InsertFood | number): Promise<boolean> => {
    if (typeof food === "number") {
      return await this.insertExistingFood(userId, food);
    }
    const foodCopy = { ...food };
    foodCopy.cost = null;
    foodCopy.name = foodCopy.name.trim().toLowerCase();
    let foodId = await this.isExisting(foodCopy);
    if (foodId !== -1 && (await this.isCustomFoodDuplicated(userId, foodId))) return false;
    const trx = await this.knex.transaction();
    try {
      if (foodId === -1) {
        foodCopy.category_id = (await this.getCategory(foodCopy))[0] ?? null;
        // logger.debug(food.category_id);
      }
      //insert to food table only if foodId is not -1
      foodId =
        foodId === -1 ? (await trx("food").insert(foodCopy).returning("id"))[0]["id"] : foodId;
      await trx("user_custom_food").insert({ food_id: foodId, user_id: userId });
      await trx.commit();
      return true;
    } catch (error) {
      logger.error(error.message);
      await trx.rollback();
      return false;
    }
  };
  private insertExistingFood = async (userId: number, foodId: number) => {
    if (await this.isCustomFoodDuplicated(userId, foodId)) return false;
    await this.knex("user_custom_food").insert({ food_id: foodId, user_id: userId });
    return true;
  };

  getFoodForShop = async (): Promise<BriefFood[]> => {
    return (await this.knex<Food>("food")
      .select("id", "name", "calories", "cost")
      .whereNotNull("cost")
      .orderBy("id")) as BriefFood[];
  };

  getDetails = async (...foodIds: Array<number>): Promise<FoodCollection[]> => {
    const validIds = (
      await Promise.all(
        foodIds.map(async (id) => {
          try {
            id = (await this.isExisting({ id })) === -1 ? null : id;
            return id;
          } catch (error) {
            return null;
          }
        })
      )
    ).filter((id) => id !== null);
    if (validIds.length === 0) throw new BadRequestError();
    return await this.knex("food")
      .select<FoodCollection[]>(
        "food.id",
        "food.name as food_name",
        "food.calories",
        "food.protein",
        "food.fat",
        "food.saturated_fat",
        "food.cholesterol",
        "food.carbohydrates",
        "food.fibre",
        "food.sugar",
        "food.sodium",
        "category.name as category_name"
      )
      .leftJoin("category", "category.id", "food.category_id")
      .whereIn("food.id", validIds)
      .orderBy("food.id");
  };

  isExisting = async (options: { id?: number; name?: string }): Promise<number> => {
    const foodId = options.id ?? undefined;
    // foodName = undefined if undefined, empty, or contains only whitespace. otherwise = trim() and lowercase
    const foodName =
      options.name && options.name.trim() ? options.name.trim().toLowerCase() : undefined;
    // if id and name is missing or both id and name exist (XOR), or id <= 0 or is float number
    if (
      !(foodId || foodName) ||
      (foodId && foodName) ||
      (!foodName && (foodId <= 0 || foodId % 1 !== 0))
    ) {
      // logger.debug(`invalid input: ${foodId}, ${foodName}`);
      throw new BadRequestError();
    }
    const query = this.knex("food").select("id");
    const result = foodId ? await query.where("id", foodId) : await query.where("name", foodName);
    return result.length !== 0 ? result[0]["id"] : -1;
  };

  private isCustomFoodDuplicated = async (userId: number, foodId: number): Promise<boolean> => {
    return !(
      foodId === -1 ||
      (
        await this.knex("user_custom_food")
          .select("id")
          .where("food_id", foodId)
          .andWhere("user_id", userId)
      ).length === 0
    );
  };

  private getCategory = async (food: InsertFood): Promise<Array<number>> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, cost, category_id, ...rest } = food;
    try {
      const res = await fetch(`${env.PY_URL}:${env.PY_PORT}/foodClassifier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
      });
      if (!res.ok) return [];
      const result = await res.json();
      if (!result.success) return [];
      return result.result.map((r: string | number) => +r + 1);
    } catch (error) {
      logger.error(error.message);
      return [];
    }
  };
  // this is to retrain model based on inserted food
  private scheduleUpdateModel = async () => {};
  // this is to re-categorize food based on updated model
  private scheduleUpdateCategory = async () => {};
}
