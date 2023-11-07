import { Knex } from "knex";
import { Food, FoodDetails } from "models/dbModels";
import { InsertFood } from "models/models";
import { FoodServiceHelper } from "models/serviceModels";
import { env } from "../../src/env";
import { BadRequestError } from "../../src/utils/error";
import { logger } from "../../src/utils/logger";

export default class FoodService implements FoodServiceHelper {
  constructor(private readonly knex: Knex) {}
  insert = async (userId: number, food_: InsertFood): Promise<boolean> => {
    const food = { ...food_ };
    food.cost = null;
    food.name = food.name.trim().toLowerCase();
    // if food.name is empty after conversion
    if (!food.name) throw new BadRequestError();
    let foodId = await this.isExisting(food);
    if (foodId !== -1 && (await this.isCustomFoodDuplicated(userId, foodId))) return false;
    const trx = await this.knex.transaction();
    try {
      if (foodId === -1) {
        food.category_id = (await this.getCategory(food))[0] ?? null;
        // logger.debug(food.category_id);
      }
      //insert to food table only if foodId is not -1
      foodId = foodId === -1 ? (await trx("food").insert(food).returning("id"))[0]["id"] : foodId;
      await trx("user_custom_food").insert({ food_id: foodId, user_id: userId });
      trx.commit();
      return true;
    } catch (error) {
      logger.error(error.message);
      trx.rollback();
      return false;
    }
  };

  getFoodForShop = async () => {
    return await this.knex<Food>("food")
      .select("id", "name", "calories", "cost")
      .whereNotNull("cost")
      .orderBy("id");
  };

  getDetails = async (...foodIds: Array<number>): Promise<FoodDetails[]> => {
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
      .select<FoodDetails[]>(
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
      logger.debug(`invalid input: ${foodId}, ${foodName}`);
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
