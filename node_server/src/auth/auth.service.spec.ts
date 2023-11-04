import Knex from "knex";
import { User } from "models/dbModels";
import { BadRequestError } from "src/utils/error";
import knexConfig from "../db/knexfile";
import AuthService from "./auth.service";
const knex = Knex(knexConfig["test"]);
describe("AuthService", () => {
  let authService: AuthService;
  let userCountBefore: number;
  let testId: number;
  const countUser = async () => parseInt(await knex("user").count("id as count")[0]["count"]);
  beforeEach(async () => {
    // insert username: "test", password: "123" to user
    testId = (
      await knex("user")
        .insert({
          username: "test",
          password: "$2a$10$8nXBNisolSX6wdRW1xRKw.r/4QK4qgoRnaTHlNHTqcRr1bjV65VR6",
        })
        .returning("id")
    )[0]["id"];
    userCountBefore = await countUser();
    authService = new AuthService(knex);
    jest.spyOn(authService, "isExisting");
    jest.clearAllMocks();
  });
  it("login should validate login and return user", async () => {
    expect(authService.login("test", "123")).resolves.toBe(testId);
  });
  it("login should invalidate login for wrong password", async () => {
    expect(authService.login("test", "1234")).resolves.toBe(-1);
  });
  it("login should invalidate login for wrong username", () => {
    expect(authService.login("foo", "123")).resolves.toBe(-1);
  });
  it("should throw bad request if missing info", async () => {
    expect(authService.login("", "")).rejects.toThrow(BadRequestError);
    expect(authService.login("", "1234")).rejects.toThrow(BadRequestError);
    expect(authService.login("test", "")).rejects.toThrow(BadRequestError);
  });
  it("isExisting should return userId if user exists", () => {
    expect(authService.isExisting("test")).resolves.toBe(testId);
  });
  it("isExisting should return false if user does not exist", () => {
    expect(authService.isExisting("test1")).resolves.toBe(-1);
  });
  it("sign up should first check the existence of username", async () => {
    await authService.signUp("test", "123");
    expect(authService.isExisting).toBeCalledWith("test");
  });
  it("sign up should create user and return user id", async () => {
    const result = await authService.signUp("test1", "123");
    expect(authService.isExisting).toBeCalledWith("test1");
    const user = await knex<User>("user")
      .select("id", "username", "hash_password")
      .where("username", "test1");
    expect(user).toHaveLength(1);
    expect(result).toBe(user[0].id);
    expect(user[0]).toMatchObject({ username: "test1" });
    expect(user[0]["hash_password"].length).toEqual(60);
    expect(async () => parseInt(await knex("user").count("id as count")[0]["count"])).toBe(
      userCountBefore + 1
    );
  });
  it("sign up should return -1 if duplicate username", () => {
    expect(authService.signUp("test", "12")).resolves.toBe(-1);
    expect(authService.isExisting).toBeCalledTimes(1);
    expect(authService.isExisting).toBeCalledWith("test");
    expect(countUser()).resolves.toBe(userCountBefore);
  });
  it("sign up should throw bad request if missing info", async () => {
    expect(async () => await authService.signUp("", "")).toThrow(BadRequestError);
    expect(countUser()).resolves.toBe(userCountBefore);
    expect(async () => await authService.signUp("test", "")).toThrow(BadRequestError);
    expect(countUser()).resolves.toBe(userCountBefore);
    expect(async () => await authService.signUp("", "test")).toThrow(BadRequestError);
    expect(countUser()).resolves.toBe(userCountBefore);
    expect(authService.isExisting).toBeCalledTimes(0);
  });

  afterEach(async () => {
    await knex("user").del();
    await knex.raw("ALTER SEQUENCE user_id_seq RESTART WITH 1");
  });
  afterAll(async () => {
    await knex.destroy();
  });
});
