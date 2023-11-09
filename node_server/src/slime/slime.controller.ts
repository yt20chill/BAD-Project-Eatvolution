import {  Controller, SlimeControllerHelper } from "models/controllerModels";
import SlimeService from "./slime.service";
import { Request } from "express";
import { AppUtils } from "../utils/utils";

export default class SlimeController implements SlimeControllerHelper {
    [x: string]: any;
    
    constructor(
      private readonly authService: SlimeService,
      
    ) {}
    getTotalProtein: Controller<null>;
    calEarnRate: Controller<null>;
    getSlimeData: Controller<null>;
    evolution: Controller<null>;

    slimeFeed = async (req: Request) => {
   
        const { foodId, slimeId } = req.body;

        const result = await this.slimeService.slimeFeed(foodId, slimeId);
        return AppUtils.setServerResponse();

    }

    // getTotalProtein: Controller<null>;
    // calEarnRate: Controller<null>;
    // getSlimeData: Controller<null>;
    // evolution: Controller<null>;
   
}