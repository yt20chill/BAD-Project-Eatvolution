import { Knex } from "knex";
import { Food, FoodDetails, GeneralOmitFields } from "models/dbModels";
import { FoodServiceHelper } from "models/serviceModels";
import { BadRequestError } from "../../src/utils/error";
import { logger } from "../../src/utils/logger";

export default class FoodService implements FoodServiceHelper {
  constructor(private readonly knex: Knex) {}
  insert = async (userId: number, food: Omit<Food, GeneralOmitFields>): Promise<void> => {
    food.cost = null;
    food.name = food.name.trim().toLowerCase();
    // if food.name is empty after conversion
    if (!food.name) throw new BadRequestError();
    let foodId = await this.isExisting(food);
    if (foodId !== -1 && (await this.isCustomFoodDuplicated(userId, foodId))) return;
    const trx = await this.knex.transaction();
    try {
      //insert to food table only if foodId is not -1
      foodId = foodId === -1 ? (await trx("food").insert(food).returning("id"))[0]["id"] : foodId;
      logger.debug(`foodId: ${foodId}`);
      await trx("user_custom_food").insert({ food_id: foodId, user_id: userId });
      trx.commit();
    } catch (error) {
      logger.error(error.message);
      trx.rollback();
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
    const result = await this.knex("food")
      .select<Omit<FoodDetails, "category_name">[]>(
        "id",
        "name as food_name",
        "calories",
        "protein",
        "fat",
        "saturated_fat",
        "cholesterol",
        "carbohydrates",
        "fibre",
        "sugar",
        "sodium"
      )
      .whereIn("id", validIds);
    return (
      await Promise.all(
        result.map(async (food: FoodDetails) => {
          food.category_name = await this.getFoodCategory(food.id);
          return food as FoodDetails;
        })
      )
    ).sort((a, b) => a.id - b.id);
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

  private getFoodCategory = async (foodId: number): Promise<Array<string>> => {
    return (
      await this.knex("category")
        .select("category.name as category_name")
        .join("food_category", "food_category.category_id", "category.id")
        .where("food_category.food_id", foodId)
    ).reduce((acc, elem) => {
      acc.push(elem["category_name"]);
      return acc;
    }, [] as Array<string>);
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
}
