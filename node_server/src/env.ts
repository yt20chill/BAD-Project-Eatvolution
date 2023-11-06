import { config } from "dotenv";
import { join } from "path";
import populateEnv from "populate-env";
config({ path: join(__dirname, "..", ".env") });

export const env = {
  NODE_ENV: "",
  DB_HOST: "",
  DB_PORT: "",
  DB_NAME: "",
  TEST_DB_NAME: "",
  DB_USERNAME: "",
  DB_PASSWORD: "",
  WEB_PORT: "",
  PY_PORT: "",
  REDIS_PORT: "",
  CN_API_KEY: "",
  SESSION_SECRET: "",
  GOOGLE_CLIENT_ID: "",
  GOOGLE_CLIENT_SECRET: ""
};

populateEnv(env, { mode: "halt" });
