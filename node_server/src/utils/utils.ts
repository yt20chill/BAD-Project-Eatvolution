import { NextFunction, Request, Response } from "express";
import { Controller } from "models/controllerModels";
import { ApplicationError, InternalServerError } from "./error";

export class AppUtils {
  static exceptionWrapper =
    <ResultType = null>(controller: Controller<ResultType>) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await controller(req);
        res.json(this.setServerResponse(result.result, result.success));
        return;
      } catch (error) {
        if (error instanceof ApplicationError) {
          next(error);
          return;
        }
        next(new InternalServerError());
        return;
      }
    };
  static setServerResponse = <ResultType = null>(
    result: ResultType = null,
    success: boolean = true
  ) => ({ success, result });
}
