import { Knex } from "knex";

import { hashPassword } from "../../hash.text"




export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("slime").del();
    await knex("user").del();

    // Inserts seed entries
    await knex("user").insert([
        {
            id: 1,
            username: "jade",
            hash_password: await hashPassword("12345"),
            money: 100000,
            total_money: 100000,

        },
        // { id: 2, colName: "rowValue2" },
        // { id: 3, colName: "rowValue3" }
    ]);
    await knex("slime").insert([
        {
            id: 1,
            owner_id: 1,
            slime_type_id: 'dd5ef4d7-af75-4a3a-a300-424061737ef5',
            calories:0,
            extra_calories:0,
            is_archived:true
        },
        // { id: 2, colName: "rowValue2" },
        // { id: 3, colName: "rowValue3" }
    ]);


};
