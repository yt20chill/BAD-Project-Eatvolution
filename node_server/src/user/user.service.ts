import { Knex } from "knex";
import { RedisClientType } from "redis";
import { User } from "../../models/dbModels";
import { UserServiceHelper } from "../../models/serviceModels";
import { knex, redis } from "../utils/container";
import { BadRequestError, UnauthorizedError } from "../utils/error";
import gameConfig from "../utils/gameConfig";

export default class UserService implements UserServiceHelper {
  constructor(
    private readonly knex: Knex,
    private readonly redis: RedisClientType
  ) {}
  getSavings = async (userId: number): Promise<number> => {
    await this.receiveSalary(userId);
    if (await this.redis.exists(`money-${userId}`)) {
      return +(await this.redis.get(`money-${userId}`));
    }
    const { money } = await this.knex<User>("user").select("money").where("id", userId)[0];
    // will not throw error if money = 0
    if (money === undefined) throw new BadRequestError();
    await this.redis.setEx(`money-${userId}`, 60, money);
    return money;
  };

  receiveSalary = async (userId: number, trx?: Knex.Transaction): Promise<boolean> => {
    const client = trx ?? this.knex;
    const query = client("user")
      .select(
        client.raw("EXTRACT(EPOCH FROM (NOW() - updated_at)) as elapsedSeconds"),
        "money",
        "total_money"
      )
      .where("id", userId)
      .first();

    const { elapsedSeconds, total_money, money } = await query;

    if (!elapsedSeconds && elapsedSeconds !== 0) throw new UnauthorizedError();
    const earning_rate = await this.getEarningRate(userId);
    const earnedMoney = elapsedSeconds * earning_rate;
    const updatedSavings = +money + earnedMoney;
    await client("user")
      .update({
        money: updatedSavings,
        total_money: total_money + earnedMoney,
        updated_at: this.knex.fn.now(),
      })
      .where("id", userId);
    await this.redis.setEx(`money-${userId}`, 60, updatedSavings + "");
    return true;
  };
  getEarningRate = async (userId: number): Promise<number> => {
    if (await this.redis.exists(`salary-${userId}`)) {
      return +(await this.redis.get(`salary-${userId}`));
    }
    // select slime id and earn rate multiplier of it's type
    const subquery = this.knex("slime")
      .select("slime.id as slime_id", "slime_type.earn_rate_multiplier")
      .join("user", "slime.owner_id", "user.id")
      .join("slime_type", "slime.slime_type_id", "slime_type.id")
      .where("user.id", userId);
    // apply formula: userEarnRate = (protein * earnRateMultiplier * EARNING_RATE_CONSTANT), sum all for all food.protein
    // knex.sum() only supports summing up a single column
    const { userEarnRate } = (await this.knex("slime_food")
      .with("user_slime", subquery)
      .select(
        this.knex.raw(`SUM(food.protein * user_slime.earn_rate_multiplier * ?) as "userEarnRate"`, [
          gameConfig.EARNING_RATE_CONSTANT,
        ])
      )
      // inner join: slime.id must be in user_slime
      .join("user_slime", "user_slime.slime_id", "slime_food.slime_id")
      .join("food", "food.id", "slime_food.food_id")
      .join("slime", "slime.id", "slime_food.slime_id")
      .first()) as any;
    await this.redis.setEx(`salary-${userId}`, 30 * 60, (userEarnRate || 1) + "");
    return userEarnRate || 1;
  };
}

const userService = new UserService(knex, redis);
userService.getEarningRate(1);
redis.disconnect();
