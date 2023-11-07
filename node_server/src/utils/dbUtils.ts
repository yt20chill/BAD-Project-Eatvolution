import csvParser from "csv-parser";
import fs from "fs";
import { Food, GeneralOmitFields } from "models/dbModels";
import { CnItem, InsertFood } from "models/models";

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
    const unitRegex = /(_g$|_mg$)/;
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
}

type T = Omit<Food, GeneralOmitFields> | "class";
