import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("slime_type", (table) => {
    table.text("description").notNullable().defaultTo("");
    table.renameColumn("bMR_factor", "bMR_multiplier");
    table.renameColumn("earn_rate_factor", "earn_rate_multiplier");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("slime_type", (table) => {
    table.renameColumn("earn_rate_multiplier", "earn_rate_factor");
    table.renameColumn("bMR_multiplier", "bMR_factor");
    table.dropColumn("description");
  });
}
