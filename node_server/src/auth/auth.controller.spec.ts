import { Request } from "express";
import { Knex } from "knex";
import { mockRequest } from "../utils/testUtils";
import AuthController from "./auth.controller";
import AuthService from "./auth.service";

describe("AuthController", () => {
  let authController: AuthController;
  let authService: AuthService;
  let req: Request;
  beforeEach(() => {
    req = mockRequest();
    authService = new AuthService({} as Knex);
    authController = new AuthController(authService, redis);
  });
});
