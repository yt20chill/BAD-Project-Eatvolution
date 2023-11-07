import { Request } from "express";
import fetchMock from "jest-fetch-mock";
import { Knex } from "knex";
import { RedisClientType } from "redis";
import { mockRedis, mockRequest } from "src/utils/testUtils";
import FoodController from "./food.controller";
import FoodService from "./food.service";

describe("FoodController", () => {
  const cnSuccessResponse = {
    items: [
      {
        name: "oranges",
        calories: 49.8,
        serving_size_g: 100.0,
        fat_total_g: 0.1,
        fat_saturated_g: 0.0,
        protein_g: 0.9,
        sodium_mg: 1,
        potassium_mg: 23,
        cholesterol_mg: 0,
        carbohydrates_total_g: 12.5,
        fiber_g: 2.2,
        sugar_g: 8.6,
      },
      {
        name: "apples",
        calories: 49.8,
        serving_size_g: 100.0,
        fat_total_g: 0.1,
        fat_saturated_g: 0.0,
        protein_g: 0.9,
        sodium_mg: 1,
        potassium_mg: 23,
        cholesterol_mg: 0,
        carbohydrates_total_g: 12.5,
        fiber_g: 2.2,
        sugar_g: 8.6,
      },
    ],
  };
  let req: Request;
  let foodService: FoodService;
  let redis: RedisClientType;
  let foodController: FoodController;
  beforeAll(async () => {
    fetchMock.enableMocks();
  });
  beforeEach(async () => {
    fetchMock.resetMocks();
    req = mockRequest();
    redis = mockRedis();
    foodService = new FoodService({} as Knex);
    foodController = new FoodController(foodService, redis);
  });
  describe("insert food", () => {
    it("return {success: true, result: null} on valid req", async () => {
      fetchMock.mockResponseOnce(JSON.stringify(cnSuccessResponse));
      req.body.foodName = "oranges";
      await foodController.insertFood(req);
      expect;
    });
  });
});
