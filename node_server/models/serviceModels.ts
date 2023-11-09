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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  slimeFeed(foodId: number, slimeId: number, knex: Knex): Promise<boolean>;
  getTotalProtein(foodId: number, slimeId: number): Promise<number>;
  getSlimeData(): Promise<number>;
  calEarnRate(slimeId:number): Promise<number>;
  evolution(): Promise<number>;}
  
=======
=======
>>>>>>> Stashed changes
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
    id: number,
    calories: number,
    extra_calories: number,
    // protein: number
    earnRate: number
  }>;
  calEarnRate(slimeId: number): Promise<number>;
  evolution(slimeId: number): Promise<number>;
}

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
export interface ShopServiceHelper {
  getShopItems(userId: number): Promise<{ food: BriefFood[]; isUniversal: boolean }>;
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
  getCurrentMoney(userId: number): Promise<number>;
  makeFoodPurchase(userId: number, foodId: number, knex: Knex): Promise<boolean>;
  updateMoney(userId: number): Promise<void>;
}
