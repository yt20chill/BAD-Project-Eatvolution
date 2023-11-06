import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("food", (table) => {
    table.integer("cost").nullable().checkPositive("cost_check").alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("food", (table) => {
    table.dropChecks("cost_check");
    table.integer("cost").notNullable().alter();
  });
}
