import { Request } from "express";
import {
  ControllerResult,
  SlimeCollectionControllerHelper,
} from "../../../models/controllerModels";
import { ExportSlimeCollection } from "../../../models/models";
import SlimeCollectionService from "./slimeCollection.service";

export default class SlimeCollectionController implements SlimeCollectionControllerHelper {
  constructor(private readonly slimeCollectionService: SlimeCollectionService) {}
  getWholeSlimeCollection = (req: Request): Promise<ControllerResult<ExportSlimeCollection>> => {
    throw new Error("not implemented");
  };
}
