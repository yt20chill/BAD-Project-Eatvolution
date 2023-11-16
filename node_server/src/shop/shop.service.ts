import { Knex } from "knex";
import { RedisClientType } from "redis";
import { Food } from "../../models/dbModels";
import { BriefFood } from "../../models/models";
import { ShopServiceHelper } from "../../models/serviceModels";
import UserService from "../user/user.service";
import DbUtils from "../utils/dbUtils";
import { BadRequestError, InternalServerError } from "../utils/error";
import gameConfig from "../utils/gameConfig";
import { logger } from "../utils/logger";
import { AppUtils } from "../utils/utils";

export default class ShopService implements ShopServiceHelper {
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
  /**
   *
   * @returns an array of food ids sorted by cost
   */
  private getAllFoodIdsForShop = async (): Promise<number[]> => {
    return (await this.knex<Food>("food").select("id").whereNotNull("cost").orderBy("cost")).map(
      (e) => +e.id
    );
  };
  private drawRandomFood = async (): Promise<number[]> => {
    const availableFoodIds = await this.getAllFoodIdsForShop();
    const randomNumberSet = new Set<number>();
    const foodNumAllowed = Math.min(gameConfig.FOOD_NUM_ALLOWED, availableFoodIds.length - 1);
    const maxCheapFoodIndex = Math.min(
      gameConfig.CHEAP_FOOD_MAX_INDEX,
      availableFoodIds.length - 1
    );
    while (randomNumberSet.size < foodNumAllowed) {
      const randomFoodId =
        randomNumberSet.size <= gameConfig.CHEAP_FOOD_NUM
          ? availableFoodIds[Math.floor(Math.random() * maxCheapFoodIndex)]
          : availableFoodIds[Math.floor(Math.random() * availableFoodIds.length)];

      randomNumberSet.add(randomFoodId);
    }
    return Array.from(randomNumberSet);
  };
  /**
   * Use timeout to wrap it in case it stuck in inf loop calling itself
   * @returns universal foodShop Items which applies to all users
   */
  private getUniversalShop = async (): Promise<BriefFood[]> => {
    let foodShop: Record<string, BriefFood[]> = {};
    if (await this.redis.exists("foodShop")) {
      foodShop = JSON.parse(await this.redis.get("foodShop"));
      if (foodShop.universal) return foodShop.universal;
    }
    let universalShop = await this.knex("shop")
      .select<BriefFood[]>("food.id", "food.name", "food.calories", "food.cost", "food.emoji")
      .join("food", "food_id", "food.id")
      .orderBy([{ column: "food.cost" }, { column: "food.id" }]);
    if (universalShop.length > 0) {
      universalShop = DbUtils.convertStringToNumber(universalShop);
      foodShop.universal = universalShop;
      await this.redis.set("foodShop", JSON.stringify(foodShop));
      return universalShop;
    }
    await this.updateUniversalShop();
    return this.getUniversalShop();
  };
  private getUserShop = async (userId: number): Promise<BriefFood[]> => {
    let foodShop: Record<string, BriefFood[]> = {};
    if (await this.redis.exists("foodShop")) {
      foodShop = JSON.parse(await this.redis.get("foodShop"));
      if (foodShop[userId]?.length > 0) return foodShop[userId];
    }
    let userShop = await this.knex<BriefFood>("user_shop")
      .select("food.id", "food.name", "food.calories", "food.cost", "food.emoji")
      .join("food", "food_id", "food.id")
      .where("user_id", userId);
    if (userShop.length > 0) {
      userShop = DbUtils.convertStringToNumber(userShop);
      foodShop[userId] = userShop;
      await this.redis.set("foodShop", JSON.stringify(foodShop));
    }
    return userShop;
  };
  /**
   *
   * @param userId
   * @returns userShop if exists, universalShop if userShop is empty, otherwise update userShop and return it
   */
  getFoodShop = async (userId: number): Promise<BriefFood[]> => {
    let foodShop: Record<string, BriefFood[]> = {};
    if (await this.redis.exists("foodShop")) {
      foodShop = JSON.parse(await this.redis.get("foodShop"));
      if (foodShop[userId]?.length > 0) return foodShop[userId];
    }
    const userShop = await this.getUserShop(userId);
    if (userShop.length > 0) {
      foodShop[userId] = userShop;
      this.redis.set("foodShop", JSON.stringify(foodShop));
      return userShop;
    }
    if (foodShop?.universal?.length > 0) {
      return foodShop.universal;
    }
    const universalShop = await AppUtils.rejectTimeoutPromise(this.getUniversalShop(), 5000);
    foodShop.universal = universalShop;
    this.redis.set("foodShop", JSON.stringify(foodShop));
    return universalShop;
  };
  updateUniversalShop = async (): Promise<boolean> => {
    const foodIds = await this.drawRandomFood();
    if (foodIds.length === 0) throw new InternalServerError();
    const foodArr = foodIds.reduce((acc, food_id) => {
      acc.push({ food_id });
      return acc;
    }, []);
    await this.redis.del("foodShop");
    const trx = await this.createTransaction();
    try {
      await this.knex("user_shop").del();
      await this.knex("shop").del();
      await this.knex("shop").insert(foodArr);
      await trx.commit();
      return true;
    } catch (error) {
      logger.error(error);
      await trx.rollback();
      return false;
    } finally {
      this.knex.bind(this.originalKnex);
    }
  };
  updateUserShop = async (userId: number): Promise<boolean> => {
    const trx = await this.createTransaction();
    const userService = new UserService(this.knex, this.redis);
    const { money } = await userService.getUserLatestFinancialStatus(userId);
    const moneyAfterPurchase = +money - gameConfig.REFRESH_PRICE;
    if (moneyAfterPurchase < 0) throw new BadRequestError("Insufficient money");
    const foodIds = await this.drawRandomFood();
    const foodArr = foodIds.reduce((acc, food_id) => {
      acc.push({ food_id, user_id: userId });
      return acc;
    }, []);
    const foodShop = JSON.parse(await this.redis.get("foodShop"));
    try {
      delete foodShop[userId];
      await this.redis.del(`${userId}`);
      await this.knex("user")
        .update({ money: moneyAfterPurchase, updated_at: this.knex.fn.now() })
        .where("id", userId);
      await this.redis.set("foodShop", JSON.stringify(foodShop));
      await this.knex("user_shop").del().where({ user_id: userId });
      await this.knex("user_shop").insert(foodArr);
      await trx.commit();
      return true;
    } catch (error) {
      logger.error(error);
      await trx.rollback();
      return false;
    } finally {
      this.knex.bind(this.originalKnex);
    }
  };

  /**
   *
   * @param userId
   * @param foodId
   * @returns food price if food exists in shop, custom food price if food is custom, otherwise throw BadRequestError
   */
  getFoodCost = async (userId: number, foodId: number): Promise<number> => {
    const foodShop = await this.getFoodShop(userId);
    const food = foodShop.find((food) => food.id === foodId);
    const isCustomFood =
      (await this.knex<Food>("food").select("cost").where("id", foodId).first()).cost === null;
    if (!food && !isCustomFood) throw new BadRequestError("food doesn't exists in shop");
    return isCustomFood ? gameConfig.CUSTOM_FOOD_PRICE : food.cost;
  };
}
