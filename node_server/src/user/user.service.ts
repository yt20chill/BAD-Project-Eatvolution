import { Knex } from "knex";
import { RedisClientType } from "redis";
import { User } from "../../models/dbModels";
import { RedisUser, UserFinancialStatus } from "../../models/models";
import { UserServiceHelper } from "../../models/serviceModels";
import DbUtils from "../utils/dbUtils";
import { InternalServerError, UnauthorizedError } from "../utils/error";
import gameConfig from "../utils/gameConfig";

export default class UserService implements UserServiceHelper {
  constructor(
    private readonly knex: Knex,
    private readonly redis: RedisClientType
  ) {}
  private getRedisUser = async (userId: number): Promise<RedisUser> => {
    return JSON.parse(await this.redis.get(`${userId}`)) ?? ({} as RedisUser);
  };
  private validateRedisUser = async (user: RedisUser): Promise<boolean> => {
    const { money, totalMoney, earningRate, lastUpdated } = user;
    // simpler way to except the falsy expression when values === 0
    return !(money < 0 || totalMoney < 0 || earningRate < 0 || !lastUpdated);
  };
  private getEarningRate = async (userId: number): Promise<number> => {
    const user = await this.getRedisUser(userId);
    if (user.earningRate) return user.earningRate;
    // select slime id and earn rate multiplier of it's type
    const subquery = this.knex("slime")
      .select("slime.id as slime_id", "slime_type.earn_rate_multiplier")
      .join("user", "slime.owner_id", "user.id")
      .join("slime_type", "slime.slime_type_id", "slime_type.id")
      .where("user.id", userId)
      .andWhere("slime.calories", ">", 0);
    // apply formula: userEarnRate = (protein * earnRateMultiplier * EARNING_RATE_CONSTANT), sum all for all food.protein
    // knex.sum() only supports summing up a single column
    const { userEarnRate } = await this.knex("slime_food")
      .with("user_slime", subquery)
      .select<{ userEarnRate: string }>(
        this.knex.raw(`SUM(food.protein * user_slime.earn_rate_multiplier * ?) as "userEarnRate"`, [
          gameConfig.EARNING_RATE_CONSTANT,
        ])
      )
      // inner join: slime.id must be in user_slime
      .join("user_slime", "user_slime.slime_id", "slime_food.slime_id")
      .join("food", "food.id", "slime_food.food_id")
      .join("slime", "slime.id", "slime_food.slime_id")
      .first();
    // if all slimes calories = 0, userEarnRate = 0
    if (userEarnRate === undefined) return 0;
    // if userEarnRate = 0 (i.e. total_protein = 0), userEarnRate = 1
    user.earningRate = +userEarnRate || 1;
    await this.redis.setEx(`${userId}`, 60, JSON.stringify(user));
    return user.earningRate;
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
    const earningRate = await this.getEarningRate(userId);
    user = { money, totalMoney: total_money, earningRate, lastUpdated: new Date(updated_at) };
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
    let totalMoney: number,
      money: number,
      earningRate: number,
      lastUpdated: Date,
      elapsedSeconds: number;
    const now = new Date();
    if (!(await this.validateRedisUser(user))) {
      // get elapsed seconds, money, and total money from db
      const query = await this.knex("user")
        .select("updated_at", "money", "total_money as totalMoney")
        .where("id", userId)
        .first();
      ({ totalMoney, money } = query);
      if (money < 0 || totalMoney < 0) throw new UnauthorizedError();
      earningRate = await this.getEarningRate(userId);
      elapsedSeconds = DbUtils.calculateElapsedTimeInSeconds(query, now);
    } else {
      ({ totalMoney, money, lastUpdated, earningRate } = user);
      elapsedSeconds = DbUtils.calculateElapsedTimeInSeconds({ updated_at: lastUpdated }, now);
    }
    // update money
    if (!(elapsedSeconds >= 0 || money >= 0 || totalMoney >= 0 || earningRate >= 0))
      throw new InternalServerError();

    const earnedMoney = Math.floor(elapsedSeconds * earningRate);
    // update db
    const updateMoney = +money + earnedMoney;
    const updateTotalMoney = +totalMoney + earnedMoney;
    await this.knex("user")
      .update({
        money: updateMoney,
        total_money: updateTotalMoney,
        updated_at: now,
      })
      .where("id", userId);
    // update redis
    user.money = updateMoney;
    user.totalMoney = updateTotalMoney;
    user.earningRate = earningRate;
    user.lastUpdated = now;
    await this.redis.setEx(`${userId}`, 60, JSON.stringify(user));
    return true;
  };
}
