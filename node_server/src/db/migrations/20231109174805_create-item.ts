import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("item", (table) => {
    table.increments();
    table.string("name").notNullable();
    table.text("description").notNullable();
    table.integer("cost").notNullable();
    table.timestamps(false, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("item");
}
