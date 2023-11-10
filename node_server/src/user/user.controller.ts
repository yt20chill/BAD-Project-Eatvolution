import { Request } from "express";
import { RedisClientType } from "redis";
import { ControllerResult, UserControllerHelper } from "../../models/controllerModels";
import { FinancialData } from "../../models/models";
import { InternalServerError } from "../utils/error";
import { AppUtils } from "../utils/utils";
import UserService from "./user.service";

export default class UserController implements UserControllerHelper {
  constructor(
    private readonly userService: UserService,
    private readonly redis: RedisClientType
  ) {}
  getFinancialData = async (req: Request): Promise<ControllerResult<FinancialData | null>> => {
    const { userId } = req.session;

    const money =
      +JSON.parse(await this.redis.get(`money-${userId}`)) ??
      (await this.userService.getSavings(userId));
    const salaryPerSecond =
      +JSON.parse(await this.redis.get(`salary-${userId}`)) ??
      (await this.userService.calculateEarningRate(userId));
    // will not throw error if money or salary = 0
    if ((!money && money !== 0) || (!salaryPerSecond && salaryPerSecond !== 0))
      throw new InternalServerError();
    await this.redis.setEx(`money-${userId}`, 60, JSON.stringify(money));
    await this.redis.setEx(`salary-${userId}`, 60, JSON.stringify(salaryPerSecond));
    return AppUtils.setServerResponse({ money, salaryPerSecond });
  };
}
