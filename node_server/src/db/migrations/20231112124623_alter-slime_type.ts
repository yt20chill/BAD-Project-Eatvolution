import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("slime_type", (table) => {
    table.renameColumn("bMR_multiplier", "bmr_multiplier");
  });
  await knex.schema.alterTable("user", (table) => {
    table.check("total_money >= money", {}, "total_money_check");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user", (table) => {
    table.dropChecks("total_money_check");
  });
  await knex.schema.alterTable("slime_type", (table) => {
    table.renameColumn("bmr_multiplier", "bMR_multiplier");
  });
}
