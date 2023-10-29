import { config } from "dotenv";
config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DB_HOST: process.env.DB_HOST ?? "localhost",
  DB_PORT: +(process.env.PORT ?? 5432),
  DB_NAME: process.env.DB_NAME,
  TEST_DB_NAME: process.env.TEST_DB_NAME,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  WEB_PORT: +(process.env.WEB_PORT ?? 8080),
};
