import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  if (!(await knex.schema.hasTable("user"))) {
    await knex.schema.createTable("user", (table) => {
      table.increments();
      table.string("username", 255).notNullable().unique();
      table.specificType("hash_password", "char(60)").notNullable().checkLength("=", 60);
      table.integer("money").notNullable().defaultTo(0);
      table.integer("total_money").notNullable().defaultTo(0);
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("category"))) {
    await knex.schema.createTable("category", (table) => {
      table.increments("id");
      table.string("name", 255).notNullable().unique();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("food"))) {
    await knex.schema.createTable("food", (table) => {
      table.increments("id");
      table.string("name", 255).notNullable();
      table.integer("cost").notNullable();
      table.decimal("calories").notNullable();
      table.decimal("protein").notNullable();
      table.decimal("fat").notNullable();
      table.decimal("cholesterol").notNullable();
      table.decimal("carbohydrates").notNullable();
      table.decimal("fibre").notNullable();
      table.decimal("sugar").notNullable();
      table.decimal("sodium").notNullable();
      table.decimal("potassium").notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("food_category"))) {
    await knex.schema.createTable("food_category", (table) => {
      table.increments("id");
      table.integer("food_id").unsigned().notNullable().references("food.id");
      table.integer("category_id").unsigned().notNullable().references("category.id");
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("slime_type"))) {
    await knex.schema.createTable("slime_type", (table) => {
      table.uuid("id", { primaryKey: true }).defaultTo(knex.raw("uuid_generate_v4()"));
      table.string("name", 255).notNullable().unique();
      table.integer("category_id").unsigned().notNullable().references("category.id");
      table.integer("required_count").notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("slime"))) {
    await knex.schema.createTable("slime", (table) => {
      table.increments("id");
      table.integer("owner_id").unsigned().notNullable().references("user.id");
      table.uuid("slime_type_id").notNullable().references("slime_type.id");
      table.decimal("calories").notNullable().defaultTo(0);
      table.decimal("extra_calories").notNullable().defaultTo(0);
      table.boolean("is_archived").notNullable().defaultTo(false);
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("slime_food"))) {
    await knex.schema.createTable("slime_food", (table) => {
      table.increments("id");
      table.integer("slime_id").unsigned().notNullable().references("slime.id");
      table.integer("food_id").unsigned().notNullable().references("food.id");
      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable("user_food_collection"))) {
    await knex.schema.createTable("user_food_collection", (table) => {
      table.increments("id");
      table.integer("user_id").unsigned().notNullable().references("user.id");
      table.integer("food_id").unsigned().notNullable().references("food.id");
      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable("user_slime_type_collection"))) {
    await knex.schema.createTable("user_slime_type_collection", (table) => {
      table.increments("id");
      table.integer("user_id").unsigned().notNullable().references("user.id");
      table.uuid("slime_type_id").notNullable().references("slime_type.id");
      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("user_slime_type_collection");
  await knex.schema.dropTableIfExists("user_food_collection");
  await knex.schema.dropTableIfExists("slime_food");
  await knex.schema.dropTableIfExists("slime");
  await knex.schema.dropTableIfExists("slime_type");
  await knex.schema.dropTableIfExists("food_category");
  await knex.schema.dropTableIfExists("food");
  await knex.schema.dropTableIfExists("category");
  await knex.schema.dropTableIfExists("user");
}
