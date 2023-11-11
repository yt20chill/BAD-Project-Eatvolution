import { Request } from "express";
import {
  BriefFood,
  ExportFoodCollection,
  ExportSlimeCollection,
  UserFinancialStatus,
} from "./models";

export type Controller<ResultType = null> = (req: Request) => Promise<ControllerResult<ResultType>>;

export interface ControllerResult<ResultType = null> {
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
  insertFood: Controller<string | number>;
}

export interface ShopControllerHelper {
  getFoodShop: Controller<BriefFood[]>;
  refreshShop: Controller<BriefFood[]>;
}

export interface FoodCollectionControllerHelper {
  getWholeFoodCollection: Controller<ExportFoodCollection>;
}

export interface SlimeCollectionControllerHelper {
  getWholeSlimeCollection: Controller<ExportSlimeCollection>;
}

export interface UserControllerHelper {
  getFinancialStatus: Controller<UserFinancialStatus>;
}

export interface SlimeControllerHelper {
  slimeFeed: Controller<number | null>;
  getTotalProtein: Controller;
  calEarnRate: Controller;
  getSlimeData: Controller;
  evolution: Controller;
  //autoMinusCalor:Controller;
}
