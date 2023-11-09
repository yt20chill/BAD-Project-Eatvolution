import Knex from "knex";
import { RedisClientType, createClient } from "redis";
import knexConfig from "../src/db/knexfile";
import AuthController from "./auth/auth.controller";
import AuthService from "./auth/auth.service";
import FoodCollectionController from "./collection/foodCollection/foodCollection.controller";
import FoodCollectionService from "./collection/foodCollection/foodCollection.service";
import { env } from "./env";
import FoodController from "./food/food.controller";
import FoodService from "./food/food.service";
import ShopController from "./shop/shop.controller";
import ShopService from "./shop/shop.service";
export const redis: RedisClientType = createClient();
export const knex = Knex(knexConfig[env.NODE_ENV]);

export const authService = new AuthService(knex);
export const authController = new AuthController(authService, redis);

export const foodService = new FoodService(knex);
export const foodController = new FoodController(foodService);

export const shopService = new ShopService(knex);
export const shopController = new ShopController(shopService, redis);

export const foodCollectionService = new FoodCollectionService(knex);
export const foodCollectionController = new FoodCollectionController(
  foodCollectionService,
  foodService
);
