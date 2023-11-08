import Knex from "knex";
import { User } from "models/dbModels";
import knexConfig from "../db/knexfile";
import { env } from "../env";
import { BadRequestError } from "../utils/error";
import AuthService from "./auth.service";
const knex = Knex(knexConfig[env.NODE_ENV]);
describe("AuthService", () => {
  let authService: AuthService;
  let userCountBefore: number;
  let testId: number;
  const countUser = async () => +(await knex("user").count("id as count"))[0]["count"];

  beforeEach(async () => {
    await knex("user").del();
    await knex.raw("ALTER SEQUENCE user_id_seq RESTART WITH 1");
    // insert username: "test", password: "123" to user
    testId = (
      await knex("user")
        .insert({
          username: "test",
          hash_password: "$2a$10$8nXBNisolSX6wdRW1xRKw.r/4QK4qgoRnaTHlNHTqcRr1bjV65VR6",
        })
        .returning("id")
    )[0]["id"];

    userCountBefore = await countUser();
    authService = new AuthService(knex);
    jest.clearAllMocks();
    jest.spyOn(authService, "isExisting");
  });
  describe("login", () => {
    it("validate login and return user", async () => {
      expect(await authService.login("test", "123")).toBe(testId);
    });
    it("invalidate login for wrong password", async () => {
      expect(await authService.login("test", "1234")).toBe(-1);
    });

    it("invalidate login for wrong username", async () => {
      expect(await authService.login("foo", "123")).toBe(-1);
    });

    it("throws bad request if missing info", async () => {
      await expect(authService.login("", "")).rejects.toThrow(BadRequestError);
      await expect(authService.login("", "1234")).rejects.toThrow(BadRequestError);
      await expect(authService.login("test", "")).rejects.toThrow(BadRequestError);
    });
  });

  describe("isExisting", () => {
    it("returns userId if user exists", async () => {
      expect(await authService.isExisting("test")).toBe(testId);
    });
    it("returns -1 if user does not exist", async () => {
      expect(await authService.isExisting("test1")).toBe(-1);
    });
  });

  describe("sign up", () => {
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
      expect(+(await knex("user").count("id as count"))[0]["count"]).toBe(userCountBefore + 1);
    });
    it("sign up should return -1 if duplicate username", async () => {
      expect(await authService.signUp("test", "12")).toBe(-1);
      expect(authService.isExisting).toHaveBeenCalledTimes(1);
      expect(authService.isExisting).toHaveBeenCalledWith("test");
      expect(await countUser()).toBe(userCountBefore);
    });
    it("sign up should throw bad request if missing info", async () => {
      await expect(authService.signUp("", "")).rejects.toThrow(BadRequestError);
      expect(await countUser()).toBe(userCountBefore);
      await expect(authService.signUp("test", "")).rejects.toThrow(BadRequestError);
      expect(await countUser()).toBe(userCountBefore);
      await expect(authService.signUp("", "test")).rejects.toThrow(BadRequestError);
      expect(await countUser()).toBe(userCountBefore);
      expect(authService.isExisting).toHaveBeenCalledTimes(0);
    });
  });

  describe("oauthLogin", () => {
    it("calls sign up if user does not exist", async () => {
      jest.spyOn(authService, "signUp");
      //user id should be > 0
      expect(await authService.oauthLogin("foo@example.com")).toBeGreaterThan(0);
      expect(authService.signUp).toHaveBeenCalledTimes(1);
    });
    it("return userId if user exists", async () => {
      jest.spyOn(authService, "signUp");
      await authService.oauthLogin("foo@example.com");
      expect(authService.signUp).toHaveBeenCalledTimes(1);
      await authService.oauthLogin("foo@example.com");
      expect(authService.signUp).toHaveBeenCalledTimes(1);
    });
  });

  afterAll(async () => {
    await knex.destroy();
  });
});
