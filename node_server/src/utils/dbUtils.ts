import csvParser from "csv-parser";
import fs from "fs";
import { Food } from "models/dbModels";
import { CnItem, GeneralOmitFields, InsertFood } from "models/models";

//TODO: change all static methods to normal, and export util in container
export default class DbUtils {
  /**
   * read csv file and convert the data into seed-able objects
   * @param filepath
   * @returns Promise array of objects for insertion to table
   */
  static csvToObjectPromise<T = unknown>(filepath: string): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
      const result: Array<T> = [];
      fs.createReadStream(filepath)
        .pipe(csvParser())
        .on("data", (data) => result.push(data))
        .on("end", () => resolve(result))
        .on("error", (err) => reject(err));
    });
  }
  static prepareFoodForSeeding = (food: T[]) => {
    return food.reduce(
      (result, f) => {
        const temp = {} as Omit<Food, GeneralOmitFields>;
        for (const key of Object.keys(f)) {
          if (key === "name" || key == "emoji") {
            temp[key] = f[key];
            continue;
          }
          if (key === "class") {
            temp.category_id = ++f[key];
            continue;
          }
          temp[key] = parseFloat(f[key]);
          if (key === "cost") temp[key] = Math.floor(f[key]);
        }
        result.push(temp);
        return result;
      },
      [] as Omit<Food, GeneralOmitFields>[]
    );
  };
  static cnItemToInsertFood = (item: CnItem): InsertFood => {
    const unitRegex = /(_g$|_mg$|_total_g$)/;
    const food = {} as InsertFood;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, potassium_mg, serving_size_g, fat_saturated_g, ...rest } = item;
    const normalizeFactor = serving_size_g / 100;
    food.name = name;
    food.saturated_fat = fat_saturated_g / normalizeFactor;
    for (const key of Object.keys(rest)) {
      food[key.replace(unitRegex, "")] = item[key] / normalizeFactor;
    }
    return food;
  };
  /**
   * calculate elapsed time in seconds from last update
   * @param input Objects that have updated_at field
   * @param endDate time of which interval ends. Default to now
   * @returns elapsed time in seconds from last update to endDate
   */
  static calculateElapsedTimeInSeconds = (
    input: Record<"updated_at", string | Date>,
    endTime = new Date()
  ): number => {
    if (!input.updated_at) throw new Error("updated_at is missing");
    const updatedAt = new Date(input.updated_at);
    return Math.floor((endTime.getTime() - updatedAt.getTime()) / 1000);
  };
  static convertStringToNumber = <T = unknown>(dbObj: Record<string, any>): T => {
    const result = {} as T;
    for (const [key, value] of Object.entries(dbObj)) {
      result[key] = isNaN(+value) || typeof value !== "string" ? value : +value;
    }
    return result;
  };
}

type T = Omit<Food, GeneralOmitFields> | "class";
