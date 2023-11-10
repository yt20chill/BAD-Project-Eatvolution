import { Knex } from "knex";
import { SlimeServiceHelper } from "models/serviceModels";
import { join } from "path";
import { io } from "src/socket";

export default class SlimeService implements SlimeServiceHelper {

    constructor(private readonly knex: Knex) { }

    //create slime

    private getAllSlimeType = async (): Promise<any> => {
        const slimeTypes = (await this.knex('slime_type')
            .select('id', 'name'))
        return slimeTypes
        //    return slimeTypes[0].id
    }

    private totalMacroNutrients = async (slimeId: number): Promise<{
        totalProtein: number,
        totalCarbs: number,
        totalFat: number
    }> => {
        const result = await this.knex('slime_food')
            .join('food', 'slime_food.food_id', '=', 'food.id')
            .join('slime', 'slime_food.slime_id', '=', 'slime.id')
            .sum('food.protein as total_protein', 'food.carbohydrates as total_carbs', 'food.fat as total_fat')
            .where('slime.id', slimeId)
            .groupBy('slime.id')
            .first()

        const protein = parseFloat(result.total_protein)
        const carbs = parseFloat(result.total_carbs)
        const fat = parseFloat(result.total_fat)

        // const protein = result.total_protein
        // const carbs = result.total_carbs
        // const fat = result.total_fat

        let listMacroNutrients: {
            totalProtein: number,
            totalCarbs: number,
            totalFat: number
        } = {
            totalProtein: protein,
            totalCarbs: carbs,
            totalFat: fat
        }

        return listMacroNutrients
    };

    private extraCalories = async (slimeId: number): Promise<number> => {
        const result = await this.knex('slime')
            .select('extra_calories')
            .where('slime.id', slimeId)
            .first()

        const extraCalories = parseInt(result.extra_calories)

        return extraCalories
    }

    // calEarnRate = async (slimeId: number): Promise<number> => {
    //     //let rate = 1
    //     //totalProtein * slimeType.earn_rate_multiplier * rate
    //     let constant = 1
    //     const multiplierEarnRate = await this.knex('slime')
    //         .join('slime_type', 'slime.slime_type_id', '=', 'slime_type.id')
    //         .select('earn_rate_multiplier')
    //         .where('slime.id', slimeId)
    //         .first()

    //     const totalProtein = (await this.totalMacroNutrients(slimeId)).totalProtein

    //     const earnRate = totalProtein * multiplierEarnRate * constant
    //     return earnRate
    // };

    slimeFeed = async (foodId: number, slimeId: number, knex: Knex = this.knex): Promise<number> => {
        //receive food data
        //insert food in database
        const insertSlimeFood =
            await knex("slime_food")
                .insert({ food_id: foodId, slime_id: slimeId })
                .returning("id");

        return insertSlimeFood[0].id//slime_food.id
    };

    slimeData = async (slimeId: number): Promise<{
        id: number,
        calories: number,
        extra_calories: number,
        // protein: number
        // earnRate: number
    }> => {
        const db_slimeData = await this.knex('slime')
            .join('slime_type', 'slime.slime_type_id', '=', 'slime_type.id')
            .select('slime_type.id', 'calories', ' extra_calories')
            .where('slime.id', slimeId)

        // const earnRate = await this.calEarnRate(slimeId)
        // const protein = await this.getTotalProtein(slimeId)

        let slimeDataList: {
            id: number,
            calories: number,
            extra_calories: number
            // protein:number
            // earnRate: number
        } = db_slimeData[0];

        // slimeDataList.earnRate = earnRate
        // result.protein = protein

        return slimeDataList
    };

    countFood = async (slimeId: number): Promise<boolean> => {
        const foodNum = (await this.knex('slime_food')
            .join('slime', 'slime_food.slime_id', '=', 'slime.id')
            .count('food_id')
            .groupBy('slime.id')
            .where('slime.id', slimeId))[0]

        if (+foodNum <= 10) {
            return false
        }
        return true
    }


    // typeOfSlime = async (slimeId: number): Promise<any> => {
    //     const slimeType = (await this.knex('slime_type')
    //         .select('id', 'name'))

    //     console.log(slimeType)
    //     return slimeType

    //     // const slimeType

    // }

    evolution = async (slimeId: number): Promise<any> => {
        // - Keto: eat >=10 food && > 50% protein
        // - Skinny fat: eat >= 10 food >  > 60% carbs
        // - Obese: eat >= 10 food, extra calories > 2000

        const countFood = await this.countFood(slimeId)
        if (!countFood) {
            return false
        }
        // const slimeDiet = await this.knex('')
        const slimeTypes = await this.getAllSlimeType()
        const extra_calories = await this.extraCalories(slimeId)
        if (extra_calories > 2000) {
            const typeOfExtraCalories = await this.knex("slime")
                .insert({ slime_type_id: slimeTypes[3].id })
                .returning("id");
            return typeOfExtraCalories[0].id//Obese
        }
        const obj = this.totalMacroNutrients(slimeId)
        const carbs = (await obj).totalCarbs//246
        const protein = (await obj).totalProtein//124
        const fat = (await obj).totalFat//548
        let slimeTotalDiet = carbs + protein + fat //918

        if (protein / slimeTotalDiet > 0.5) {
           
            const typeOfKeto = await this.knex("slime")
            .insert({ slime_type_id: slimeTypes[1].id })
            .returning("id");
            return typeOfKeto[0].id// Keto


        } else if (carbs / slimeTotalDiet > 0.6) {
            const typeOfSkinnyFat = await this.knex("slime")
            .insert({ slime_type_id: slimeTypes[2].id })
            .returning("id");            
            return typeOfSkinnyFat[0].id// Skinny fat
        }
        return slimeTypes[0]


    };



    // autoMinusCalor = async(): Promise<number> =>{
    //     return 
    // };
}