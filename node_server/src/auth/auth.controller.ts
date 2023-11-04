import { Request } from "express";
import { AuthControllerHelper } from "models/controllerModels";
import { RedisClientType } from "redis";
import { BadRequestError } from "src/utils/error";
import { AppUtils } from "src/utils/utils";
import AuthService from "./auth.service";

export default class AuthController implements AuthControllerHelper {
  constructor(
    private readonly authService: AuthService,
    private readonly redis?: RedisClientType
  ) {}

  login = async (req: Request) => {
    const { username, password } = req.body;
    if (!username || !password) throw new BadRequestError();
    const result = await this.authService.login(username, password);
    return AppUtils.setServerResponse(result); // return {success: true, result: is_password_correct}
  };
}
