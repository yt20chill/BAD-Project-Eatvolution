import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("food", (table) => {
    table.dropColumn("potassium");
    table.decimal("saturated_fat").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("food", (table) => {
    table.dropColumn("saturated_fat");
    table.decimal("potassium").notNullable();
  });
}
