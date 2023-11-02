import { NextFunction, Request, Response } from "express";
import { Controller } from "models/models";
import { ApplicationError, InternalServerError } from "./error";

export class AppUtils {
  static exceptionWrapper =
    (controller: Controller) => async (req: Request, res: Response, next: NextFunction) => {
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
      }
    };
  static setServerResponse = <ResultType = null>(
    result: ResultType = null,
    success: boolean = true
  ) => ({ success, result });
}
