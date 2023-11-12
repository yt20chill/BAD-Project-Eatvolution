import { Knex } from "knex";
import { ExportSlimeCollection } from "../../../models/models";
import { SlimeCollectionServiceHelper } from "../../../models/serviceModels";

export default class SlimeCollectionService implements SlimeCollectionServiceHelper {
  constructor(private readonly knex: Knex) {}
  getSlimeCollection = async (userId: number): Promise<ExportSlimeCollection> => {
    throw new Error("Method not implemented.");
  };
  unlockSlimeCollection = async (userId: number, slime_type_id: string): Promise<void> => {
    const isDuplicated =
      (
        await this.knex("user_slime_type_collection")
          .select("id")
          .where("user_id", userId)
          .andWhere("slime_type_id", slime_type_id)
      ).length > 0;
    if (isDuplicated) return;
    await this.knex("user_slime_type_collection").insert({ user_id: userId, slime_type_id });
    return;
  };
}
