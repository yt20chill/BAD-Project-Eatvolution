import { Knex } from "knex";
import { SlimeServiceHelper } from "models/serviceModels";
import {SlimeFood} from "../../models/dbModels"
import { env } from "../../src/env";
import { logger } from "../../src/utils/logger";

export default class SlimeService implements SlimeServiceHelper {
   
    constructor(private readonly knex: Knex) { }
    
    getSlimeData(): Promise<number> {
        throw new Error("Method not implemented.");
    }

    slimeFeed = async(foodId:number,slimeId:number): Promise<boolean> =>{
        //receive food data
        //insert food in database
        const insertSlimeFood = 
        await this.knex("slime_food")
        .insert({ food_id: foodId, slime_id: slimeId })
        .returning("id");

        return insertSlimeFood[0].id
    };

    getTotalProtein = async(slimeId:number): Promise<number> =>{
        //cal slime id
        //we have foodID => to select in food table => protein

    const result = await this.knex('slime_food')
    .join('food','slime_food.food_id','=','food.id')
    .join('slime', 'slime_food.slime_id', '=', 'slime.id')
    .sum('food.protein as total_protein')
    .where('slime.id',slimeId)
    .first()
    const totalProtein = parseInt(result.total_protein)
    return totalProtein

    };

    calEarnRate = async(slimeId:number): Promise<number> =>{
        //let rate = 1
        //totalProtein * slimeType.earn_rate_multiplier * rate
        let constant = 1
        const multiplierEarnRate = await this.knex('slime')
        .join('slime_type','slime.slime_type_id','=','slime_type.id')
        .select('earn_rate_multiplier') 
        .where('slime.id',slimeId)
        .first()

        const totalProtein = await this.getTotalProtein(slimeId)

        const earnRate = totalProtein * multiplierEarnRate * constant

        return  earnRate
    };

    // getSlimeData = async(slimeId:number,userId:number): Promise<number> =>{
    //     const slimeData = await this.knex('slime')
    //     .join('slime_type','slime.slime_type_id','=','slime_type.id')
    //     .select('slime_type.id','calories',' extra_calories')
    //     .where('slime',slimeId)
    //     return 0
    // }; 

    evolution = async(): Promise<number> =>{
        return 
    };

    // autoMinusCalor = async(): Promise<number> =>{
    //     return 
    // };
}