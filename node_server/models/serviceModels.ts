import { Knex } from "knex";
import {
  BriefFood,
  ExportSlimeCollection,
  FoodCollection,
  FoodCollectionIds,
  InsertFood,
} from "./models";

export interface AuthServiceHelper {
  login(username: string, password: string): Promise<number>;
  signUp(username: string, password: string): Promise<number>;
  isExisting(username: string): Promise<number>;
  oauthLogin(email: string): Promise<number>;
}

export interface FoodServiceHelper {
  insert(userId: number, food: InsertFood | number): Promise<boolean>;
  getDetails(...foodIds: Array<number>): Promise<FoodCollection[]>;
  isExisting(options: { id?: number; name?: string }): Promise<number>;
}

export interface SlimeServiceHelper {
  slimeFeed(foodId: number, slimeId: number): Promise<number>;
  //   totalMacroNutrients(slimeId: number): Promise<{
  //     totalProtein: number,
  //     totalCarbs: number,
  //     totalFat: number
  // }>
  // totalProtein(slimeId: number): Promise<number>;
  // totalCarbs(slimeId: number): Promise<number>;
  // extraCalories(slimeId: number): Promise<number>;
  slimeData(slimeId: number): Promise<{
    slime_type: string,
    calories: number,
    extra_calories: number,
    // protein: number
    // earnRate: number
  }>;
  // calEarnRate(slimeId: number): Promise<number>;
  evolution(slimeId: number, userID:number): Promise<any>;
}

export interface ShopServiceHelper {
  getShopItems(userId: number): Promise<BriefFood[]>;
  updateUniversalShop(): Promise<boolean>;
  updateUserShop(userId: number): Promise<boolean>;
}

export interface FoodCollectionServiceHelper {
  getUnlockedFoodIds(userId: number): Promise<FoodCollectionIds>;
  getAllFoodIds(
    userId: number
  ): Promise<{ unlockedIds: FoodCollectionIds; lockedIds: FoodCollectionIds }>;
}

export interface SlimeCollectionServiceHelper {
  getSlimeType(userId: number): Promise<ExportSlimeCollection>;
}

export interface UserServiceHelper {
  getSavings(userId: number): Promise<number>;
  receiveSalary(userId: number, trx?: Knex.Transaction): Promise<boolean>;
  // calculateEarningRate(userId: number): Promise<number>;
}

export interface GameServiceHelper {
  purchaseFood(userId: number, foodId: number, knex?: Knex): Promise<boolean>;
  purchaseItem(userId: number, itemId: number, knex?: Knex): Promise<boolean>;
}
