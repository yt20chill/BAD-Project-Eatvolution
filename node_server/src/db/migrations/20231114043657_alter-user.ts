import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user", (table) => {
    table.bigInteger("money").notNullable().alter();
    table.bigInteger("total_money").notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user", (table) => {
    table.integer("money").notNullable().alter();
    table.integer("total_money").notNullable().alter();
  });
}
