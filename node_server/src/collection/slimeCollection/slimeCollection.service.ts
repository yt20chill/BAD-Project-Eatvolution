import { Knex } from "knex";
import { ExportSlimeCollection } from "../../../models/models";
import { SlimeCollectionServiceHelper } from "../../../models/serviceModels";

export default class SlimeCollectionService implements SlimeCollectionServiceHelper {
  constructor(private readonly knex: Knex) {}
  getSlimeType(userId: number): Promise<ExportSlimeCollection> {
    throw new Error("Method not implemented.");
  }
}
