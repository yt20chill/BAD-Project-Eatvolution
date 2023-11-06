import { Knex } from "knex";
import { logger } from "../../../src/utils/logger";

export async function seed(knex: Knex): Promise<void> {
  const trx = await knex.transaction();
  try {
    await trx("category").del();
    await trx.raw("ALTER SEQUENCE food_id_seq RESTART WITH 1");
    await trx("table_name").insert([
      { name: "healthy" },
      { name: "salty" },
      { name: "empty" },
      { name: "starchy" },
    ]);
    await trx.commit();
  } catch (error) {
    logger.error(error);
    await trx.rollback();
  }
}
