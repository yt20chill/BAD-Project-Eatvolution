import Knex from "knex";
import knexConfig from "../../src/db/knexfile";
import { seed } from "../db/seeds/01-init";
import { env } from "../env";
import { idFromInsertingTestUser } from "../utils/testUtils";
import ShopService from "./shop.service";

describe.only("ShopService", () => {
  const knex = Knex(knexConfig[env.NODE_ENV]);
  let shopService: ShopService;
  let testUserId: number;
  const foodNumAllowed = ShopService.foodNumAllowed;
  beforeAll(async () => {
    await knex.migrate.latest();
  });
  beforeEach(async () => {
    shopService = new ShopService(knex);
    await knex("user").del();
    testUserId = await idFromInsertingTestUser(knex);
    await seed(knex);
  });
  beforeEach(async () => {});
  describe("getShopItems", () => {
    it("get n = foodNumAllowed unique food", async () => {
      const result = await shopService.getShopItems(testUserId);
      expect(result.length).toBe(foodNumAllowed);
      for (const food of result) {
        expect(food.cost).toBeTruthy();
      }
    });
    it("all food should have a price", async () => {
      const result = await shopService.getShopItems(testUserId);
      expect(result.length).toBe(foodNumAllowed);
      for (const food of result) {
        expect(food.cost).toBeTruthy();
      }
    });
    it("returns only brief info about the food", async () => {
      const result = await shopService.getShopItems(testUserId);
      for (const food of result) {
        const keys = Object.keys(food);
        expect(keys).toMatchObject(["id", "name", "calories", "cost"]);
        expect(keys.length).toBe(4);
      }
    });
    it("result be ordered by cost", async () => {
      const result = await shopService.getShopItems(testUserId);
      for (let i = 1; i < result.length; i++) {
        expect(result[i].cost).toBeGreaterThan(result[i - 1].cost);
      }
    });
  });

  describe("updateUniversalShop", () => {});
  describe("updateUserShop", () => {});
  afterAll(async () => {
    await knex.destroy();
  });
});
