import { Knex } from "knex";
import schedule from "node-schedule";
import { Food } from "../../models/dbModels";
import { BriefFood } from "../../models/models";
import { ShopServiceHelper } from "../../models/serviceModels";
import { logger } from "../utils/logger";

export default class ShopService implements ShopServiceHelper {
  private static FOOD_NUM_ALLOWED = 12;
  private static RULE = new schedule.RecurrenceRule();
  constructor(private readonly knex: Knex) {
    //default rule: every 8am, 1pm, 7pm
    ShopService.RULE.hour = [8, 13, 19];
  }
  private getAllFoodIdsForShop = async (): Promise<number[]> => {
    return (await this.knex<Food>("food").select("id").whereNotNull("cost").orderBy("cost")).map(
      (e) => +e.id
    );
  };
  private drawRandomFood = async (): Promise<number[]> => {
    const availableFoodIds = await this.getAllFoodIdsForShop();
    const randomNumberSet = new Set<number>();
    while (randomNumberSet.size < ShopService.FOOD_NUM_ALLOWED) {
      const randomFoodId = availableFoodIds[Math.floor(Math.random() * availableFoodIds.length)];
      randomNumberSet.add(randomFoodId);
    }
    return Array.from(randomNumberSet);
  };
  private getUniversalShop = async (): Promise<BriefFood[]> => {
    const food = await this.knex<BriefFood>("shop")
      .select("food.id", "food.name", "food.calories", "food.cost")
      .join("food", "food_id", "food.id")
      .orderBy([{ column: "food.cost" }, { column: "food.id" }]);
    if (food.length > 0) return food;
    await this.updateUniversalShop();
    return this.getUniversalShop();
  };
  private getUserShop = async (userId: number): Promise<BriefFood[]> => {
    const userShop = await this.knex<BriefFood>("user_shop")
      .select("food.id", "food.name", "food.calories", "food.cost")
      .join("food", "food_id", "food.id")
      .where("user_id", userId);
    return userShop;
  };
  getShopItems = async (userId: number): Promise<{ food: BriefFood[]; isUniversal: boolean }> => {
    const userShop = await this.getUserShop(userId);
    if (userShop.length === 0) {
      const food = await this.getUniversalShop();
      return { food, isUniversal: true };
    }
    return { food: userShop, isUniversal: false };
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
  static get foodNumAllowed() {
    return ShopService.FOOD_NUM_ALLOWED;
  }
  static set rule(rule: schedule.RecurrenceRule) {
    ShopService.RULE = rule;
  }
  static get rule() {
    return ShopService.RULE;
  }
}
