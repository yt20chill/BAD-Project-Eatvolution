import { Knex } from "knex";
import { SlimeServiceHelper } from "models/serviceModels";
import {SlimeFood} from "../../models/dbModels"
import { env } from "../../src/env";
import { logger } from "../../src/utils/logger";

export default class SlimeService implements SlimeServiceHelper {
   
    constructor(private readonly knex: Knex) { }

    slimeFeed = async(foodId:number,slimeId:number): Promise<boolean> =>{
        //receive food data
        //insert food in database
        const insertFood = 
        await this.knex("slime_food")
        .insert({ food_id: foodId, slime_id: slimeId })
        .returning("id");

        return insertFood[0].id
    };

    getTotalProtein = async(slimeId:number): Promise<number> =>{
        //cal slime id
        //we have foodID => to select in food table => protein

    const totalProtein = await this.knex('slime_food')
    .join('food','slime_food.food_id','=','food.id')
    .sum('food.protein as total_protein')
    .first()

        return totalProtein.total_protein
    };
    getSlimeData = async(): Promise<number> =>{
        return 
    }; 
    calEarnRate = async(): Promise<number> =>{
        return 
    };
    evolution = async(): Promise<number> =>{
        return 
    };
}