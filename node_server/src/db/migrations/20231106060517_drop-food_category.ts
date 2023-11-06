import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTable("food_category");
  await knex.schema.alterTable("food", (table) => {
    table.integer("category_id").references("category.id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("food", (table) => {
    table.dropForeign("category_id");
    table.dropColumn("category_id");
  });
  if (!(await knex.schema.hasTable("food_category"))) {
    await knex.schema.createTable("food_category", (table) => {
      table.increments("id");
      table.integer("food_id").unsigned().notNullable().references("food.id");
      table.integer("category_id").unsigned().notNullable().references("category.id");
      table.timestamps(false, true);
      table.unique(["food_id", "category_id"]);
    });
  }
}
