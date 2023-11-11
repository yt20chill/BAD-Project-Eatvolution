/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from "express";
import fetchMock from "jest-fetch-mock";
import { Knex } from "knex";
import { BadRequestError } from "../../src/utils/error";
import { mockRequest } from "../utils/testUtils";
import AuthController from "./auth.controller";
import AuthService from "./auth.service";

describe("AuthController", () => {
  let authController: AuthController;
  let authService: AuthService;
  let req: Request;
  beforeAll(() => {
    fetchMock.enableMocks();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    req = mockRequest();
    authService = new AuthService({} as Knex);
    authService.login = jest.fn(async (_username: string, _password: string) => 1);
    authService.signUp = jest.fn(async (_username: string, _password: string) => 1);
    authService.isExisting = jest.fn(async (_username: string) => -1);
    authService.oauthLogin = jest.fn(async (_email: string) => 1);
    authController = new AuthController(authService);
  });
  describe("login", () => {
    it("should validate login", async () => {
      req.body = { username: "test", password: "test" };
      await authController.login(req);
      expect(authService.login).toHaveBeenCalledWith("test", "test");
      await expect(authController.login(req)).resolves.toEqual({ success: true, result: null });
    });
    it("assign userId for successful login", async () => {
      req.body = { username: "test", password: "test" };
      await authController.login(req);
      expect(req.session.user.id).toBe(1);
    });
    it("should invalidate login", async () => {
      req.body = { username: "test", password: "test" };
      authService.login = jest.fn(async (_username: string, _password: string) => -1);
      await expect(authController.login(req)).resolves.toEqual({ success: false, result: null });
      expect(authService.login).toHaveBeenCalledWith("test", "test");
      expect(req.session.user.id).toBeUndefined();
    });
    it("should throw bad request when missing info", async () => {
      () => expect(async () => await authController.login(req)).toThrow(BadRequestError);
      req.body = { username: "test" };
      () => expect(async () => await authController.login(req)).toThrow(BadRequestError);
      req.body = { password: "test" };
      () => expect(async () => await authController.login(req)).toThrow(BadRequestError);
      req.body = { username: "", password: "" };
      () => expect(async () => await authController.login(req)).toThrow(BadRequestError);
      expect(authService.login).toHaveBeenCalledTimes(0);
      expect(req.session.user.id).toBeUndefined();
    });
    it("should throw bad request error when input type is invalid", async () => {
      req.body = { username: 1, password: 2 };
      () => expect(async () => await authController.login(req)).toThrow(new BadRequestError());
      expect(authService.login).toHaveBeenCalledTimes(0);
      expect(req.session.user.id).toBeUndefined();
    });
  });

  describe("signup", () => {
    it("sign up should sign up user", async () => {
      req.body = { username: "test", password: "test", confirmPassword: "test" };
      await expect(authController.signUp(req)).resolves.toEqual({ success: true, result: null });
      // expect(authService.signUp).toHaveBeenCalledWith("test", "test");
    });
    it("sign up should assign userId upon successful sign up", async () => {
      req.body = { username: "test", password: "test", confirmPassword: "test" };
      await expect(authController.signUp(req)).resolves.toEqual({ success: true, result: null });
      expect(req.session.user.id).toBe(1);
    });
    it("sign up should return { success: false, result: 'password mismatch' } if passwords do not match", async () => {
      req.body = { username: "test", password: "test", confirmPassword: "test1" };
      await expect(authController.signUp(req)).resolves.toEqual({
        success: false,
        result: "password mismatch",
      });
      expect(authService.signUp).toHaveBeenCalledTimes(0);
      expect(req.session.user.id).toBeUndefined();
    });
    it("sign up return { success: false, result: 'duplicated username' } if username is duplicated", async () => {
      req.body = { username: "test", password: "test", confirmPassword: "test" };
      authService.signUp = jest.fn(async (_username: string) => -1);
      await expect(authController.signUp(req)).resolves.toEqual({
        success: false,
        result: "duplicated username",
      });
      expect(authService.signUp).toHaveBeenCalledWith("test", "test");
      expect(req.session.user.id).toBeUndefined();
    });
    it("sign up should throw error when missing info", async () => {
      () => expect(async () => await authController.signUp(req)).rejects.toThrow(BadRequestError);
      req.body = { username: "test" };
      () => expect(async () => await authController.signUp(req)).rejects.toThrow(BadRequestError);
      req.body = { password: "test" };
      () => expect(async () => await authController.signUp(req)).rejects.toThrow(BadRequestError);
      req.body = { confirmPassword: "test" };
      () => expect(async () => await authController.signUp(req)).rejects.toThrow(BadRequestError);
      req.body = { username: "test", password: "test" };
      () => expect(async () => await authController.signUp(req)).rejects.toThrow(BadRequestError);
      req.body = { username: "test", confirmPassword: "test" };
      () => expect(async () => await authController.signUp(req)).rejects.toThrow(BadRequestError);
      req.body = { password: "test", confirmPassword: "test" };
      () => expect(async () => await authController.signUp(req)).rejects.toThrow(BadRequestError);
      expect(authService.signUp).toHaveBeenCalledTimes(0);
      expect(req.session.user.id).toBeUndefined();
    });
    it("sign up should throw error when input type is invalid", () => {
      req.body = { username: "test", password: 1, confirmPassword: 1 };
      expect(authController.signUp(req)).rejects.toThrow(BadRequestError);
      req.body = { username: ["test"], password: "test", confirmPassword: "test" };
      expect(authController.signUp(req)).rejects.toThrow(BadRequestError);
      expect(authService.signUp).toHaveBeenCalledTimes(0);
      expect(req.session.user.id).toBeUndefined();
    });
  });

  describe("oauth", () => {
    it("oauth should validate login for existing user and assign userId", async () => {
      req.session.grant.response.access_token = "foo";
      fetchMock.mockResponseOnce(JSON.stringify({ email: "foo@example.com" }));
      await expect(authController.oauthLogin(req)).resolves.toEqual({
        success: true,
        result: null,
      });
      expect(req.session.user.id).toBe(1);
    });
    it("oauth should invalidate login if oauth login failed", async () => {
      req.session.grant.response.access_token = undefined;
      expect(await authController.oauthLogin(req)).toMatchObject({ success: false, result: null });
    });
    it("oauth should invalidate login if fetch fails", async () => {
      req.session.grant.response.access_token = "foo";
      fetchMock.mockRejectOnce(new Error("mock error"));
      expect(await authController.oauthLogin(req)).toMatchObject({ success: false, result: null });
    });
    it("oauth should invalidate login if fetch result is invalid", async () => {
      req.session.grant.response.access_token = "foo";
      fetchMock.mockResponseOnce(JSON.stringify(""), {
        status: 500,
        statusText: "internal server error",
      });
      expect(await authController.oauthLogin(req)).toMatchObject({ success: false, result: null });
    });
  });

  describe("logout", () => {
    it("should clear session", async () => {
      req.session.user.id = 1;
      await authController.logout(req);
      expect(req.session).toBeFalsy();
    });
  });
});
