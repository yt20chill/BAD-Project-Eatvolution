import { Request } from "express";
import { BriefFood, ExportFoodCollection, ExportSlimeCollection, FinancialData } from "./models";

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
  insertFood: Controller<string | null>;
}

export interface ShopControllerHelper {
  getShopItems: Controller<BriefFood[]>;
  refreshShop: Controller<BriefFood[]>;
}

export interface FoodCollectionControllerHelper {
  getWholeFoodCollection: Controller<ExportFoodCollection>;
}

export interface SlimeCollectionControllerHelper {
  getWholeSlimeCollection: Controller<ExportSlimeCollection>;
}

export interface UserControllerHelper {
  getFinancialData: Controller<FinancialData>;
}

export interface SlimeControllerHelper {
  slimeFeed: Controller<number | null>;
  getTotalProtein: Controller;
  calEarnRate: Controller;
  getSlimeData: Controller;
  evolution: Controller;
  //autoMinusCalor:Controller;
}
