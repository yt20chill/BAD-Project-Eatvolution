import { Knex } from "knex";
import { SlimeType } from "../../models/dbModels";
import { InternalServerError } from "../utils/error";

export default class SlimeService {
  constructor(private readonly knex: Knex) {}
  createSlime = async (userId: number): Promise<void> => {
    const slimeTypes = await this.getAllSlimeType();
    const balanceTypeId = slimeTypes.get("Balance");
    if (!balanceTypeId) throw new InternalServerError("Balance slime type not found");
    await this.knex("slime").insert({ owner_id: userId, slime_type_id: balanceTypeId });
    return;
  };
  getAllSlimeType = async (): Promise<Map<string, string>> => {
    const slimeTypes = await this.knex<SlimeType>("slime_type").select("id", "name");
    return slimeTypes.reduce((acc, slimeType) => {
      const { name, id } = slimeType;
      acc.set(name, id);
      return acc;
    }, new Map<string, string>());
  };

  private getTotalMacroNutrients = async (
    slimeId: number
  ): Promise<{
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  }> => {
    const result = await this.knex("slime_food")
      .join("food", "slime_food.food_id", "=", "food.id")
      .join("slime", "slime_food.slime_id", "=", "slime.id")
      .sum("food.protein as total_protein")
      .sum("food.carbohydrates as total_carbs")
      .sum("food.fat as total_fat")
      .where("slime.id", slimeId)
      .groupBy("slime.id")
      .first();

    const totalProtein = parseFloat(result.total_protein);
    const totalCarbs = parseFloat(result.total_carbs);
    const totalFat = parseFloat(result.total_fat);

    return {
      totalProtein,
      totalCarbs,
      totalFat,
    };
  };

  private getSlimeData = async (slimeId: number) => {};

  feedSlime = async (foodId: number, slimeId: number): Promise<void> => {
    const trx = await this.knex.transaction();
    try {
      await trx("slime_food").insert({
        food_id: foodId,
        slime_id: slimeId,
      });
    } catch (error) {}
  };

  slimeData = async (
    slimeId: number
  ): Promise<{
    slime_type: string;
    calories: number;
    extra_calories: number;
  }> => {
    const db_slimeData = await this.knex("slime")
      .join("slime_type", "slime.slime_type_id", "=", "slime_type.id")
      .select("slime_type.id", "calories", " extra_calories")
      .where("slime.id", slimeId);

    let slimeDataList: {
      slime_type: string;
      calories: number;
      extra_calories: number;
    } = db_slimeData[0];

    return slimeDataList;
  };

  countFood = async (slimeId: number): Promise<boolean> => {
    const foodNum = (
      await this.knex("slime_food")
        .join("slime", "slime_food.slime_id", "=", "slime.id")
        .count("food_id")
        .groupBy("slime.id")
        .where("slime.id", slimeId)
    )[0];

    if (+foodNum <= 10) {
      return false;
    }
    return true;
  };

  evolution = async (slimeId: number, userID: number): Promise<any> => {
    // - Keto: eat >=10 food && > 50% protein
    // - Skinny fat: eat >= 10 food >  > 60% carbs
    // - Obese: eat >= 10 food, extra calories > 2000

    const countFood = await this.countFood(slimeId);
    if (!countFood) {
      return false;
    }

    const slimeTypes = await this.getAllSlimeType();
    const extra_calories = await this.extraCalories(slimeId);

    if (extra_calories > 2000) {
      const typeOfExtraCalories = await this.knex("slime")
        .update({ slime_type_id: slimeTypes[3].id })
        .where("owner_id", userID)
        .returning("slime_type_id");
      return typeOfExtraCalories[0].slime_type_id; //Obese
    }
    const obj = this.totalMacroNutrients(slimeId);
    const carbs = (await obj).totalCarbs;
    const protein = (await obj).totalProtein;
    const fat = (await obj).totalFat;
    let slimeTotalDiet = carbs + protein + fat;

    let proteinEvo = protein / slimeTotalDiet;
    let carbsEvo = carbs / slimeTotalDiet;

    if (proteinEvo > 0.5) {
      const typeOfKeto = await this.knex("slime")
        .update({ slime_type_id: slimeTypes[1].id })
        .where("owner_id", userID)
        .returning("slime_type_id");
      return typeOfKeto[0].slime_type_id; // Keto
    } else if (carbsEvo > 0.6) {
      const typeOfSkinnyFat = await this.knex("slime")
        .update({ slime_type_id: slimeTypes[2].id })
        .where("owner_id", userID)
        .returning("slime_type_id");
      return typeOfSkinnyFat[0].slime_type_id; // Skinny fat
    }

    return slimeTypes[0];
  };
}
