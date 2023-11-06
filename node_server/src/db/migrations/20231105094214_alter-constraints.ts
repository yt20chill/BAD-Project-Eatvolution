import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("food", (table) => {
    table.unique("name");
  });
  await knex.schema.alterTable("user_custom_food", (table) => {
    table.unique(["user_id", "food_id"]);
  });
  await knex.schema.alterTable("food_category", (table) => {
    table.unique(["food_id", "category_id"]);
  });
  await knex.schema.alterTable("user_food_collection", (table) => {
    table.unique(["user_id", "food_id"]);
  });
  await knex.schema.alterTable("user_slime_type_collection", (table) => {
    table.unique(["user_id", "slime_type_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user_slime_type_collection", (table) => {
    table.dropUnique(["user_id", "slime_type_id"]);
  });
  await knex.schema.alterTable("user_food_collection", (table) => {
    table.dropUnique(["user_id", "food_id"]);
  });
  await knex.schema.alterTable("food_category", (table) => {
    table.dropUnique(["food_id", "category_id"]);
  });
  await knex.schema.alterTable("user_custom_food", (table) => {
    table.dropUnique(["food_id", "user_id"]);
  });
  await knex.schema.alterTable("food", (table) => {
    table.dropUnique(["name"]);
  });
}
