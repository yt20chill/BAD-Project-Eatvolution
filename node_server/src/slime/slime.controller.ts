import { Request } from "express";
import { AppUtils } from "../utils/utils";
import SlimeService from "./slime.service";

export default class SlimeController {
  constructor(private readonly slimeService: SlimeService) {}
  getData = async (req: Request) => {
    const userId = req.session.user.id;
    const slime = await this.slimeService.getExportSlime(userId);
    return AppUtils.setServerResponse(slime);
  };
}
