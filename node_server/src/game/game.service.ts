import { Knex } from "knex";
import { RedisClientType } from "redis";
import { Slime, User } from "../../models/dbModels";
import { GameServiceHelper } from "../../models/serviceModels";
import FoodCollectionService from "../collection/foodCollection/foodCollection.service";
import ShopService from "../shop/shop.service";
import SlimeService from "../slime/slime.service";
import UserService from "../user/user.service";
import { BadRequestError, InternalServerError } from "../utils/error";
import { logger } from "../utils/logger";

export default class GameService implements GameServiceHelper {
  constructor(
    private knex: Knex,
    private readonly redis: RedisClientType
  ) {}
  private createTransaction = async (): Promise<Knex.Transaction> => {
    const trx = await this.knex.transaction();
    this.knex.bind(trx);
    return trx;
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
  private feedSlime = async (userId: number, foodId: number): Promise<void> => {
    // feed the first slime
    const { slime_id } = await this.knex("slime")
      .select("id as slime_id")
      .where("owner_id", userId)
      .first();
    if (!slime_id) throw new InternalServerError("user has no slime");
    const slimeService = new SlimeService(this.knex);
    await slimeService.feed(slime_id, foodId);
  };
  private unlockFoodCollection = async (userId: number, foodId: number): Promise<void> => {
    const foodCollectionService = new FoodCollectionService(this.knex);
    await foodCollectionService.unlock(userId, foodId);
  };
  private updateAllSlimes = async (): Promise<void> => {
    const slimeService = new SlimeService(this.knex);
    const slimeIds = (await this.knex<Slime>("slime").select("id").where("is_archived", false)).map(
      (e) => e.id
    );
    if (slimeIds.length === 0) return; //no slimes to be updated
    await Promise.all(slimeIds.map(async (id) => await slimeService.reduceCalories(id)));
  };
  updateAllUsers = async (): Promise<void> => {
    const trx = await this.createTransaction();
    const userService = new UserService(this.knex, this.redis);
    const userIds = (await this.knex<User>("user").select("id")).map((user) => user.id);
    if (userIds.length === 0) return; //no users to be updated
    try {
      await this.updateAllSlimes();
      await Promise.all(
        userIds.map(async (id) => {
          await userService.updateUserFinancialStatus(id);
        })
      );
      await trx.commit();
    } catch (error) {
      logger.error(error);
      await trx.rollback();
      throw error;
    }
  };
  // purchase + feed + unlock food collection
  purchaseFood = async (userId: number, foodId: number): Promise<boolean> => {
    const shopService = new ShopService(this.knex, this.redis);
    const cost = await shopService.getFoodCost(userId, foodId);
    const moneyAfterPurchase = await this.getMoneyAfterPurchase(userId, cost);
    const trx = await this.createTransaction();
    try {
      await trx("user")
        .update({ money: moneyAfterPurchase, updated_at: this.knex.fn.now() })
        .where("id", userId);
      await this.feedSlime(userId, foodId);
      await this.unlockFoodCollection(userId, foodId);
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
}
