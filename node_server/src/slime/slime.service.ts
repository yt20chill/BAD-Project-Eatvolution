import { Knex } from "knex";
import { SlimeType } from "../../models/dbModels";
import { EvolutionInfo, SlimeDetails } from "../../models/models";
import { SlimeServiceHelper } from "../../models/serviceModels";
import FoodService from "../food/food.service";
import DbUtils from "../utils/dbUtils";
import { BadRequestError, InternalServerError } from "../utils/error";
import GameConfig from "../utils/gameConfig";
import { logger } from "../utils/logger";

export default class SlimeService implements SlimeServiceHelper {
  constructor(private readonly knex: Knex) {}
  create = async (userId: number): Promise<void> => {
    const slimeTypes = await this.getAllTypes();
    const balanceTypeId = slimeTypes.get("Balance");
    if (!balanceTypeId) throw new InternalServerError("Balance slime type not found");
    const { max_calories } = await this.knex<SlimeType>("slime_type")
      .select("max_calories")
      .where("id", balanceTypeId)
      .first();
    await this.knex("slime").insert({
      owner_id: userId,
      slime_type_id: balanceTypeId,
      calories: max_calories,
    });
    return;
  };
  feed = async (slimeId: number, foodId: number): Promise<void> => {
    const foodService = new FoodService(this.knex);
    const foodDetails = (await foodService.getDetails(foodId))[0];
    const slimeDetails = await this.getDetails(slimeId);
    if (!foodDetails || !slimeDetails) throw new BadRequestError("Invalid food or slime id");
    const { calories: foodCalories, carbohydrates: carbs, fat, protein } = foodDetails;
    const {
      calories: slimeCalories,
      max_calories: slimeMaxCalories,
      extra_calories: slimeExtraCalories,
    } = slimeDetails;
    // update slime calories
    const updatedSlime = {} as Partial<SlimeDetails>;
    updatedSlime.calories = slimeCalories + foodCalories;
    if (updatedSlime.calories > slimeMaxCalories) {
      const extraCalories = updatedSlime.calories - slimeMaxCalories;
      updatedSlime.extra_calories = slimeExtraCalories + extraCalories;
      updatedSlime.calories = slimeMaxCalories;
    }

    // determine slime_type
    const updatedEvolutionInfo = {} as EvolutionInfo;
    updatedEvolutionInfo.food_count = slimeDetails.food_count + 1;
    updatedEvolutionInfo.total_carbs = slimeDetails.total_carbs + carbs;
    updatedEvolutionInfo.total_fat = slimeDetails.total_fat + fat;
    updatedEvolutionInfo.total_protein = slimeDetails.total_protein + protein;
    updatedEvolutionInfo.max_calories = updatedSlime.extra_calories;
    if (updatedEvolutionInfo.food_count >= 10) {
      updatedSlime.slime_type_id = await this.evolve(updatedEvolutionInfo);
    }

    const trx = await this.knex.transaction();
    try {
      await trx("slime_food").insert({
        food_id: foodId,
        slime_id: slimeId,
      });
      await trx("slime").update(updatedSlime).where("slime.id", slimeId);
      await trx.commit();
    } catch (error) {
      logger.error(error);
      await trx.rollback();
    }
  };
  reduceCalories = async (slimeId: number): Promise<void> => {
    const slimeDetails = await this.getDetails(slimeId);
    const { calories, extra_calories, bMR_multiplier } = slimeDetails;
    const updatedSlime = {} as Partial<SlimeDetails>;
    const calReductionRate = bMR_multiplier * GameConfig.BMR_CONSTANT;
    const elapsedSeconds = DbUtils.calculateElapsedTimeInSeconds(slimeDetails);
    const caloriesToReduce = Math.floor(calReductionRate * elapsedSeconds);
    updatedSlime.calories = calories - caloriesToReduce;
    if (updatedSlime.calories < 0) {
      const caloriesDeficit = -updatedSlime.calories; // = caloriesToReduce - calories
      updatedSlime.extra_calories = Math.max(extra_calories - caloriesDeficit, 0); // min extra calories = 0
      updatedSlime.calories = 0;
    }
    // if slime was obese and is no longer obese, update slime_type
    if (extra_calories > 2000 && updatedSlime.extra_calories <= 2000) {
      const evolutionInfo = { ...slimeDetails };
      evolutionInfo.max_calories = updatedSlime.extra_calories;
      updatedSlime.slime_type_id = await this.evolve(evolutionInfo);
    }
    await this.knex("slime").update(updatedSlime).where("slime.id", slimeId);
  };
  private getAllTypes = async (): Promise<Map<string, string>> => {
    const slimeTypes = await this.knex<SlimeType>("slime_type").select("id", "name");
    return slimeTypes.reduce((acc, slimeType) => {
      const { name, id } = slimeType;
      acc.set(name, id);
      return acc;
    }, new Map<string, string>());
  };

  private getEvolutionInfo = async (slimeId: number): Promise<EvolutionInfo> => {
    const info = await this.knex("slime_food")
      .join("food", "slime_food.food_id", "food.id")
      .join("slime", "slime_food.slime_id", "slime.id")
      .sum("food.protein as total_protein")
      .sum("food.carbohydrates as total_carbs")
      .sum("food.fat as total_fat")
      .count("food.id as food_count")
      .where("slime.id", slimeId)
      .first();

    for (const key in info) {
      info[key] = parseFloat(info[key]);
      if (key === "food_count") info[key] = parseInt(info[key]);
    }
    return info as EvolutionInfo;
  };

  private getDetails = async (slimeId: number): Promise<SlimeDetails> => {
    const slime = await this.knex("slime")
      .join("slime_type", "slime.slime_type_id", "slime_type.id")
      .select<SlimeDetails>(
        "slime.owner_id",
        "slime_type.id as slime_type_id",
        "slime.calories",
        "slime.max_calories",
        "slime.extra_calories",
        "slime.bMR_multiplier",
        "slime.earn_rate_multiplier",
        "slime.updated_at"
      )
      .where("slime.id", slimeId)
      .first();
    const evolutionInfo = await this.getEvolutionInfo(slimeId);
    return { ...slime, ...evolutionInfo };
  };

  private evolve = async (info: EvolutionInfo): Promise<string> => {
    // - Keto: eat >=10 food && > 50% protein
    // - Skinny fat: eat >= 10 food >  > 60% carbs
    // - Obese: eat >= 10 food, extra calories > 2000
    // - Balance: otherwise
    const slimeTypes = await this.getAllTypes();
    if (info.max_calories > 2000) return slimeTypes.get("Obese")!;
    const { total_carbs, total_fat, total_protein } = info;
    const totalMacroNutrients = total_carbs + total_fat + total_protein;
    if (totalMacroNutrients * 0.6 < total_carbs) return slimeTypes.get("Skinny fat")!;
    if (totalMacroNutrients * 0.5 < total_protein) return slimeTypes.get("Keto")!;
    return slimeTypes.get("Balance")!;
  };
}
