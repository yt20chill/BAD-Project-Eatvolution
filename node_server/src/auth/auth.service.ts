import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import { Knex } from "knex";
import { User } from "models/dbModels";
import { AuthServiceHelper } from "models/serviceModels";
import SlimeService from "../slime/slime.service";
import { BadRequestError } from "../utils/error";

export default class AuthService implements AuthServiceHelper {
  private SALT_ROUNDS = 10;
  constructor(private readonly knex: Knex) {}

  private hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  };

  private checkPassword = async (plain: string, hash: string): Promise<number> => {
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
        password: password,
      };
      const createUser = await this.knex("user")
        .insert({ username: username, hash_password: await this.hashPassword(newUser.password) })
        .returning("id");
      const slimeService = new SlimeService(this.knex);
      await slimeService.create(createUser[0].id);
      return createUser[0].id;
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
