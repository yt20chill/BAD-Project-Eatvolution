// bind knex transactions

import { Knex } from "knex";
import { RedisClientType } from "redis";
import { GameServiceHelper } from "../../models/serviceModels";
import UserService from "../user/user.service";
import { BadRequestError } from "../utils/error";
import gameConfig from "../utils/gameConfig";

export default class GameService implements GameServiceHelper {
  constructor(
    private knex: Knex,
    private readonly redis: RedisClientType,
    private readonly userService: UserService
  ) {}

  updateAllUsersSavings = async () => {
    const allUserSavings = await this.knex("user").select("id", "money", "total_money");
    const userIds: number[] = allUserSavings.map((user) => user.id);
  };

  //{userId: earnRate}
  calculateAllEarningRate = async () => {
    // slime earn_rate_multiplier with owner id
    const slimeEarnRate = this.knex("slime")
      .select("slime_type.earn_rate_multiplier", "user.id as owner_id")
      .join("user", "slime.owner_id", "user.id")
      .join("slime_type", "slime.slime_type_id", "slime_type.id");
    const query = this.knex("slime_food")
      .with("s1", slimeEarnRate)
      .select(this.knex.raw(`SUM(food.protein * s1.earn_rate_multiplier * ?) as "userEarnRate"`), [
        gameConfig.EARNING_RATE_CONSTANT,
      ])
      .join("user", "s1.owner_id", "user.id")
      .join("food", "food.id", "slime_food.food_id")
      .groupBy("s1.owner_id");
  };

  purchaseFood = async (userId: number, foodId: number): Promise<boolean> => {
    const { cost } = await trx<Food>("food").select("cost").where("id", foodId).first();
    if (!cost) throw new BadRequestError();
    const money = await this.getSavings(userId);
    const moneyAfterPurchase = money - cost;
    if (moneyAfterPurchase < 0) return false;
    await trx("user")
      .update({ money: moneyAfterPurchase, updated_at: this.knex.fn.now() })
      .where("id", userId);
    return true;
  };
  purchaseItem = async (userId: number, itemId: number): Promise<boolean> => {
    const { cost } = await trx<Item>("item").select("cost").where("id", itemId).first();
    if (!cost) throw new BadRequestError();
    const money = await this.getSavings(userId, knex);
    const moneyAfterPurchase = money - cost;
    if (moneyAfterPurchase < 0) return false;
    await trx("user")
      .update({ money: moneyAfterPurchase, updated_at: knex.fn.now() })
      .where("id", userId);
    await this.redis.setEx(`money-${userId}`, 60, moneyAfterPurchase + "");
    return true;
  };
}
