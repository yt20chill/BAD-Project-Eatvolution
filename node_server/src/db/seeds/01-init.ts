import { Knex } from "knex";
import { Food, GeneralOmitFields } from "models/dbModels";
import path from "path";
import DbUtils from "../../utils/dbUtils";
import { logger } from "../../utils/logger";
const categoryNames = ["healthy", "processed", "empty", "dessert"];

export async function seed(knex: Knex): Promise<void> {
  const trx = await knex.transaction();
  try {
    // Deletes ALL existing entries
    await trx("food").del();
    await trx("category").del();
    await trx.raw("ALTER SEQUENCE food_id_seq RESTART WITH 1");
    await trx.raw("ALTER SEQUENCE category_id_seq RESTART WITH 1");

    // Inserts seed entries
    const insertCategories = categoryNames.reduce((acc, name) => {
      acc.push({ name });
      return acc;
    }, []);
    await trx("category").insert(insertCategories);
    const food = DbUtils.prepareFoodForSeeding(
      await DbUtils.csvToObjectPromise<Omit<Food, GeneralOmitFields>>(
        path.join(__dirname, "..", "/labeled_food.csv")
      )
    );
    // insert food in ascending order by cost
    await trx.batchInsert(
      "food",
      food.sort((a, b) => a.cost - b.cost),
      50
    );
    await trx.commit();
    logger.debug("food successfully inserted");
  } catch (error) {
    logger.error(error.message);
    await trx.rollback();
  }
}
