import { Knex } from "knex";
import { RedisClientType } from "redis";
import { Food } from "../../models/dbModels";
import { BriefFood } from "../../models/models";
import { ShopServiceHelper } from "../../models/serviceModels";
import gameConfig from "../utils/gameConfig";
import { logger } from "../utils/logger";

export default class ShopService implements ShopServiceHelper {
  constructor(
    private readonly knex: Knex,
    private readonly redis: RedisClientType
  ) {}
  private getAllFoodIdsForShop = async (): Promise<number[]> => {
    return (await this.knex<Food>("food").select("id").whereNotNull("cost").orderBy("cost")).map(
      (e) => +e.id
    );
  };
  private drawRandomFood = async (): Promise<number[]> => {
    const availableFoodIds = await this.getAllFoodIdsForShop();
    const randomNumberSet = new Set<number>();
    while (randomNumberSet.size < gameConfig.FOOD_NUM_ALLOWED) {
      const randomFoodId = availableFoodIds[Math.floor(Math.random() * availableFoodIds.length)];
      randomNumberSet.add(randomFoodId);
    }
    return Array.from(randomNumberSet);
  };
  private getUniversalShop = async (): Promise<BriefFood[]> => {
    const food = await this.knex<BriefFood>("shop")
      .select("food.id", "food.name", "food.calories", "food.cost", "food.emoji")
      .join("food", "food_id", "food.id")
      .orderBy([{ column: "food.cost" }, { column: "food.id" }]);
    if (food.length > 0) return food;
    await this.updateUniversalShop();
    return this.getUniversalShop();
  };
  private getUserShop = async (userId: number): Promise<BriefFood[]> => {
    const userShop = await this.knex<BriefFood>("user_shop")
      .select("food.id", "food.name", "food.calories", "food.cost", "food.emoji")
      .join("food", "food_id", "food.id")
      .where("user_id", userId);
    return userShop;
  };
  getShopItems = async (userId: number): Promise<BriefFood[]> => {
    let food: BriefFood[];
    if (await this.redis.exists(`shop-${userId}`)) {
      return JSON.parse(await this.redis.get(`shop-${userId}`));
    }
    food = await this.getUserShop(userId);
    if (food.length !== 0) {
      this.redis.set(`shop-${userId}`, JSON.stringify(food));
      return food;
    }
    if (await this.redis.exists(`shop`)) {
      return JSON.parse(await this.redis.get(`shop`));
    }
    food = await this.getUniversalShop();
    this.redis.set(`shop`, JSON.stringify(food));
    return food;
  };
  updateUniversalShop = async (): Promise<boolean> => {
    const foodIds = await this.drawRandomFood();
    const foodArr = foodIds.reduce((acc, food_id) => {
      acc.push({ food_id });
      return acc;
    }, []);
    const trx = await this.knex.transaction();
    try {
      await trx("user_shop").del();
      await trx("shop").del();
      await trx("shop").insert(foodArr);
      await trx.commit();
      return true;
    } catch (error) {
      logger.error(error);
      await trx.rollback();
      return false;
    }
  };
  updateUserShop = async (userId: number): Promise<boolean> => {
    const foodIds = await this.drawRandomFood();
    const foodArr = foodIds.reduce((acc, food_id) => {
      acc.push({ food_id, user_id: userId });
      return acc;
    }, []);
    const trx = await this.knex.transaction();
    try {
      await trx("user_shop").del().where({ user_id: userId });
      await trx("user_shop").insert(foodArr);
      await trx.commit();
      return true;
    } catch (error) {
      logger.error(error);
      await trx.rollback();
      return false;
    }
  };
}
