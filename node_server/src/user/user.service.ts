import { Knex } from "knex";
import { RedisClientType } from "redis";
import GameConfig from "../config/gameConfig";
import { User } from "../models/dbModels";
import { RedisUser, UserFinancialStatus } from "../models/models";
import { UserServiceHelper } from "../models/serviceModels";
import DbUtils from "../utils/dbUtils";
import { InternalServerError, UnauthorizedError } from "../utils/error";

export default class UserService implements UserServiceHelper {
  constructor(
    private readonly knex: Knex,
    private readonly redis: RedisClientType
  ) {}
  private getRedisUser = async (userId: number): Promise<RedisUser> => {
    return JSON.parse(await this.redis.get(`${userId}`)) ?? ({} as RedisUser);
  };
  private validateRedisUser = (user: RedisUser): boolean => {
    if (Object.keys(user).length < 4) return false;
    const { money, total_money, earning_rate, updated_at } = user;
    // simpler way to except the falsy expression when values === 0
    return !(money < 0 || total_money < 0 || earning_rate < 0 || !updated_at);
  };
  private getEarningRate = async (userId: number): Promise<number> => {
    const user = await this.getRedisUser(userId);
    if (user.earning_rate) return user.earning_rate;
    // select slime id and earn rate multiplier of it's type
    const result = await this.knex("slime_food")
      .select<{ user_earn_rate: string }>(
        this.knex.raw(
          `SUM(food.protein * slime_type.earn_rate_multiplier * ?) as "user_earn_rate"`,
          [GameConfig.EARNING_RATE_CONSTANT]
        )
      )
      .join("slime", "slime.id", "slime_food.slime_id")
      .join("food", "slime_food.food_id", "food.id")
      .join("slime_type", "slime_type.id", "slime.slime_type_id")
      .where("slime.calories", ">", 0)
      .groupBy("slime.owner_id")
      .having("slime.owner_id", "=", userId)
      .first();
    // if all slimes calories = 0, userEarnRate = 0
    if (!result) return 0;
    user.earning_rate = Math.max(1, +result.user_earn_rate);
    await this.redis.setEx(`${userId}`, 60, JSON.stringify(user));
    return user.earning_rate;
  };
  getUserLatestFinancialStatus = async (userId: number): Promise<UserFinancialStatus> => {
    await this.updateUserFinancialStatus(userId);
    let user = await this.getRedisUser(userId);
    if (this.validateRedisUser(user)) {
      return { id: userId, ...user };
    }
    const { money, total_money, updated_at } = await this.knex<User>("user")
      .select("money", "total_money", "updated_at")
      .where("id", userId)
      .first();
    if (money < 0 || total_money < 0 || !updated_at) throw new UnauthorizedError();
    const earning_rate = await this.getEarningRate(userId);
    user = { money, total_money: total_money, earning_rate, updated_at: new Date(updated_at) };
    this.redis.setEx(`${userId}`, 60, JSON.stringify(user));
    return { id: userId, ...user };
  };
  /**
   * update user's savings in db and redis based on elapsed time from last update
   * @param userId
   * @returns true if successfully updated user's info in db and redis
   */
  updateUserFinancialStatus = async (userId: number): Promise<boolean> => {
    const user = await this.getRedisUser(userId);
    let total_money: number,
      money: number,
      earning_rate: number,
      updated_at: Date,
      elapsedSeconds: number;
    const now = new Date();
    if (!this.validateRedisUser(user)) {
      // get elapsed seconds, money, and total money from db
      const query = await this.knex("user")
        .select("updated_at", "money", "total_money")
        .where("id", userId)
        .first();
      ({ total_money, money } = query);
      if (money < 0 || total_money < 0) throw new UnauthorizedError();
      earning_rate = await this.getEarningRate(userId);
      elapsedSeconds = DbUtils.calculateElapsedTimeInSeconds(query, now);
    } else {
      ({ total_money, money, updated_at, earning_rate } = user);
      elapsedSeconds = DbUtils.calculateElapsedTimeInSeconds({ updated_at }, now);
    }
    // update money
    if (!(elapsedSeconds >= 0 || money >= 0 || total_money >= 0 || earning_rate >= 0))
      throw new InternalServerError();

    const earnedMoney = Math.floor(elapsedSeconds * earning_rate);
    // update db
    const updateMoney = +money + earnedMoney;
    const updateTotalMoney = +total_money + earnedMoney;
    await this.knex("user")
      .update({
        money: updateMoney,
        total_money: updateTotalMoney,
        updated_at: now,
      })
      .where("id", userId);
    // update redis
    user.money = updateMoney;
    user.total_money = updateTotalMoney;
    user.earning_rate = earning_rate;
    user.updated_at = now;
    await this.redis.setEx(`${userId}`, 60, JSON.stringify(user));
    return true;
  };
}
