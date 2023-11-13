import { Knex } from "knex";
import { RedisClientType } from "redis";
import { Slime, SlimeType } from "../../models/dbModels";
import { EvolutionInfo, ExportSlime, SlimeDetails } from "../../models/models";
import { SlimeServiceHelper } from "../../models/serviceModels";
import SlimeCollectionService from "../collection/slimeCollection/slimeCollection.service";
import FoodService from "../food/food.service";
import DbUtils from "../utils/dbUtils";
import { BadRequestError, ForbiddenError, InternalServerError } from "../utils/error";
import GameConfig from "../utils/gameConfig";
import { logger } from "../utils/logger";

export default class SlimeService implements SlimeServiceHelper {
  private readonly originalKnex: Knex;
  constructor(
    private readonly knex: Knex,
    private readonly redis: RedisClientType
  ) {
    this.originalKnex = knex;
  }
  private createTransaction = async (): Promise<Knex.Transaction> => {
    const trx = await this.knex.transaction();
    this.knex.bind(trx);
    return trx;
  };
  private isOwner = async (userId: number, slimeId: number) => {
    const result = await this.knex("slime").where("owner_id", userId).andWhere("id", slimeId);
    if (result.length === 0) throw new ForbiddenError("not an owner of this slime");
    return;
  };
  private getValidSlimeId = async (userId: number, slimeId?: number): Promise<number> => {
    if (slimeId !== undefined) {
      await this.isOwner(userId, slimeId);
      return slimeId;
    }
    const { id } = await this.knex<Slime>("slime").select("id").where("owner_id", userId).first();
    if (id === undefined) throw new BadRequestError("no slime was found");
    return id;
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
      .join("slime_type", "slime.slime_type_id", "slime_type.id")
      .sum("food.protein as total_protein")
      .sum("food.carbohydrates as total_carbs")
      .sum("food.fat as total_fat")
      .count("food.id as food_count")
      .max("slime.extra_calories as extra_calories")
      .where("slime.id", slimeId)
      .first();
    return DbUtils.convertStringToNumber(info);
  };

  private getDetails = async (slimeId: number): Promise<SlimeDetails> => {
    // if a slime has no calories, earn rate = 0
    const earnRate = (await this.getAllSlimeEarningRate()).get(slimeId) ?? 0;
    const slime = await this.knex("slime")
      .select<
        Omit<
          SlimeDetails,
          "food_count" | "extra_calories" | "total_protein" | "total_fat" | "total_carbs"
        >
      >(
        "user.username as owner",
        "slime_type.id as slime_type_id",
        "slime_type.name as slime_type",
        "slime_type.description as slime_type_description",
        "slime.calories",
        "slime_type.max_calories",
        this.knex.raw(`slime_type.bmr_multiplier * ? as bmr_rate`, [GameConfig.BMR_CONSTANT]),
        "slime.updated_at"
      )
      .join("slime_type", "slime.slime_type_id", "slime_type.id")
      .join("user", "slime.owner_id", "user.id")
      .where("slime.id", slimeId)
      .first();
    const evolutionInfo = await this.getEvolutionInfo(slimeId);
    return DbUtils.convertStringToNumber({ ...slime, ...evolutionInfo, earn_rate: earnRate });
  };

  private evolve = async (info: EvolutionInfo): Promise<string> => {
    // - Keto: eat >=10 food && > 50% protein
    // - Skinny fat: eat >= 10 food >  > 60% carbs
    // - Obese: eat >= 10 food, extra calories > 2000
    // - Balance: otherwise
    const slimeTypes = await this.getAllTypes();
    if (info.extra_calories > 2000) return slimeTypes.get("Obese")!;
    const { total_carbs, total_fat, total_protein } = info;
    const totalMacroNutrients = total_carbs + total_fat + total_protein;
    if (totalMacroNutrients * 0.6 < total_carbs) return slimeTypes.get("Skinny Fat")!;
    if (totalMacroNutrients * 0.5 < total_protein) return slimeTypes.get("Keto")!;
    return slimeTypes.get("Balance")!;
  };

  private getAllSlimeEarningRate = async (): Promise<Map<number, number>> => {
    const earnRates = await this.knex("slime_food")
      .select<{ earn_rate: number; slime_id: number }[]>(
        this.knex.raw(`SUM(food.protein * slime_type.earn_rate_multiplier * ?) as "earn_rate"`, [
          GameConfig.EARNING_RATE_CONSTANT,
        ]),
        "slime.id"
      )
      .join("slime", "slime.id", "slime_food.slime_id")
      .join("food", "slime_food.food_id", "food.id")
      .join("slime_type", "slime_type.id", "slime.slime_type_id")
      .groupBy("slime.id")
      .where("slime.calories", ">", 0);
    return earnRates.reduce((acc, e) => {
      acc.set(+e.slime_id, +e.earn_rate);
      return acc;
    }, new Map<number, number>());
  };
  create = async (userId: number): Promise<void> => {
    const slimeTypes = await this.getAllTypes();
    const balanceTypeId = slimeTypes.get("Balance");
    if (!balanceTypeId) throw new InternalServerError("Balance slime type not found");
    await this.knex("slime").insert({
      owner_id: userId,
      slime_type_id: balanceTypeId,
      calories: GameConfig.INITIAL_CALORIES,
    });
    return;
  };
  // TODO: redis
  feed = async (userId: number, foodId: number, slimeId?: number): Promise<ExportSlime> => {
    slimeId = await this.getValidSlimeId(userId, slimeId);
    const foodService = new FoodService(this.knex, this.redis);
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
    updatedEvolutionInfo.extra_calories = updatedSlime.extra_calories;
    if (updatedEvolutionInfo.food_count >= GameConfig.MIN_FOOD_TO_EVOLVE) {
      updatedSlime.slime_type_id = await this.evolve(updatedEvolutionInfo);
    }
    DbUtils.checkNaN(updatedSlime);
    // unlock slime_type collection
    if (updatedSlime.slime_type_id && updatedSlime.slime_type_id !== slimeDetails.slime_type_id) {
      const slimeCollectionService = new SlimeCollectionService(this.knex);
      await slimeCollectionService.unlockSlimeCollection(userId, updatedSlime.slime_type_id);
    }
    const trx = await this.createTransaction();
    try {
      await this.knex("slime_food").insert({
        food_id: foodId,
        slime_id: slimeId,
      });
      await this.knex("slime").update(updatedSlime).where("slime.id", slimeId);
      await trx.commit();
    } catch (error) {
      logger.error(error);
      await trx.rollback();
    } finally {
      this.knex.bind(this.originalKnex);
    }
    return await this.getExportSlime(slimeId);
  };
  reduceCalories = async (slimeId: number): Promise<void> => {
    const now = new Date().toISOString();
    const slimeDetails = await this.getDetails(slimeId);
    const {
      calories,
      extra_calories,
      bmr_rate,
      food_count,
      total_protein,
      total_fat,
      total_carbs,
    } = slimeDetails;
    const evolutionInfo = { food_count, extra_calories, total_protein, total_fat, total_carbs };
    const updatedSlime = {} as Partial<SlimeDetails>;
    const elapsedSeconds = DbUtils.calculateElapsedTimeInSeconds(slimeDetails);
    const caloriesToReduce = Math.floor(bmr_rate * elapsedSeconds);
    updatedSlime.calories = calories - caloriesToReduce;
    updatedSlime.updated_at = now;
    if (updatedSlime.calories < 0) {
      const caloriesDeficit = -updatedSlime.calories; // = caloriesToReduce - calories
      updatedSlime.calories = 0;
      updatedSlime.extra_calories = Math.max(extra_calories - caloriesDeficit, 0); // min extra calories = 0
    }
    // if slime was obese and is no longer obese, update slime_type
    if (extra_calories > 2000 && updatedSlime.extra_calories <= 2000) {
      evolutionInfo.extra_calories = updatedSlime.extra_calories;
      updatedSlime.slime_type_id = await this.evolve(evolutionInfo);
    }
    DbUtils.checkNaN(updatedSlime);
    await this.knex("slime").update(updatedSlime).where("slime.id", slimeId);
    return;
  };
  getExportSlime = async (userId: number, slimeId?: number): Promise<ExportSlime> => {
    slimeId = await this.getValidSlimeId(userId, slimeId);
    await this.reduceCalories(slimeId);
    const {
      slime_id: id,
      owner,
      slime_type,
      slime_type_description,
      calories: current_calories,
      max_calories,
      extra_calories,
      earn_rate,
      bmr_rate,
    } = await this.getDetails(slimeId);
    return {
      id,
      owner,
      slime_type,
      slime_type_description,
      current_calories,
      max_calories,
      extra_calories,
      earn_rate,
      bmr_rate,
    };
  };
}
