import { Knex } from "knex";
import { RedisClientType } from "redis";
import { logger } from "../config/logger";
import { Slime, User } from "../models/dbModels";
import { GameServiceHelper } from "../models/serviceModels";
import SlimeService from "../slime/slime.service";
import UserService from "../user/user.service";

export default class GameService implements GameServiceHelper {
  private readonly originalKnex: Knex;
  constructor(
    private readonly knex: Knex,
    private readonly redis: RedisClientType
  ) {
    this.originalKnex = knex;
  }
  private createTransaction = async (): Promise<Knex.Transaction> => {
    const trx = await this.knex.transaction();
    this.knex.bind(trx);
    return trx;
  };

  private updateAllSlimes = async (): Promise<void> => {
    const slimeService = new SlimeService(this.knex, this.redis);
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
    } finally {
      this.knex.bind(this.originalKnex);
    }
  };
}
