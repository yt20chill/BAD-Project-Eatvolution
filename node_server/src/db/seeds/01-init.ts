import { Knex } from "knex";
import { Food, Item, SlimeType } from "models/dbModels";
import path from "path";
import { GeneralOmitFields } from "../../../models/models";
import DbUtils from "../../utils/dbUtils";
import gameConfig from "../../utils/gameConfig";
import { logger } from "../../utils/logger";
const SLIME_TYPE_PATH = path.join(__dirname, "..", "/slime_type.csv");
const LABELED_FOOD_PATH = path.join(__dirname, "..", "/labeled_food.csv");
const ITEM_PATH = path.join(__dirname, "..", "/item.csv");

export async function seed(knex: Knex): Promise<void> {
  const trx = await knex.transaction();
  try {
    // Deletes ALL existing entries
    await trx("shop").del();
    await trx("user_custom_food").del();
    await trx("user_food_collection").del();
    await trx("user_slime_type_collection").del();
    await trx("user_shop").del();
    await trx("slime_food").del();
    await trx("food").del();
    await trx("item").del();
    await trx("category").del();
    await trx("slime").del();
    await trx("slime_type").del();
    await trx("user").del();
    await trx.raw("ALTER SEQUENCE food_id_seq RESTART WITH 1");
    await trx.raw("ALTER SEQUENCE item_id_seq RESTART WITH 1");
    await trx.raw("ALTER SEQUENCE category_id_seq RESTART WITH 1");

    // Inserts seed entries
    const insertCategories = gameConfig.FOOD_CATEGORY.reduce((acc, name) => {
      acc.push({ name });
      return acc;
    }, []);
    await trx("category").insert(insertCategories);
    await trx("slime_type").insert(
      await DbUtils.csvToObjectPromise<Omit<SlimeType, GeneralOmitFields>>(SLIME_TYPE_PATH)
    );
    const food = DbUtils.prepareFoodForSeeding(
      await DbUtils.csvToObjectPromise<Omit<Food, GeneralOmitFields>>(LABELED_FOOD_PATH)
    );
    // insert food in ascending order by cost
    await trx.batchInsert(
      "food",
      food.sort((a, b) => a.cost - b.cost),
      50
    );
    await trx("item").insert(
      await DbUtils.csvToObjectPromise<Omit<Item, GeneralOmitFields>>(ITEM_PATH)
    );
    await trx.commit();
    logger.debug("category, slime_type, food, items successfully inserted");
  } catch (error) {
    logger.error(error.message);
    await trx.rollback();
  }
}
