import { Request } from "express";
import { RedisClientType } from "redis";
import { BadRequestError } from "src/utils/error";
import { AppUtils } from "src/utils/utils";
import AuthService from "./auth.service";
import grant from "grant"

export default class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly redis: RedisClientType
  ) {}

  login = async (req: Request) => {
    const { username, password } = req.body;
    if (!username || !password) throw new BadRequestError();
    const result = await this.authService.login(username, password);
    // res.json() == AppUtils.setServerResponse()
    return AppUtils.setServerResponse(result); // return {success: true, result: is_password_correct} 
  };

  googleLogin =  async (req: Request) => {
    const grantExpress = grant.express({
      defaults: {
        origin: "http://loclhost:8080",
        transport: "session",
        state: true,
      },
      google: {
        key: process.env.GOOGLE_CLIENT_ID || "",
        secret: process.env.GOOGLE_CLIENT_SECRET || "",
        scope: ["profile", "email"],
        callback: "/login/google",
      },
    });
     
  }
}
