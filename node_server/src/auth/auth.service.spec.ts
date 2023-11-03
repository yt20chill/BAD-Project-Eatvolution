import Knex from "knex";
import { User } from "models/dbModels";
import { BadRequestError, NotFoundError } from "src/utils/error";
import knexConfig from "../db/knexfile";
import AuthService from "./auth.service";
const knex = Knex(knexConfig["test"]);
describe("AuthService", () => {
  let authService: AuthService;
  jest.spyOn(AuthService.prototype, "login");
  jest.spyOn(AuthService.prototype, "signUp");
  beforeAll(async () => {
    // insert username: "test", password: "123" to user
    await knex("user").insert({
      username: "test",
      password: "$2a$10$8nXBNisolSX6wdRW1xRKw.r/4QK4qgoRnaTHlNHTqcRr1bjV65VR6",
    });
  });
  beforeEach(() => {
    authService = new AuthService(knex);
    jest.clearAllMocks();
  });
  it("should validate login", async () => {
    const result = await authService.login("test", "123");
    expect(result).toBe(true);
  });
  it("should invalidate login", async () => {
    const result = await authService.login("test", "1234");
    expect(result).toBe(false);
  });
  it("should throw error if user doesn't exist", () => {
    expect(async () => {
      await authService.login("foo", "123");
    }).toThrow(NotFoundError);
  });
  it("should throw bad request", async () => {
    expect(() => authService.login("", "")).toThrow(BadRequestError);
    expect(() => authService.login("", "1234")).toThrow(BadRequestError);
    expect(() => authService.login("test", "")).toThrow(BadRequestError);
  });
  it("should create user and return user_id", async () => {
    const result = await authService.signUp("test1", "123");
    expect(result).toBe(2);
    const user = await knex<User>("user")
      .select("username", "hash_password")
      .where("username", "test1");
    expect(user).toHaveLength(1);
    expect(user[0]).toMatchObject({ username: "test1" });
    expect(user[0]["hash_password"].length).toEqual(60);
  });
  it("should throw error if missing info", async () => {
    const userNumber = (await knex("user")).length;
    expect(async () => await authService.signUp("", "")).toThrow(BadRequestError);
    expect((await knex("user")).length).toBe(userNumber);
    expect(async () => await authService.signUp("test", "")).toThrow(BadRequestError);
    expect((await knex("user")).length).toBe(userNumber);
    expect(async () => await authService.signUp("", "test")).toThrow(BadRequestError);
    expect((await knex("user")).length).toBe(userNumber);
  });
  it("should throw error if duplicate username", async () => {
    const username = await knex("user").select("username")[0];
    expect(async () => await authService.signUp(username, "12")).toThrow(BadRequestError);
    expect(async () => await authService.signUp(username, "12")).toThrowError("duplicate username");
  });
  afterAll(async () => {
    await knex("user").del();
    await knex.raw("ALTER SEQUENCE user_id_seq RESTART WITH 1");
  });
});
