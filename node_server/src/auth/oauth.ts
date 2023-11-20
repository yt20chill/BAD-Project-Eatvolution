import grant from "grant";
import { env } from "../config/env";

export const grantExpress = grant.express({
  defaults: {
    origin: env.NODE_ENV === "production" ? `${env.EXPRESS_URL}` : "http://localhost:8080",
    transport: "session",
    state: true,
  },
  google: {
    key: env.GOOGLE_CLIENT_ID || "",
    secret: env.GOOGLE_CLIENT_SECRET || "",
    scope: ["profile", "email"],
    callback: "/auth/google-login",
  },
});
