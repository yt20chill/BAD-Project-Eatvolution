import { Knex } from "knex";
import { FoodServiceHelper } from "models/serviceModels";
import { RedisClientType } from "redis";
import { ExportSlime, FoodCollection, InsertFood } from "../../models/models";
import { BadRequestError, InternalServerError } from "../../src/utils/error";
import { logger } from "../../src/utils/logger";
import FoodCollectionService from "../collection/foodCollection/foodCollection.service";
import ShopService from "../shop/shop.service";
import SlimeService from "../slime/slime.service";
import UserService from "../user/user.service";
import DbUtils from "../utils/dbUtils";
import { env } from "../utils/env";

export default class FoodService implements FoodServiceHelper {
  private readonly originalKnex: Knex;
  constructor(
    private readonly knex: Knex,
    private readonly redis: RedisClientType
  ) {
    this.originalKnex = knex;
  }
  private createTransaction = async (): Promise<Knex.Transaction> => {
    const trx = await this.knex.transaction();
    this.knex.bind(trx);
    return trx;
  };
  insert = async (userId: number, food: InsertFood | number): Promise<number> => {
    if (typeof food === "number") {
      await this.insertCustomFood(userId, food);
      return food;
    }
    const foodCopy = { ...food };
    foodCopy.cost = null;
    foodCopy.name = foodCopy.name.trim().toLowerCase();
    let foodId = await this.isExisting(foodCopy);
    if (foodId !== -1 && (await this.isCustomFoodDuplicated(userId, foodId))) return foodId;
    const trx = await this.createTransaction();
    try {
      if (foodId === -1) {
        foodCopy.category_id = (await this.getCategory(foodCopy))[0] ?? null;
        foodId = (await this.knex("food").insert(foodCopy).returning("id"))[0]["id"];
      }
      await this.insertCustomFood(userId, foodId);
      await trx.commit();
      return foodId;
    } catch (error) {
      logger.error(error.message);
      await trx.rollback();
      throw new InternalServerError("failed to insert food to food table");
    } finally {
      this.knex.bind(this.originalKnex);
    }
  };
  private insertCustomFood = async (userId: number, foodId: number) => {
    if (
      foodId === -1 ||
      (await this.isCustomFood(foodId)) ||
      (await this.isCustomFoodDuplicated(userId, foodId))
    )
      return;
    await this.knex("user_custom_food").insert({ food_id: foodId, user_id: userId });
    return;
  };
  private isCustomFood = async (foodId: number) => {
    return (
      (await this.knex("food").select("id").whereNotNull("cost").andWhere("id", foodId)).length > 0
    );
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
    const foodDetails = await this.knex("food")
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
        "category.name as category_name",
        this.knex.raw(`CASE WHEN food.cost IS NULL THEN true ELSE false END as "isCustom"`)
      )
      .leftJoin("category", "category.id", "food.category_id")
      .whereIn("food.id", validIds)
      .orderBy("food.id");
    return foodDetails.map((food) => DbUtils.convertStringToNumber(food));
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
      throw new BadRequestError();
    }
    const query = this.knex("food").select("id");
    const result = foodId ? await query.where("id", foodId) : await query.where("name", foodName);
    return result.length !== 0 ? result[0]["id"] : -1;
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

  // purchase + feed + unlock food collection
  purchaseFood = async (userId: number, foodId: number, slimeId?: number): Promise<ExportSlime> => {
    const shopService = new ShopService(this.knex, this.redis);
    const cost = await shopService.getFoodCost(userId, foodId);
    const moneyAfterPurchase = await this.getMoneyAfterPurchase(userId, cost);
    const trx = await this.createTransaction();
    try {
      await this.knex("user")
        .update({ money: moneyAfterPurchase, updated_at: this.knex.fn.now() })
        .where("id", userId);
      const slime = await this.feedSlime(userId, foodId, slimeId);
      await this.unlockFoodCollection(userId, foodId);
      await trx.commit();
      //delete user financial status from redis to force it to sync from db
      await this.redis.del(`${userId}`);
      return slime;
    } catch (error) {
      logger.error(error);
      await trx.rollback();
      throw new InternalServerError("failed to purchase food");
    } finally {
      this.knex.bind(this.originalKnex);
    }
  };
  /**
   *
   * @param userId
   * @param cost
   * @returns money after purchase if user has enough money, otherwise throw BadRequestError
   */
  private getMoneyAfterPurchase = async (userId: number, cost: number): Promise<number> => {
    const userService = new UserService(this.knex, this.redis);
    const { money } = await userService.getUserLatestFinancialStatus(userId);
    const moneyAfterPurchase = money - cost;
    if (moneyAfterPurchase < 0) throw new BadRequestError("Insufficient money");
    return moneyAfterPurchase;
  };
  private feedSlime = async (
    userId: number,
    foodId: number,
    slimeId?: number
  ): Promise<ExportSlime> => {
    // feed the first slime
    if (slimeId === undefined) {
      slimeId = (await this.knex("slime").select("id").where("owner_id", userId).first()).id;
    }

    if (!slimeId) throw new InternalServerError("user has no slime");
    const slimeService = new SlimeService(this.knex, this.redis);
    const updatedSlime = await slimeService.feed(userId, slimeId, foodId);
    return updatedSlime;
  };
  private unlockFoodCollection = async (userId: number, foodId: number): Promise<void> => {
    const foodCollectionService = new FoodCollectionService(this.knex);
    await foodCollectionService.unlock(userId, foodId);
  };

  // this is to retrain model based on inserted food
  private scheduleUpdateModel = async () => {};
  // this is to re-categorize food based on updated model
  private scheduleUpdateCategory = async () => {};
}
