import { Knex } from "knex";
import { Food, GeneralOmitField } from "models/dbModels";
import path from "path";
import DbUtils, { nutritionToNumber } from "../../utils/dbUtils";
import { logger } from "../../utils/logger";

export async function seed(knex: Knex): Promise<void> {
  const trx = await knex.transaction();
  try {
    // Deletes ALL existing entries
    await trx("food").del();
    await trx.raw("ALTER SEQUENCE food_id_seq RESTART WITH 1");

    // Inserts seed entries
    const food = nutritionToNumber(
      await DbUtils.csvToTable<Omit<Food, GeneralOmitField>>(
        path.join(__dirname, "..", "/food.csv")
      )
    );
    // insert food in ascending order by cost
    await trx.batchInsert(
      "food",
      food.sort((a, b) => a.cost - b.cost),
      50
    );
    trx.commit();
    logger.info("food successfully inserted");
  } catch (error) {
    logger.error(error.message);
    trx.rollback();
  }
}
