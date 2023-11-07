/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from "express";
import fetchMock from "jest-fetch-mock";
import { Knex } from "knex";
import { RedisClientType } from "redis";
import { ApplicationError, BadRequestError } from "../../src/utils/error";
import { mockRedis, mockRequest } from "../../src/utils/testUtils";
import FoodController from "./food.controller";
import FoodService from "./food.service";

describe("FoodController", () => {
  const cnApiUrlPrefix = "https://api.calorieninjas.com/v1/nutrition?query=";
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
  const mockOrange = {
    name: "oranges",
    calories: 49.8,
    fat: 0.1,
    saturated_fat: 0.0,
    protein: 0.9,
    sodium: 1,
    cholesterol: 0,
    carbohydrates: 12.5,
    fiber: 2.2,
    sugar: 8.6,
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
    jest.clearAllMocks();
    req = mockRequest();
    req.session.userId = 1;
    req.body.foodName = "oranges";
    redis = mockRedis();
    foodService = new FoodService({} as Knex);
    foodService.insert = jest.fn(async (_userId, _food) => true);
    foodService.isExisting = jest.fn(async ({}) => -1);
    foodController = new FoodController(foodService, redis);
  });
  describe("insert food", () => {
    it("fetches api and call insert on valid and new food", async () => {
      fetchMock.mockResponseOnce(JSON.stringify(cnSuccessResponse));
      expect(await foodController.insertFood(req)).toMatchObject({ success: true, result: null });
      expect(foodService.isExisting).toHaveBeenCalledTimes(1);
      expect(foodService.isExisting).toHaveBeenCalledWith({ name: "oranges" });
      expect(fetchMock.mock.calls[0][0]).toEqual(`${cnApiUrlPrefix}oranges`);
      expect(foodService.insert).toHaveBeenCalledWith(1, mockOrange);
    });
    it("won't fetch api on existing food", async () => {
      foodService.isExisting = jest.fn(async (_options) => 1);
      await foodController.insertFood(req);
      expect(foodService.isExisting).toHaveBeenCalled();
      expect(foodService.isExisting).toHaveBeenCalledWith({ name: "oranges" });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(foodService.insert).toHaveBeenCalledTimes(1);
      expect(foodService.insert).toHaveBeenCalledWith(1, 1);
    });
    it("won't insert if api returns names that doesn't match with the query name", async () => {
      fetchMock.mockResponseOnce(JSON.stringify(cnSuccessResponse));
      req.body.foodName = "apples";
      expect(await foodController.insertFood(req)).toMatchObject({
        success: false,
        result: "fail to search apples",
      });
      expect(fetchMock.mock.calls[0][0]).toEqual(`${cnApiUrlPrefix}apples`);
      expect(foodService.insert).not.toHaveBeenCalled();
    });
    it("throws application error if the fetch was failed", async () => {
      fetchMock.mockResponseOnce("", {
        status: 500,
        statusText: "internal server error",
      });
      expect(() => foodController.insertFood(req)).rejects.toThrow(ApplicationError);
      expect(foodService.insert).not.toHaveBeenCalled();
    });
    it("throws bad error if no food name", () => {
      req.body = {};
      expect(() => foodController.insertFood(req)).rejects.toThrow(BadRequestError);
      req.body.foodName = " ";
      expect(() => foodController.insertFood(req)).rejects.toThrow(BadRequestError);
    });
  });
});
