// bind knex transactions

import { Knex } from "knex";
import { RedisClientType } from "redis";
import { Food, Item, User } from "../../models/dbModels";
import { GameServiceHelper } from "../../models/serviceModels";
import UserService from "../user/user.service";
import { BadRequestError, InternalServerError } from "../utils/error";
import { logger } from "../utils/logger";

export default class GameService implements GameServiceHelper {
  constructor(
    private knex: Knex,
    private readonly redis: RedisClientType
  ) {}
  updateAllUsers = async (): Promise<boolean> => {
    const trx = await this.knex.transaction();
    const userService = new UserService(trx, this.redis);
    try {
      const userIds = await trx<User>("user").select("id");
      await Promise.all(
        userIds.map(async (id) => {
          const result = await userService.receiveSalary(id);
          if (!result) throw new InternalServerError();
        })
      );
      await trx.commit();
      return true;
    } catch (error) {
      logger.error(error);
      await trx.rollback();
      return false;
    }
  };
  purchaseFood = async (userId: number, foodId: number): Promise<boolean> => {
    let cost: number;
    const trx = await this.knex.transaction();
    try {
      if (await this.redis.exists(`food-${foodId}`)) {
        cost = JSON.parse(await this.redis.get(`food-${foodId}`)).cost;
      } else {
        cost = +(await trx<Food>("food").select("cost").where("id", foodId).first()).cost;
        await this.redis.set(`food-${foodId}`, JSON.stringify({ cost }));
      }
      if (!cost) throw new BadRequestError();
      const userService = new UserService(trx, this.redis);
      const money = await userService.getSavings(userId);
      const moneyAfterPurchase = money - cost;
      if (moneyAfterPurchase < 0) return false;
      await trx("user")
        .update({ money: moneyAfterPurchase, updated_at: this.knex.fn.now() })
        .where("id", userId);
      await trx.commit();
      await this.redis.setEx(`money-${userId}`, 60, moneyAfterPurchase + "");
      return true;
    } catch (error) {
      logger.error(error);
      await trx.rollback();
      return false;
    }
  };

  purchaseItem = async (userId: number, itemId: number): Promise<boolean> => {
    let cost: number;
    const trx = await this.knex.transaction();
    try {
      if (await this.redis.exists(`item-${itemId}`)) {
        cost = JSON.parse(await this.redis.get(`item-${itemId}`)).cost;
      } else {
        cost = +(await trx<Item>("item").select("cost").where("id", itemId).first()).cost;
      }
      if (!cost) throw new BadRequestError();
      const userService = new UserService(trx, this.redis);
      const money = await userService.getSavings(userId);
      const moneyAfterPurchase = money - cost;
      if (moneyAfterPurchase < 0) return false;
      await trx("user")
        .update({ money: moneyAfterPurchase, updated_at: this.knex.fn.now() })
        .where("id", userId);
      await trx.commit();
      await this.redis.setEx(`money-${userId}`, 60, moneyAfterPurchase + "");
      return true;
    } catch (error) {
      logger.error(error);
      await trx.rollback();
      return false;
    }
  };
}
