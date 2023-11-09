import { config as dotenvConfig } from "dotenv";
import type { Knex } from "knex";
import { env } from "../utils/env";

dotenvConfig();
// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: {
      database: env.DB_NAME,
      user: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      host: env.DB_HOST,
      port: +env.DB_PORT!,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: __dirname + "/migrations",
      tableName: "knex_migrations",
    },
  },

  test: {
    client: "postgresql",
    // debug: true,
    connection: {
      host: env.POSTGRES_HOST,
      database: env.POSTGRES_DB,
      user: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: __dirname + "/migrations",
      tableName: "knex_migrations",
    },
  },

  production: {
    client: "postgresql",
    connection: {
      database: env.DB_NAME,
      user: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      host: env.DB_HOST,
      port: +env.DB_PORT!,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: __dirname + "/migrations",
      tableName: "knex_migrations",
    },
  },
};

module.exports = config;
export default config;
