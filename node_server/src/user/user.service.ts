import { Knex } from "knex";
import { Food, Item, Slime, User } from "../../models/dbModels";
import { UserServiceHelper } from "../../models/serviceModels";
import { BadRequestError, UnauthorizedError } from "../utils/error";
import { gameConfig } from "../utils/gameConfig";

export default class UserService implements UserServiceHelper {
  constructor(private readonly knex: Knex) {}
  getSavings = async (userId: number, knex = this.knex): Promise<number> => {
    await this.receiveSalary(userId, knex);
    const { money } = await this.knex<User>("user").select("money").where("id", userId)[0];
    // will not throw error if money = 0
    if (money === undefined) throw new BadRequestError();
    return money;
  };
  purchaseFood = async (userId: number, foodId: number, knex = this.knex): Promise<boolean> => {
    const { cost } = await knex<Food>("food").select("cost").where("id", foodId).first();
    if (!cost) throw new BadRequestError();
    const money = await this.getSavings(userId, knex);
    if (money - cost < 0) return false;
    await knex("user")
      .update({ money: money - cost })
      .where("id", userId);
    return true;
  };
  purchaseItem = async (userId: number, itemId: number, knex = this.knex): Promise<boolean> => {
    const { cost } = await knex<Item>("item").select("cost").where("id", itemId).first();
    if (!cost) throw new BadRequestError();
    const money = await this.getSavings(userId, knex);
    if (money - cost < 0) return false;
    await knex("user")
      .update({ money: money - cost })
      .where("id", userId);
    return true;
  };
  receiveSalary = async (userId: number, knex = this.knex): Promise<boolean> => {
    const { elapsedSeconds, total_money, money } = await knex("user")
      .select(
        knex.raw("EXTRACT(EPOCH FROM (NOW() - updated_at)) as elapsedSeconds"),
        "money",
        "total_money"
      )
      .where("id", userId)
      .first();
    if (!elapsedSeconds) throw new UnauthorizedError();
    const earning_rate = await this.calculateEarningRate(userId);
    const earnedMoney = elapsedSeconds * earning_rate;
    await knex("user")
      .update({
        money: money + earnedMoney,
        total_money: total_money + earnedMoney,
        updated_at: knex.fn.now(),
      })
      .where("id", userId);
    return true;
  };
  calculateEarningRate = async (userId: number): Promise<number> => {
    const subquery = this.knex<Slime>("slime")
      .select("slime.id as slime_id", "slime_type.earn_rate_multiplier as earn_rate_multiplier")
      .join("user", "slime.owner_id", "user.id")
      // TODO: change slime_type_id to type_id
      .join("slime_type", "slime.slime_type_id", "slime_type.id")
      .where("user.id", userId);
    const slimesProtein = await this.knex("slime_food")
      .with("user_slime", subquery)
      .sum("food.protein as total_protein")
      .select("user_slime.earn_rate_factor")
      .join("food", "food.id", "slime_food.food_id")
      .join("slime", "slime.id", "slime_food.slime_id")
      // inner join: slime.id must be in user_slime
      .join("user_slime", "user_slime.slime_id", "slime.id")
      .groupBy("slime.id");
    const userEarnRate = slimesProtein.reduce((earnRate, slime) => {
      // typeof("1.0"*"1.0") === "number"
      return (earnRate += slime.total_protein * slime.earn_rate_multiplier);
    }, 0);
    return gameConfig.EARNING_RATE_CONSTANT * userEarnRate || 1;
  };
}
