import Knex from "knex";
import { Category, Food, GeneralOmitFields } from "models/dbModels";
import { env } from "../../src/env";
import { BadRequestError } from "../../src/utils/error";
//import { logger } from "../../src/utils/logger";
import fetchMock from "jest-fetch-mock";
import { ClassifyFood } from "models/models";
import knexConfig from "../db/knexfile";
import { seed } from "../db/seeds/01-init";
import FoodService from "./food.service";

const knex = Knex(knexConfig[env.NODE_ENV]);

describe("FoodService", () => {
  let testFood = {
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
  const getFoodIdsFromTestFood = async (
    ...food: Array<Omit<Food, GeneralOmitFields | "emoji">>
  ) => {
    return (await knex("food").insert(food).returning("id")).map((e) => +e.id);
  };
  const getTestFoodCatId = async (foodName: string) =>
    (await knex<Food>("food").select("category_id").where("name", foodName))[0].category_id;
  let foodService: FoodService;
  let testUserIds: Array<number>;
  let foodCountBefore: number;
  let categories: Map<number, string>;
  beforeAll(async () => {
    await knex("user_custom_food").del();
    await knex.raw(`ALTER SEQUENCE user_custom_food_id_seq RESTART WITH 1`);
    await knex("user").del();
    await knex.raw(`ALTER SEQUENCE user_id_seq RESTART WITH 1`);
    await seed(knex);
    testUserIds = (
      await knex("user")
        .insert([
          {
            username: "testUser",
            hash_password: "$2a$10$8nXBNisolSX6wdRW1xRKw.r/4QK4qgoRnaTHlNHTqcRr1bjV65VR6",
          },
          {
            username: "testUser2",
            hash_password: "$2a$10$8nXBNisolSX6wdRW1xRKw.r/4QK4qgoRnaTHlNHTqcRr1bjV65VR6",
          },
        ])
        .returning("id")
    ).map((e) => e.id);

    categories = (await knex<Category>("category").select("id", "name")).reduce(
      (acc, { id, name }) => {
        acc.set(id, name);
        return acc;
      },
      new Map<number, string>()
    );
  });
  beforeEach(async () => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
    foodCountBefore = await countFood();
    jest.clearAllMocks();
    foodService = new FoodService(knex);
    jest.spyOn(foodService, "isExisting");

    testFood = {
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
  });

  describe("isExisting", () => {
    it("returns food_id if food is existing", async () => {
      const food = (await knex("food").select("name", "id"))[0];
      const { id, name } = food;
      expect(await foodService.isExisting({ name })).toBe(id);
      expect(await foodService.isExisting({ id })).toBe(id);
    });
    it("returns food_id if food name is in different cases", async () => {
      const foodId = (await getFoodIdsFromTestFood(testFood))[0];
      expect(await foodService.isExisting({ name: "TeSt" })).toBe(foodId);
      expect(await foodService.isExisting({ name: " test  " })).toBe(foodId);
      expect(await foodService.isExisting({ name: "   tEst  " })).toBe(foodId);
    });
    it("returns -1 if food does not exist", async () => {
      expect(await foodService.isExisting({ id: 10000 })).toBe(-1);
      expect(await foodService.isExisting({ name: "foo" })).toBe(-1);
    });
    it("throws bad request if neither name nor id is provided", () => {
      expect(foodService.isExisting({})).rejects.toThrow(BadRequestError);
    });
    it("throws bad request if both id and name are provided", () => {
      expect(foodService.isExisting({ id: 1, name: "foo" })).rejects.toThrow(BadRequestError);
    });
    it("throws bad request if input id <= 0", () => {
      expect(foodService.isExisting({ id: -1 })).rejects.toThrow(BadRequestError);
    });
    it("throws bad request if input id is not a whole number", () => {
      expect(foodService.isExisting({ id: 0.1 })).rejects.toThrow(BadRequestError);
    });
  });

  describe("insert", () => {
    it("inserts to food", async () => {
      expect(await foodService.insert(testUserIds[0], testFood)).toBe(true);
      expect(await countFood()).toBe(foodCountBefore + 1);
    });
    it("inserts to user_custom_food", async () => {
      expect(await foodService.insert(testUserIds[0], testFood)).toBe(true);
      expect((await knex("user_custom_food")).length).toBe(1);
    });
    it("checks duplicate food", async () => {
      await foodService.insert(testUserIds[0], testFood);
      expect(foodService.isExisting).toBeCalledWith(expect.objectContaining({ name: "test" }));
    });
    it("only inserts to user_custom_food for duplicate food from different user", async () => {
      await foodService.insert(testUserIds[0], testFood);
      expect(await countFood()).toBe(foodCountBefore + 1);
      expect((await knex("user_custom_food").count("id as count"))[0]["count"]).toBe("1");
      await foodService.insert(testUserIds[1], testFood);
      expect(await countFood()).toBe(foodCountBefore + 1);
      expect((await knex("user_custom_food").count("id as count"))[0]["count"]).toBe("2");
      expect(foodService.isExisting).toBeCalledTimes(2);
    });
    it("won't insert duplicate food from the same user", async () => {
      for (let i = 0; i < 3; i++) await foodService.insert(testUserIds[0], testFood);
      expect(await countFood()).toBe(foodCountBefore + 1);
      expect((await knex("user_custom_food").count("id as count"))[0]["count"]).toBe("1");
    });
    it("calls py API on new food", async () => {
      fetchMock.doMock();
      const classifyFood: ClassifyFood = {
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
      expect(await foodService.insert(testUserIds[0], testFood)).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual(`${env.PY_URL}:${env.PY_PORT}/foodClassifier`);
      expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classifyFood),
      });
    });
    it("won't call py API on existing food", async () => {
      fetchMock.doMock();
      expect(await foodService.insert(testUserIds[0], testFood)).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(await foodService.insert(testUserIds[1], testFood)).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    it("calls py API and assign category_id", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ success: true, result: [1] }));
      expect(await foodService.insert(testUserIds[0], testFood)).toBe(true);
      expect(await getTestFoodCatId("test")).toBe(2);
    });
    it("sets category_id to null if fetch to py API is rejected", async () => {
      fetchMock.mockRejectOnce(new Error("mock error"));
      expect(await foodService.insert(testUserIds[0], testFood)).toBe(true);
      expect(await getTestFoodCatId("test")).toBeNull();
    });
    it("sets category_id to null on py server error", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ success: false }));
      expect(await foodService.insert(testUserIds[0], testFood)).toBe(true);
      expect(await getTestFoodCatId("test")).toBeNull();
    });
    it("inserts to user_custom_food if foodId is parsed", async () => {
      expect(await foodService.insert(testUserIds[0], 1)).toBe(true);
      expect((await knex("user_custom_food"))[0]).toMatchObject({
        user_id: testUserIds[0],
        food_id: 1,
      });
    });
    it("won't insert to user_custom_food if foodId is parsed but duplicated", async () => {
      for (let i = 0; i < 3; i++) await foodService.insert(testUserIds[0], 1);
      expect((await knex("user_custom_food").count("id as count"))[0]["count"]).toBe("1");
    });
    it("won't insert to food if food id is parsed", async () => {
      await foodService.insert(testUserIds[0], 1);
      expect(await countFood()).toBe(foodCountBefore);
    });
  });

  describe("getFoodForShop", () => {
    it("get all food that have a price", async () => {
      await knex("food").insert(testFood);
      const result = await foodService.getFoodForShop();
      expect(result.length).toBe(foodCountBefore);
      for (const food of result) {
        expect(food.cost).toBeTruthy();
      }
    });
    it("return only brief info about the food", async () => {
      const result = await foodService.getFoodForShop();
      for (const food of result) {
        const keys = Object.keys(food);
        expect(keys).toMatchObject(["id", "name", "calories", "cost"]);
        expect(keys.length).toBe(4);
      }
    });
    it("result be ordered by id", async () => {
      const result = await foodService.getFoodForShop();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].id).toBeGreaterThan(result[i - 1].id);
      }
    });
  });

  describe("getDetails", () => {
    it("returns nutrition of 1 food", async () => {
      const insertedId = (await getFoodIdsFromTestFood(testFood))[0];
      const result = await foodService.getDetails(insertedId);
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject(expectTestFood);
    });
    it("returns nutrition of > 1 food", async () => {
      const foodIds = await getFoodIdsFromTestFood(testFood, testFood2);
      const result = await foodService.getDetails(...foodIds);
      expect(result.length).toBe(2);
      expect(result[0]).toMatchObject(expectTestFood);
      expect(result[1]).toMatchObject(expectTestFood2);
    });
    it("gets category name", async () => {
      const foodId = (await getFoodIdsFromTestFood(testFood))[0];
      expect((await foodService.getDetails(foodId))[0].category_name).toEqual(categories.get(1));
    });
    it("gets null if no category", async () => {
      const foodId = (await getFoodIdsFromTestFood(testFood2))[0];
      expect((await foodService.getDetails(foodId))[0].category_name).toBeNull();
    });
    it("resolves if at least 1 foodId is valid", async () => {
      const id = (await getFoodIdsFromTestFood(testFood))[0];
      expect(await foodService.getDetails(id, 255, 65536)).toMatchObject([expectTestFood]);
      expect(await foodService.getDetails(id, 1.1)).toMatchObject([expectTestFood]);
      expect(await foodService.getDetails(id, -1)).toMatchObject([expectTestFood]);
    });
    it("throw bad request if all foodIds are invalid", () => {
      expect(foodService.getDetails(10000)).rejects.toThrow(BadRequestError);
      expect(foodService.getDetails(1000, 10000)).rejects.toThrow(BadRequestError);
      expect(foodService.getDetails(-1)).rejects.toThrow(BadRequestError);
      expect(foodService.getDetails(3.14)).rejects.toThrow(BadRequestError);
    });
  });
  afterEach(async () => {
    await knex("user_custom_food").del();
    await knex.raw(`ALTER SEQUENCE user_custom_food_id_seq RESTART WITH 1`);
    await seed(knex);
  });
  afterAll(async () => {
    await knex("user").del();
    await knex.raw(`ALTER SEQUENCE user_id_seq RESTART WITH 1`);
    await knex.destroy();
  });
});
