import { Request } from "express";
import { ControllerResult, SlimeCollectionControllerHelper } from "../../models/controllerModels";
import { SlimeCollection } from "../../models/models";
import { AppUtils } from "../../utils/utils";
import SlimeCollectionService from "./slimeCollection.service";

export default class SlimeCollectionController implements SlimeCollectionControllerHelper {
  constructor(private readonly slimeCollectionService: SlimeCollectionService) {}
  getWholeSlimeCollection = async (req: Request): Promise<ControllerResult<SlimeCollection[]>> => {
    const userId = req.session.user.id;
    return AppUtils.setServerResponse(await this.slimeCollectionService.getSlimeCollection(userId));
  };
}
