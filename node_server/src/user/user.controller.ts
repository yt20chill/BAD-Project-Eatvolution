import { Request } from "express";
import { ControllerResult, UserControllerHelper } from "../../models/controllerModels";
import { UserFinancialStatus } from "../../models/models";
import { AppUtils } from "../utils/utils";
import UserService from "./user.service";

export default class UserController implements UserControllerHelper {
  constructor(private readonly userService: UserService) {}
  getFinancialStatus = async (
    req: Request
  ): Promise<ControllerResult<UserFinancialStatus | null>> => {
    const userId = req.session.user.id;
    const result = await this.userService.getUserLatestFinancialStatus(userId);
    return AppUtils.setServerResponse(result);
  };
}
