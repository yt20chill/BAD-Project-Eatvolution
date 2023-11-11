import Knex from "knex";
import knexConfig from "../../src/db/knexfile";
import { seed } from "../db/seeds/01-init";
import { redis } from "../utils/container";
import { env } from "../utils/env";
import gameConfig from "../utils/gameConfig";
import { logger } from "../utils/logger";
import { idFromInsertingTestUser } from "../utils/testUtils";
import ShopService from "./shop.service";
//TODO: test redis
describe("ShopService", () => {
  const knex = Knex(knexConfig[env.NODE_ENV]);
  let shopService: ShopService;
  let testUserId: number;
  beforeAll(async () => {
    await knex.migrate.latest();
    await redis.connect();
  });
  beforeEach(async () => {
    shopService = new ShopService(knex, redis);
    const trx = await knex.transaction();
    try {
      await trx("user").del();
      await trx.raw("ALTER SEQUENCE user_id_seq RESTART WITH 1;");
      await trx("shop").del();
      await trx("user_shop").del();
      await trx.commit();
    } catch (error) {
      logger.error(error);
      await trx.rollback();
    }
    testUserId = await idFromInsertingTestUser(knex);
    await seed(knex);
  });
  beforeEach(async () => {});
  // TODO: should test universal and user shop
  describe("getFoodShop", () => {
    it("get n = foodNumAllowed unique food", async () => {
      const result = await shopService.getFoodShop(testUserId);
      expect(result.length).toBe(gameConfig.FOOD_NUM_ALLOWED);
      for (const food of result) {
        expect(food.cost).toBeTruthy();
      }
    });
    it("all food should have a price", async () => {
      const result = await shopService.getFoodShop(testUserId);
      expect(result.length).toBe(gameConfig.FOOD_NUM_ALLOWED);
      for (const food of result) {
        expect(food.cost).toBeTruthy();
      }
    });
    it("returns only brief info about the food", async () => {
      const result = await shopService.getFoodShop(testUserId);
      for (const food of result) {
        const keys = Object.keys(food);
        expect(keys).toMatchObject(["id", "name", "calories", "cost", "emoji"]);
        expect(keys.length).toBe(5);
      }
    });
    it("result be ordered by cost", async () => {
      const result = await shopService.getFoodShop(testUserId);
      for (let i = 1; i < result.length; i++) {
        expect(result[i].cost).toBeGreaterThanOrEqual(result[i - 1].cost);
      }
    });
  });

  describe("updateUniversalShop", () => {});
  describe("updateUserShop", () => {});
  afterAll(async () => {
    await knex.destroy();
    await redis.disconnect();
  });
});
