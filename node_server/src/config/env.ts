import { config } from "dotenv";
import { join } from "path";
import populateEnv from "populate-env";
config({ path: join(__dirname, "..", "..", ".env") });

export const env = {
  NODE_ENV: "",
  DB_HOST: "localhost",
  DB_PORT: 5432,
  DB_NAME: "eatvolution",
  DB_USERNAME: "",
  DB_PASSWORD: "",
  WEB_PORT: 8080,
  PY_PORT: 8000,
  REDIS_URL: "redis://localhost:6379",
  CN_API_KEY: "",
  SESSION_SECRET: "",
  GOOGLE_CLIENT_ID: "",
  GOOGLE_CLIENT_SECRET: "",
  PY_URL: "http://127.0.0.1",
  POSTGRES_DB: "test",
  POSTGRES_USER: "postgres",
  POSTGRES_PASSWORD: "postgres",
  POSTGRES_HOST: "postgres",
  EXPRESS_URL: "http://127.0.0.1",
};

populateEnv(env, { mode: "halt" });
