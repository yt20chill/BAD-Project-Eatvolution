import * as bcrypt from "bcryptjs";
import { Knex } from "knex";
import { User } from "models/dbModels";
import { AuthServiceHelper } from "models/serviceModels";
import { NotFoundError, BadRequestError } from "../utils/error";
import crypto from "crypto";

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
<<<<<<< HEAD
 
   if (!username || !password) throw new BadRequestError()
 
    const isUserExist = await this.isExisting(username)
    if (isUserExist > 0) {
       return -1
    }
    else {
=======
    if (!username || !password) throw new BadRequestError();

    const isUserExist = await this.isExisting(username);
    if (isUserExist > 0) {
      //received id = 2
      return -1;
    } else {
>>>>>>> origin/main
      let newUser = {
        username: username,
        password: password,
      };
      const createUser = await this.knex("user")
        .insert({ username: username, hash_password: await this.hashPassword(newUser.password) })
        .returning("id");
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
    // const isUsernameValid = (await this.knex<User>("user")
    //   .select("username", "id")
    //   .where("username", email))[0];
    const userId = await this.isExisting(email);
    if (userId !== -1) return userId;

    // if (!isUsernameValid) {
    //   let newUser = {
    //     username: email,
    //     password: crypto.randomBytes(20).toString('hex')
    //   }
    //   const createUser = await this.knex("user").insert({ username: email, hash_password: await this.hashPassword(newUser.password) }).returning('id')
    //   return createUser[0].id;
    // }
    const password = crypto.randomBytes(20).toString('hex')
    return await this.signUp(email, password);
   
  }
}
