import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("food", (table) => {
    table.integer("created_by").references("user.id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("food", (table) => {
    table.dropColumn("created_by");
  });
}
