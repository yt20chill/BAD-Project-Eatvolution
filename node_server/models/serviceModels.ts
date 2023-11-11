import {
  BriefFood,
  ExportSlimeCollection,
  FoodCollection,
  FoodCollectionIds,
  InsertFood,
  UserFinancialStatus,
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
    slime_type: string;
    calories: number;
    extra_calories: number;
    // protein: number
    // earnRate: number
  }>;
  // calEarnRate(slimeId: number): Promise<number>;
  evolution(slimeId: number, userID: number): Promise<any>;
}

export interface ShopServiceHelper {
  getFoodShop(userId: number): Promise<BriefFood[]>;
  updateUniversalShop(): Promise<boolean>;
  updateUserShop(userId: number): Promise<boolean>;
  getFoodCost(userId: number, foodId: number): Promise<number>;
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
  getUserLatestFinancialStatus(userId: number): Promise<UserFinancialStatus>;
  updateUserFinancialStatus(userId: number): Promise<boolean>;
}

export interface GameServiceHelper {
  updateAllUsers(): Promise<boolean>;
  purchaseFood(userId: number, foodId: number): Promise<boolean>;
  purchaseCustomFood(userId: number, itemId: number): Promise<boolean>;
}
