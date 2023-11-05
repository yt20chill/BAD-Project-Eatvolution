import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_custom_food", (table) => {
    table.increments();
    table.integer("food_id").references("food.id");
    table.integer("user_id").references("user.id");
    table.timestamps(false, true);
  });
  await knex.schema.alterTable("food", (table) => {
    table.dropColumn("created_by");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("user_custom_food");
  await knex.schema.alterTable("food", (table) => {
    table.integer("created_by").references("user.id");
  });
}
