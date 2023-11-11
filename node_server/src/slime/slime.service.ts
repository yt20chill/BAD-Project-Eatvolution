import { Knex } from "knex";
import { SlimeServiceHelper } from "models/serviceModels";
import { SlimeType } from "../../models/dbModels";
import { InternalServerError } from "../utils/error";

export default class SlimeService implements SlimeServiceHelper {
  constructor(private readonly knex: Knex) {}
  createSlime = async (userId: number): Promise<void> => {
    const slimeTypes = await this.getAllSlimeType();
    const balanceTypeId = slimeTypes.find((slimeType) => slimeType.name === "Balance")?.id;
    if (!balanceTypeId) throw new InternalServerError("Balance slime type not found");
    await this.knex("slime").insert({ owner_id: userId, slime_type_id: balanceTypeId });
    return;
  };
  //TODO: change the output to Map<name, id>
  getAllSlimeType = async (): Promise<Pick<SlimeType, "id" | "name">[]> => {
    const slimeTypes = await this.knex<SlimeType>("slime_type").select("id", "name");
    return slimeTypes;
  };

  totalMacroNutrients = async (
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

    const protein = parseFloat(result.total_protein);
    const carbs = parseFloat(result.total_carbs);
    const fat = parseFloat(result.total_fat);

    let listMacroNutrients: {
      totalProtein: number;
      totalCarbs: number;
      totalFat: number;
    } = {
      totalProtein: protein,
      totalCarbs: carbs,
      totalFat: fat,
    };

    return listMacroNutrients;
  };

  extraCalories = async (slimeId: number): Promise<number> => {
    const result = await this.knex("slime")
      .select("extra_calories")
      .where("slime.id", slimeId)
      .first();

    const extraCalories = parseInt(result.extra_calories);

    return extraCalories;
  };

  slimeFeed = async (foodId: number, slimeId: number, knex: Knex = this.knex): Promise<number> => {
    const insertSlimeFood = await knex("slime_food")
      .insert({ food_id: foodId, slime_id: slimeId })
      .returning("id");

    return insertSlimeFood[0].id; //slime_food.id
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
