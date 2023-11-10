import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../utils/error";

export const isLoggedInAPI = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.user?.id) {
    next();
    return;
  }
  next(new UnauthorizedError());
  return;
};

export const isLoggedInClient = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.user?.id) {
    next();
    return;
  }
  res.redirect("/");
  return;
};
