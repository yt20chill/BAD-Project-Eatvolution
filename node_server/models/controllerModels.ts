import { Request } from "express";

export type Controller<ResultType = null> = (req: Request) => Promise<ControllerResult<ResultType>>;

export interface ControllerResult<ResultType> {
  success: boolean;
  result: ResultType;
}
