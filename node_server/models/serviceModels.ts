import { Food } from "./dbModels";
import { BriefFood, FoodCollection, GeneralOmitFields } from "./models";

export interface AuthServiceHelper {
  login(username: string, password: string): Promise<number>;
  signUp(username: string, password: string): Promise<number>;
  isExisting(username: string): Promise<number>;
  oauthLogin(email: string): Promise<number>;
}

export interface FoodServiceHelper {
  insert(userId: number, food: Omit<Food, GeneralOmitFields>): Promise<boolean>;
  getDetails(...foodIds: Array<number>): Promise<FoodCollection[]>;
  isExisting(options: { id?: number; name?: string }): Promise<number>;
}

export interface SlimeServiceHelper {
  slimeFeed(foodId:number,slimeId:number): Promise<boolean>;
  getTotalProtein(foodId:number,slimeId:number): Promise<number>;
  getSlimeData(): Promise<number>;
  calEarnRate(): Promise<number>;
  evolution(): Promise<number>;}
  
export interface ShopServiceHelper {
  getShopItems(userId: number): Promise<{ food: BriefFood[]; isUniversal: boolean }>;
  updateUniversalShop(): Promise<boolean>;
  updateUserShop(userId: number): Promise<boolean>;
}
