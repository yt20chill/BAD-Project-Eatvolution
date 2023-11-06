import csvParser from "csv-parser";
import fs from "fs";
import { Food, GeneralOmitFields } from "models/dbModels";

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
  // static cnItemsToDbFood = (items: Array<CNItem>): Omit<Food, GeneralOmitFields>[] => {
  //   const unitRegex = /(_g$|_mg$)/;
  //   return items.reduce(
  //     (acc, item) => {
  //       const food = {} as Omit<Food, GeneralOmitFields>;
  //       for (const key of Object.keys(item)) {
  //         acc.push((food[key.replace(unitRegex, "")] = item[key]));
  //       }
  //       acc.push(food);
  //       return acc;
  //     },
  //     [] as Omit<Food, GeneralOmitFields>[]
  //   );
  // };
}

type T = Omit<Food, GeneralOmitFields> | "class";
