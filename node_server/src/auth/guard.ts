import { Request, Response, NextFunction } from "express";

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId) {
        next();
        return
    }
    res.status(401).json({ success: false, message: "Login false" })
    console.log(isLoggedIn)
    return
}