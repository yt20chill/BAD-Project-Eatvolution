import { Knex } from "knex";
import { UserSlimeTypeCollection } from "../../models/dbModels";
import { SlimeCollection } from "../../models/models";
import { SlimeCollectionServiceHelper } from "../../models/serviceModels";
import DbUtils from "../../utils/dbUtils";

export default class SlimeCollectionService implements SlimeCollectionServiceHelper {
  constructor(private readonly knex: Knex) {}
  getSlimeCollection = async (userId: number): Promise<SlimeCollection[]> => {
    const slimeCollection = await this.knex<UserSlimeTypeCollection>("slime_type")
      .select(
        "t.slime_type_id",
        "slime_type.name",
        "slime_type.description",
        "slime_type.max_calories",
        "slime_type.bmr_multiplier",
        "slime_type.earn_rate_multiplier"
      )
      .join("user_slime_type_collection as t", "t.slime_type_id", "slime_type.id")
      .where("t.user_id", userId);
    return DbUtils.convertStringToNumber(slimeCollection);
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
