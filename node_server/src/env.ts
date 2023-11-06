import { config } from "dotenv";
import { join } from "path";
import populateEnv from "populate-env";
config({ path: join(__dirname, "..", ".env") });

export const env = {
  NODE_ENV: "",
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
  PY_URL: process.env.PY_URL ?? "127.0.0.1",
};

populateEnv(env, { mode: "halt" });
