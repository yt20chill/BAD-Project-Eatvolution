import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("food", (table) => {
    table.string("emoji").notNullable().defaultTo("✨");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("food", (table) => {
    table.dropColumn("emoji");
  });
}
