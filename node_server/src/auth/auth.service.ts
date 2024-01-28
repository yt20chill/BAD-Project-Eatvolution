import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import { Knex } from "knex";
import { RedisClientType } from "redis";
import { User } from "src/models/dbModels";
import { AuthServiceHelper } from "src/models/serviceModels";
import SlimeCollectionService from "../collection/slimeCollection/slimeCollection.service";
import GameConfig from "../config/gameConfig";
import { logger } from "../config/logger";
import SlimeService from "../slime/slime.service";
import { BadRequestError, InternalServerError } from "../utils/error";

// FIX duplicated username
export default class AuthService implements AuthServiceHelper {
  private SALT_ROUNDS = 10;
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
  private hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  };

  private checkPassword = async (plain: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(plain, hash);
  };

  isExisting = async (username: string): Promise<number> => {
    const db_UsernameChecking = await this.knex<User>("user")
      .select("id")
      .where("username", username); //if match success =>login, false => SignUp
    if (db_UsernameChecking.length === 0) return -1; //match false => SignUp
    return db_UsernameChecking[0].id; //match success => logins
  };

  signUp = async (username: string, password: string): Promise<number> => {
    if (!username || !password) throw new BadRequestError();
    const isUserExist = await this.isExisting(username);
    if (isUserExist > 0) {
      return -1;
    } else {
      const newUser = {
        username: username,
        hash_password: await this.hashPassword(password),
        money: GameConfig.INITIAL_MONEY,
        total_money: GameConfig.INITIAL_MONEY,
      };
      const trx = await this.createTransaction();
      try {
        const { id } = (await this.knex("user").insert(newUser).returning("id"))[0];
        const slimeService = new SlimeService(this.knex, this.redis);
        const slimeCollectionService = new SlimeCollectionService(this.knex);
        await slimeService.create(id);
        await slimeCollectionService.unlockSlimeCollection(
          id,
          "dd5ef4d7-af75-4a3a-a300-424061737ef5" // Balance slime type id
        );
        await trx.commit();
        return id;
      } catch (error) {
        logger.error(error);
        await trx.rollback();
        throw new InternalServerError("fail to create user");
      } finally {
        this.knex.bind(this.originalKnex);
      }
    }
  };

  login = async (username: string, password: string): Promise<number> => {
    if (!username || !password) throw new BadRequestError();
    const db_password = (
      await this.knex<User>("user").select("hash_password", "id").where("username", username)
    )[0];
    if (db_password) {
      const isPasswordValid = await this.checkPassword(password, db_password.hash_password);
      if (!isPasswordValid) return -1;
    } else {
      return -1;
    }
    return db_password.id;
  };

  oauthLogin = async (email: string): Promise<number> => {
    const userId = await this.isExisting(email);
    if (userId !== -1) return userId;
    const password = crypto.randomBytes(20).toString("hex");
    return await this.signUp(email, password);
  };
}
