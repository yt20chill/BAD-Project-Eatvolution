import * as bcrypt from "bcryptjs";
import { Knex } from "knex";
import { User } from "models/dbModels";
import { AuthServiceHelper } from "models/serviceModels";
import { NotFoundError, BadRequestError } from "../utils/error";
import crypto from "crypto";

export default class AuthService implements AuthServiceHelper {
  private SALT_ROUNDS = 10;
  constructor(private readonly knex: Knex) { }

  private hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  };

  private checkPassword = async (plain: string, hash: string): Promise<number> => {
    return await bcrypt.compare(plain, hash);
  };

  // isExisting(username: string): Promise<number> {
  //   throw new Error("Method not implemented.");
  // }
  // signUp(username: string, password: string): Promise<number> {
  //   throw new Error("Method not implemented.");
  // }

  login = async (username: string, password: string): Promise<number> => {
    const db_password = await this.knex<User>("user")
      .select("hash_password", "id")
      .where("username", username)[0];
    if (!db_password) throw new NotFoundError();
    const isPasswordValid = await this.checkPassword(password, db_password);
    if (!isPasswordValid) throw new BadRequestError();
    return db_password.id;
  };


  oauthLogin = async (email: string): Promise<number> => {
    if(!email) throw new NotFoundError();
    const isUsernameValid = await this.knex<User>("user")
      .select("username", "id")
      .where("username", email)[0];

    if (!isUsernameValid) {
     let newUser = {
        username: email,
        password: crypto.randomBytes(20).toString('hex') 
      }
      await this.knex("user").insert({ username: email, hash_password: await this.hashPassword(newUser.password) })
    }
    return isUsernameValid.id;


  }




}
