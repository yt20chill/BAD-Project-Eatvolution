import {  Controller, SlimeControllerHelper } from "models/controllerModels";
import SlimeService from "./slime.service";
import { Request } from "express";
import { AppUtils } from "../utils/utils";
import { Knex } from "knex";

export default class TestController {
    [x: string]: any;
    
    constructor(
        private knex: Knex
      
    ) {}

    test = async (req: Request, res: any) => {
        const slimeService = new SlimeService(this.knex)
        const result = await slimeService.totalMacroNutrients(1)
        console.log(`result: ${result}`)
        res.json(result)

    }
    slimeFeed = async (req: Request, res: any) => {
        const slimeService = new SlimeService(this.knex)
        const result = await slimeService.slimeFeed(54,1)
        console.log(result)
        res.json(result)

    }
    

    // getTotalProtein: Controller<null>;
    // calEarnRate: Controller<null>;
    // getSlimeData: Controller<null>;
    // evolution: Controller<null>;
   
}