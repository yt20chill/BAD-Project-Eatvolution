import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("shop", (table) => {
    table.increments();
    table.integer("food_id").references("food.id").notNullable();
    table.timestamps(false, true);
  });
  await knex.schema.createTable("user_shop", (table) => {
    table.increments();
    table.integer("user_id").references("user.id").notNullable();
    table.integer("food_id").references("food.id").notNullable();
    table.timestamps(false, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("user_shop");
  await knex.schema.dropTable("shop");
}
