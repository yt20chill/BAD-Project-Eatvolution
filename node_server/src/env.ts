import { config } from "dotenv";
import { join } from "path";
import populateEnv from "populate-env";
config({ path: join(__dirname, "..", ".env") });

export const env = {
  NODE_ENV: "",
  NODE_ENV_TEST: "",
  DB_HOST: "",
  DB_PORT: "",
  DB_NAME: "",
  DB_USERNAME: "",
  DB_PASSWORD: "",
  WEB_PORT: "",
  PY_PORT: "",
  REDIS_PORT: "",
  CN_API_KEY: "",
  SESSION_SECRET: "",
  GOOGLE_CLIENT_ID: "",
  GOOGLE_CLIENT_SECRET: "",
  PY_URL: process.env.PY_URL ?? "127.0.0.1",
  POSTGRES_DB: "",
  POSTGRES_USER: "",
  POSTGRES_PASSWORD: "",
  POSTGRES_HOST: "",
};

populateEnv(env, { mode: "halt" });
