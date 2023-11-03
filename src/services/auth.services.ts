import Knex from "knex";

import { User } from "../models";

export default class AuthService {
    constructor(private knex: Knex.Knex) { }
    async isUserLogin(username: string, password: string): Promise<any> {
        const result: Array<User> = await this.knex
            .select("username")
            .from("user")
            .where({ username: username });
        return result;
    }

}