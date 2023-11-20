import { Request } from "express";
import { ControllerResult, UserControllerHelper } from "../models/controllerModels";
import { RedisUser } from "../models/models";
import { AppUtils } from "../utils/utils";
import UserService from "./user.service";

export default class UserController implements UserControllerHelper {
  constructor(private readonly userService: UserService) {}
  getFinancialStatus = async (req: Request): Promise<ControllerResult<RedisUser | null>> => {
    const userId = req.session.user.id;
    const user = await this.userService.getUserLatestFinancialStatus(userId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...result } = user;
    return AppUtils.setServerResponse(result);
  };
}
