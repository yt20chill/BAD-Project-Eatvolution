import { BriefFood, Food, FoodDetails, GeneralOmitFields } from "./dbModels";

export interface AuthServiceHelper {
  login(username: string, password: string): Promise<number>;
  signUp(username: string, password: string): Promise<number>;
  isExisting(username: string): Promise<number>;
}

export interface FoodServiceHelper {
  insert(userId: number, food: Omit<Food, GeneralOmitFields>): Promise<void>;
  getFoodForShop(): Promise<Pick<Food, BriefFood>[]>;
  getDetails(...foodIds: Array<number>): Promise<FoodDetails[]>;
  isExisting(options: { id?: number; name?: string }): Promise<number>;
}
