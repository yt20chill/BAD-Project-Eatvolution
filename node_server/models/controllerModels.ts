import { Request } from "express";
import { BriefFood, FoodCollection, SlimeCollection } from "./models";

export type Controller<ResultType = null> = (req: Request) => Promise<ControllerResult<ResultType>>;

export interface ControllerResult<ResultType> {
  success: boolean;
  result: ResultType;
}

export interface AuthControllerHelper {
  login: Controller;
  signUp: Controller<string | null>;
  oauthLogin: Controller;
  logout: Controller;
}

export interface FoodControllerHelper {
  insertFood: Controller<string | null>;
}

export interface ShopControllerHelper {
  getFood: Controller<BriefFood[]>;
}

export interface FoodCollectionControllerHelper {
  get: Controller<FoodCollection[]>;
  insert: Controller;
}

export interface SlimeCollectionControllerHelper {
  get: Controller<SlimeCollection[]>;
}

export interface SlimeControllerHelper {
  slimeFeed: Controller<number | null>;
  getTotalProtein: Controller;
  calEarnRate:Controller;
  getSlimeData:Controller;
  evolution:Controller;
  //autoMinusCalor:Controller;

}
