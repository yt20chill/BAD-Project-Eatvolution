import { NextFunction, Request, Response } from "express";

export const isLoggedInAPI = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    next();
    return;
  }
  res.status(401).json({ success: false, message: "Login false" });
  return;
};

export const isLoggedInFrontEnd = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    next();
    return;
  }
  res.redirect("/");
  return;
};
