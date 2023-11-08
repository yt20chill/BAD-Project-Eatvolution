import { Food } from "./dbModels";
import { BriefFood, FoodCollection, GeneralOmitFields } from "./models";

export interface AuthServiceHelper {
  login(username: string, password: string): Promise<number>;
  // signUp(username: string, password: string): Promise<number>;
  // isExisting(username: string): Promise<number>;
  oauthLogin(email: string): Promise<number>;
}

export interface FoodServiceHelper {
  insert(userId: number, food: Omit<Food, GeneralOmitFields>): Promise<boolean>;
  getFoodForShop(): Promise<BriefFood[]>;
  getDetails(...foodIds: Array<number>): Promise<FoodCollection[]>;
  isExisting(options: { id?: number; name?: string }): Promise<number>;
}
