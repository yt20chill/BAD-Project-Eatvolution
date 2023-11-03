import { Knex } from "knex";
import { hashPassword } from '../../../hash'

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("user").del();

    // Reset the id_seq with knex
    await knex.raw('ALTER SEQUENCE user_id_seq RESTART WITH 1');

    // Inserts seed entries
    await knex
    // .insert({
    //     username: "jade",
    //     hash_password: hashPassword('abc'),
    //     money: 0,
    //     total_money: 0,
    // })
    // .into("user")
};

