import csvParser from "csv-parser";
import fs from "fs";
import { Food, GeneralOmitFields } from "models/dbModels";

export default class DbUtils {
  /**
   * read csv file and convert the data into seed-able objects
   * @param filepath
   * @returns Promise array of objects for insertion to table
   */
  static csvToTable<T = unknown>(filepath: string): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
      const result: Array<T> = [];
      fs.createReadStream(filepath)
        .pipe(csvParser())
        .on("data", (data) => result.push(data))
        .on("end", () => resolve(result))
        .on("error", (err) => reject(err));
    });
  }
}

type T = Omit<Food, GeneralOmitFields>;
export const nutritionToNumber = (food: T[]) => {
  return food.reduce(
    (result, f) => {
      for (const key of Object.keys(f)) {
        if (key === "name") continue;
        f[key] = parseFloat(f[key]);
        if (key === "cost") f[key] = Math.floor(f[key]);
      }
      result.push(f);
      return result;
    },
    [] as Omit<Food, GeneralOmitFields>[]
  );
};
