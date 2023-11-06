import Knex from "knex";
import { RedisClientType, createClient } from "redis";
import knexConfig from "../src/db/knexfile";
import AuthController from "./auth/auth.controller";
import AuthService from "./auth/auth.service";
import { env } from "./env";
export const redis: RedisClientType = createClient();
export const knex = Knex(knexConfig[env.NODE_ENV]);

export const authService = new AuthService(knex);
export const authController = new AuthController(authService, redis);
