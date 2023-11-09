import Knex from "knex";
import knexConfig from "../../src/db/knexfile";
import { seed } from "../db/seeds/01-init";
import { env } from "../utils/env";
import { logger } from "../utils/logger";
import { idFromInsertingTestUser } from "../utils/testUtils";
import ShopService from "./shop.service";

describe("ShopService", () => {
  const knex = Knex(knexConfig[env.NODE_ENV]);
  let shopService: ShopService;
  let testUserId: number;
  const foodNumAllowed = ShopService.foodNumAllowed;
  beforeAll(async () => {
    await knex.migrate.latest();
  });
  beforeEach(async () => {
    shopService = new ShopService(knex);
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
  describe("getShopItems", () => {
    it("get n = foodNumAllowed unique food", async () => {
      const result = (await shopService.getShopItems(testUserId)).food;
      expect(result.length).toBe(foodNumAllowed);
      for (const food of result) {
        expect(food.cost).toBeTruthy();
      }
    });
    it("all food should have a price", async () => {
      const result = (await shopService.getShopItems(testUserId)).food;
      expect(result.length).toBe(foodNumAllowed);
      for (const food of result) {
        expect(food.cost).toBeTruthy();
      }
    });
    it("returns only brief info about the food", async () => {
      const result = (await shopService.getShopItems(testUserId)).food;
      for (const food of result) {
        const keys = Object.keys(food);
        expect(keys).toMatchObject(["id", "name", "calories", "cost"]);
        expect(keys.length).toBe(4);
      }
    });
    it("result be ordered by cost", async () => {
      const result = (await shopService.getShopItems(testUserId)).food;
      for (let i = 1; i < result.length; i++) {
        expect(result[i].cost).toBeGreaterThanOrEqual(result[i - 1].cost);
      }
    });
  });

  describe("updateUniversalShop", () => {});
  describe("updateUserShop", () => {});
  afterAll(async () => {
    await knex.destroy();
  });
});
