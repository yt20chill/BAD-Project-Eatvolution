import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("slime_type", (table) => {
    table.integer("max_calories").checkPositive().notNullable();
    table.decimal("bMR_factor").checkPositive().notNullable().defaultTo(1);
    table.decimal("earn_rate_factor").checkPositive().notNullable().defaultTo(1);
    table.dropColumns("category_id", "required_count");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("slime_type", (table) => {
    table.integer("category_id").references("category.id").notNullable();
    table.integer("required_count").notNullable();
    table.dropColumns("max_calories", "bMR_factor", "earn_rate_factor");
  });
}
