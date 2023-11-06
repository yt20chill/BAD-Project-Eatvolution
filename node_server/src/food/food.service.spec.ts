import Knex from "knex";
import { Category, Food, GeneralOmitFields } from "models/dbModels";
import { env } from "../../src/env";
import { BadRequestError } from "../../src/utils/error";
//import { logger } from "../../src/utils/logger";
import knexConfig from "../db/knexfile";
import { seed } from "../db/seeds/01-init";
import FoodService from "./food.service";

const knex = Knex(knexConfig[env.NODE_ENV]);

describe("FoodService", () => {
  const testFood = {
    name: "test",
    calories: 0.1,
    protein: 0.1,
    fat: 0.1,
    saturated_fat: 0.1,
    cholesterol: 0.1,
    carbohydrates: 0.1,
    fibre: 0.1,
    sugar: 0.1,
    sodium: 0.1,
    category_id: 1,
  };
  const expectTestFood = {
    food_name: "test",
    calories: "0.10",
    protein: "0.10",
    fat: "0.10",
    saturated_fat: "0.10",
    cholesterol: "0.10",
    carbohydrates: "0.10",
    fibre: "0.10",
    sugar: "0.10",
    sodium: "0.10",
  };
  const testFood2 = {
    name: "test2",
    calories: 0.1,
    protein: 0.1,
    fat: 0.1,
    saturated_fat: 0.1,
    cholesterol: 0.1,
    carbohydrates: 0.1,
    fibre: 0.1,
    sugar: 0.1,
    sodium: 0.1,
  };
  const expectTestFood2 = {
    food_name: "test2",
    calories: "0.10",
    protein: "0.10",
    fat: "0.10",
    saturated_fat: "0.10",
    cholesterol: "0.10",
    carbohydrates: "0.10",
    fibre: "0.10",
    sugar: "0.10",
    sodium: "0.10",
  };
  const countFood = async () => +(await knex("food").count("id as count"))[0]["count"];
  const getFoodIdsFromTestFood = async (...food: Array<Omit<Food, GeneralOmitFields>>) => {
    return (await knex("food").insert(food).returning("id")).map((e) => +e.id);
  };
  let foodService: FoodService;
  let testUserId: number;
  let foodCountBefore: number;
  let categories: Map<number, string>;
  beforeAll(async () => {
    await knex("user_custom_food").del();
    await knex.raw(`ALTER SEQUENCE user_custom_food_id_seq RESTART WITH 1`);
    await knex("user").del();
    await knex.raw(`ALTER SEQUENCE user_id_seq RESTART WITH 1`);
    await seed(knex);
    testUserId = +(
      await knex("user")
        .insert({
          username: "testUser",
          hash_password: "$2a$10$8nXBNisolSX6wdRW1xRKw.r/4QK4qgoRnaTHlNHTqcRr1bjV65VR6",
        })
        .returning("id")
    )[0]["id"];
    categories = (await knex<Category>("category").select("id", "name")).reduce(
      (acc, { id, name }) => {
        acc.set(id, name);
        return acc;
      },
      new Map<number, string>()
    );
  });
  beforeEach(async () => {
    await knex("user_custom_food").del();
    await knex.raw(`ALTER SEQUENCE user_custom_food_id_seq RESTART WITH 1`);
    await seed(knex);
    foodCountBefore = await countFood();
    jest.clearAllMocks();
    foodService = new FoodService(knex);
    jest.spyOn(foodService, "isExisting");
  });

  describe("isExisting", () => {
    it("should return food_id if food is existing", async () => {
      const food = (await knex("food").select("name", "id"))[0];
      const { id, name } = food;
      expect(foodService.isExisting({ name })).resolves.toBe(id);
      expect(foodService.isExisting({ id })).resolves.toBe(id);
    });
    it("should return food_id if food name is in different cases", async () => {
      const foodId = (await getFoodIdsFromTestFood(testFood))[0];
      expect(foodService.isExisting({ name: "TeSt" })).resolves.toBe(foodId);
      expect(foodService.isExisting({ name: " test  " })).resolves.toBe(foodId);
      expect(foodService.isExisting({ name: "   tEst  " })).resolves.toBe(foodId);
    });
    it("should return -1 if food does not exist", () => {
      expect(foodService.isExisting({ id: 10000 })).resolves.toBe(-1);
      expect(foodService.isExisting({ name: "foo" })).resolves.toBe(-1);
    });
    it("should throw bad request if neither name nor id is provided", () => {
      expect(foodService.isExisting({})).rejects.toThrow(BadRequestError);
    });
    it("should throw bad request if both id and name are provided", () => {
      expect(foodService.isExisting({ id: 1, name: "foo" })).rejects.toThrow(BadRequestError);
    });
    it("should throw bad request if input id <= 0", () => {
      expect(foodService.isExisting({ id: -1 })).rejects.toThrow(BadRequestError);
    });
    it("should throw bad request if input id is not a whole number", () => {
      expect(foodService.isExisting({ id: 0.1 })).rejects.toThrow(BadRequestError);
    });
  });

  describe("insert", () => {
    it("should insert food", async () => {
      await foodService.insert(testUserId, testFood);
      expect(countFood()).resolves.toBe(foodCountBefore + 1);
    });
    it("should insert user_custom_food", async () => {
      await foodService.insert(testUserId, testFood);
      expect((await knex("user_custom_food")).length).toBe(1);
    });
    it("should check duplicate food", async () => {
      await foodService.insert(testUserId, testFood);
      expect(foodService.isExisting).toBeCalledWith(expect.objectContaining({ name: "test" }));
    });
    it("should only insert to user_custom_food for duplicate food from different user", async () => {
      const testUserId2 = (
        await knex("user")
          .insert({
            username: "testUser2",
            hash_password: "$2a$10$8nXBNisolSX6wdRW1xRKw.r/4QK4qgoRnaTHlNHTqcRr1bjV65VR6",
          })
          .returning("id")
      )[0]["id"];
      await foodService.insert(testUserId, testFood);
      expect(countFood()).resolves.toBe(foodCountBefore + 1);
      expect((await knex("user_custom_food").count("id as count"))[0]["count"]).toBe("1");
      await foodService.insert(testUserId2, testFood);
      expect(countFood()).resolves.toBe(foodCountBefore + 1);
      expect((await knex("user_custom_food").count("id as count"))[0]["count"]).toBe("2");
      expect(foodService.isExisting).toBeCalledTimes(2);
    });
    it("should not insert duplicate food from the same user", async () => {
      for (let i = 0; i < 3; i++) await foodService.insert(testUserId, testFood);
      expect(countFood()).resolves.toBe(foodCountBefore + 1);
      expect((await knex("user_custom_food").count("id as count"))[0]["count"]).toBe("1");
    });
  });

  describe("getFoodForShop", () => {
    it("should get all food that have a price", async () => {
      await knex("food").insert(testFood);
      const result = await foodService.getFoodForShop();
      expect(result.length).toBe(foodCountBefore);
      for (const food of result) {
        expect(food.cost).toBeTruthy();
      }
    });
    it("should return only brief info about the food", async () => {
      const result = await foodService.getFoodForShop();
      for (const food of result) {
        const keys = Object.keys(food);
        expect(keys).toMatchObject(["id", "name", "calories", "cost"]);
        expect(keys.length).toBe(4);
      }
    });
    it("result should be ordered by id", async () => {
      const result = await foodService.getFoodForShop();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].id).toBeGreaterThan(result[i - 1].id);
      }
    });
  });

  describe("getDetails", () => {
    it("should return nutrition of 1 food", async () => {
      const insertedId = (await getFoodIdsFromTestFood(testFood))[0];
      const result = await foodService.getDetails(insertedId);
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject(expectTestFood);
    });
    it("should return nutrition of > 1 food", async () => {
      const foodIds = await getFoodIdsFromTestFood(testFood, testFood2);
      const result = await foodService.getDetails(...foodIds);
      expect(result.length).toBe(2);
      expect(result[0]).toMatchObject(expectTestFood);
      expect(result[1]).toMatchObject(expectTestFood2);
    });
    it("should get category name", async () => {
      const foodId = (await getFoodIdsFromTestFood(testFood))[0];
      expect((await foodService.getDetails(foodId))[0].category_name).toEqual(categories.get(1));
    });
    it("should get null if no category", async () => {
      const foodId = (await getFoodIdsFromTestFood(testFood2))[0];
      expect((await foodService.getDetails(foodId))[0].category_name).toBeNull();
    });
    it("should resolve if at least 1 foodId is valid", async () => {
      const id = (await getFoodIdsFromTestFood(testFood))[0];
      expect(foodService.getDetails(id, 255, 65536)).resolves.toMatchObject([expectTestFood]);
      expect(foodService.getDetails(id, 1.1)).resolves.toMatchObject([expectTestFood]);
      expect(foodService.getDetails(id, -1)).resolves.toMatchObject([expectTestFood]);
    });
    it("should throw bad request if all foodIds are invalid", () => {
      expect(foodService.getDetails(10000)).rejects.toThrow(BadRequestError);
      expect(foodService.getDetails(1000, 10000)).rejects.toThrow(BadRequestError);
      expect(foodService.getDetails(-1)).rejects.toThrow(BadRequestError);
      expect(foodService.getDetails(3.14)).rejects.toThrow(BadRequestError);
    });
  });

  afterAll(async () => {
    await knex("user").del();
    await knex.raw(`ALTER SEQUENCE user_id_seq RESTART WITH 1`);
    await knex.destroy();
  });
});
