import Knex from "knex";
import { RedisClientType, createClient } from "redis";

import AuthController from "../auth/auth.controller";
import AuthService from "../auth/auth.service";
import FoodCollectionController from "../collection/foodCollection/foodCollection.controller";
import FoodCollectionService from "../collection/foodCollection/foodCollection.service";
import SlimeCollectionController from "../collection/slimeCollection/slimeCollection.controller";
import SlimeCollectionService from "../collection/slimeCollection/slimeCollection.service";
import knexConfig from "../db/knexfile";
import FoodController from "../food/food.controller";
import FoodService from "../food/food.service";
import GameService from "../game/game.service";
import ShopController from "../shop/shop.controller";
import ShopService from "../shop/shop.service";
import SlimeController from "../slime/slime.controller";
import SlimeService from "../slime/slime.service";
import UserController from "../user/user.controller";
import UserService from "../user/user.service";
import { env } from "./env";

export const redis: RedisClientType = createClient({ database: 0 });
export const knex = Knex(knexConfig[env.NODE_ENV]);

export const authService = new AuthService(knex, redis);
export const authController = new AuthController(authService);

export const gameService = new GameService(knex, redis);

export const foodService = new FoodService(knex, redis);
export const foodController = new FoodController(foodService);

export const shopService = new ShopService(knex, redis);
export const shopController = new ShopController(shopService);

export const foodCollectionService = new FoodCollectionService(knex);
export const foodCollectionController = new FoodCollectionController(
  foodCollectionService,
  foodService
);

export const slimeCollectionService = new SlimeCollectionService(knex);
export const slimeCollectionController = new SlimeCollectionController(slimeCollectionService);

export const slimeService = new SlimeService(knex, redis);
export const slimeController = new SlimeController(slimeService);

export const userService = new UserService(knex, redis);
export const userController = new UserController(userService);
