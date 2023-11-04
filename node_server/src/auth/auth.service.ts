import * as bcrypt from "bcryptjs";
import { Knex } from "knex";
import { User } from "models/dbModels";
import { AuthServiceHelper } from "models/models";
import { NotFoundError } from "src/utils/error";

export default class AuthService implements AuthServiceHelper {
  private SALT_ROUNDS = 10;
  constructor(private readonly knex: Knex) {}
  signUp(username: string, password: string): Promise<number> {
    throw new Error("Method not implemented.");
  }

  login = async (username: string, password: string): Promise<boolean> => {
    const db_password = await this.knex<User>("user")
      .select("hash_password")
      .where("username", username)[0];
    if (!db_password) throw new NotFoundError();
    return await this.checkPassword(password, db_password);
  };

  private hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  };

  private checkPassword = async (plain: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(plain, hash);
  };
}
