import Knex from "knex";
import { createClient } from "redis";
import knexConfig from "../src/db/knexfile";
import { env } from "./env";
export const redis = createClient();
export const knex = Knex(knexConfig[env.NODE_ENV]);
