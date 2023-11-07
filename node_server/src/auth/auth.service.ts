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

  isExisting = async (username: string): Promise<number> => {
    const db_UsernameChecking = this.knex<User>("user")
      .select("id")
      .where("username", username)[0];//if match success =>login, false => SignUp
    if (db_UsernameChecking.length === 0) return -1 //match false => SignUp
    return db_UsernameChecking.id; //match success => login
  }

  signUp = async (username: string, password: string): Promise<number> => {
    const isUserExist = await this.isExisting(username)
    if (isUserExist !== -1) return isUserExist
    const db_user = this.knex<User>("user")
    .select("id", "username", "hash_password")
    .where("username", username)[0];
   
    if (username.length || password.length === 0 || password.length > 60 || typeof username && typeof password === "undefined") throw new BadRequestError()

    if (isUserExist === -1) {
      await isUserExist
      let newUser = {
        username: username,
        password: password
      }
      await this.knex("user").insert({ username: username, hash_password: await this.hashPassword(newUser.password) })
      }

    return db_user.id
  }

  login = async (username: string, password: string): Promise<number> => {
    if(!username || !password) throw new BadRequestError()
    const db_password = (await this.knex<User>("user")
      .select("hash_password", "id")
      .where("username", username))[0];
      if(db_password){
        const isPasswordValid = await this.checkPassword(password, db_password.hash_password);
        if(!isPasswordValid)  return -1
      } else{
        return -1
      }
    return db_password.id;
  };


  oauthLogin = async (email: string): Promise<number> => {
    if (!email) throw new NotFoundError();
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
