import { config } from "dotenv";
import populateEnv from "populate-env";
config();

export const env = {
  NODE_ENV: "",
  DB_HOST: "",
  DB_PORT: +process.env.PORT,
  DB_NAME: "",
  TEST_DB_NAME: "",
  DB_USERNAME: "",
  DB_PASSWORD: "",
  WEB_PORT: +process.env.WEB_PORT,
};

populateEnv(env, { mode: "halt" });
