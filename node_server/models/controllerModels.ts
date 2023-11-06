import { Request } from "express";

export type Controller<ResultType = null> = (req: Request) => Promise<ControllerResult<ResultType>>;

export interface ControllerResult<ResultType> {
  success: boolean;
  result: ResultType;
}

export interface AuthControllerHelper {
  login: Controller;
  signUp: Controller<number | string>;
  oauthLogin: Controller;
}
