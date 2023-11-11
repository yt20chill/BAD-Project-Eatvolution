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
  insert(userId: number, food: InsertFood | number): Promise<number>;
  getDetails(...foodIds: Array<number>): Promise<FoodCollection[]>;
  isExisting(options: { id?: number; name?: string }): Promise<number>;
}

export interface SlimeServiceHelper {
  create(userId: number): Promise<void>;
  feed(slimeId: number, foodId: number): Promise<void>;
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
  updateAllUsers(): Promise<void>;
  purchaseFood(userId: number, foodId: number): Promise<boolean>;
}
