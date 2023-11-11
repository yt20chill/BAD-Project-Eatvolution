import { Knex } from "knex";
import { RedisClientType } from "redis";
import { Item, User } from "../../models/dbModels";
import { GameServiceHelper } from "../../models/serviceModels";
import ShopService from "../shop/shop.service";
import UserService from "../user/user.service";
import { BadRequestError, InternalServerError } from "../utils/error";
import { logger } from "../utils/logger";

export default class GameService implements GameServiceHelper {
  constructor(
    private readonly knex: Knex,
    private readonly redis: RedisClientType,
    private readonly shopService: ShopService
  ) {}
  private feedSlime = async (trx: Knex, userId: number, foodId: number): Promise<void> => {
    // feed the first slime
    const { slime_id } = await trx("slime")
      .select("id as slime_id")
      .where("owner_id", userId)
      .first();
    if (!slime_id) throw new InternalServerError();
    await trx("slime_food").insert({ slime_id, food_id: foodId });
  };
  updateAllUsers = async (): Promise<boolean> => {
    const trx = await this.knex.transaction();
    const userService = new UserService(trx, this.redis);
    try {
      const userIds = (await trx<User>("user").select("id")).map((user) => user.id);
      await Promise.all(
        userIds.map(async (id) => {
          const result = await userService.updateUserFinancialStatus(id);
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
    const cost = await this.shopService.getFoodCost(userId, foodId);
    const trx = await this.knex.transaction();
    try {
      const moneyAfterPurchase = await this.getMoneyAfterPurchase(trx, userId, cost);
      await trx("user")
        .update({ money: moneyAfterPurchase, updated_at: this.knex.fn.now() })
        .where("id", userId);
      await this.feedSlime(trx, userId, foodId);
      await trx.commit();
      //delete user financial status from redis to force it to sync from db
      await this.redis.del(`${userId}`);
      return true;
    } catch (error) {
      logger.error(error);
      await trx.rollback();
      return false;
    }
  };

  //hardcode version
  purchaseCustomFood = async (userId: number): Promise<boolean> => {
    const trx = await this.knex.transaction();
    try {
      const { cost } = await trx<Item>("item").select("cost").where("name", "custom-food").first();
      if (cost < 0) throw new BadRequestError();
      const moneyAfterPurchase = await this.getMoneyAfterPurchase(trx, userId, cost);
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

  /**
   *
   * @param trx
   * @param userId
   * @param cost
   * @returns money after purchase if user has enough money, otherwise throw BadRequestError
   */
  private getMoneyAfterPurchase = async (
    trx: Knex,
    userId: number,
    cost: number
  ): Promise<number> => {
    const userService = new UserService(trx, this.redis);
    const { money } = await userService.getUserLatestFinancialStatus(userId);
    const moneyAfterPurchase = money - cost;
    if (moneyAfterPurchase < 0) throw new BadRequestError();
    return moneyAfterPurchase;
  };
}
