import { Request } from "express";
import { ControllerResult, UserControllerHelper } from "../../models/controllerModels";
import { FinancialData } from "../../models/models";
import { InternalServerError } from "../utils/error";
import { AppUtils } from "../utils/utils";
import UserService from "./user.service";

export default class UserController implements UserControllerHelper {
  constructor(private readonly userService: UserService) {}
  getFinancialData = async (req: Request): Promise<ControllerResult<FinancialData | null>> => {
    const userId = req.session.user.id;
    const money = await this.userService.getSavings(userId);
    const salaryPerSecond = await this.userService.getEarningRate(userId);
    // will not throw error if money or salary = 0
    if ((!money && money !== 0) || (!salaryPerSecond && salaryPerSecond !== 0))
      throw new InternalServerError();
    return AppUtils.setServerResponse({ money, salaryPerSecond });
  };
}
