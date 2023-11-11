import { NextFunction, Request, Response } from "express";
import { Controller } from "models/controllerModels";
import { ApplicationError, InternalServerError } from "./error";
import { logger } from "./logger";

export class AppUtils {
  static exceptionWrapper =
    <ResultType = null>(controller: Controller<ResultType>) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await controller(req);
        res.json(this.setServerResponse(result.result, result.success));
        return;
      } catch (error) {
        logger.error(error);
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

  /**
   * redirect to game page if req.session.userId !== undefined. redirect to home page on error. json response if result !== null (maybe have message to show?)
   * @param controller
   * @returns redirect to game page if controller return success = true and result = null, else response in json format
   */
  static redirectWrapper =
    <T>(controller: Controller<T>) =>
    async (req: Request, res: Response) => {
      try {
        const { success, result } = await controller(req);
        if (req.session.user) res.redirect("/user");
        // result to be handled by client
        else res.json({ success, result });
        return;
      } catch (error) {
        logger.error(error);
        res.redirect("/");
        return;
      }
    };

  private static timeout = async (milliseconds: number): Promise<any> =>
    new Promise((_, reject) => {
      setTimeout(
        () => reject(new InternalServerError(`process ran for > ${milliseconds / 1000} s`)),
        milliseconds
      );
    });
  static rejectTimeoutPromise = async <T>(
    promise: Promise<T>,
    milliseconds: number
  ): Promise<T> => {
    return Promise.race([promise, AppUtils.timeout(milliseconds)]);
  };
}
