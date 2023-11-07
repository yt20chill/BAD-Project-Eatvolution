import grant from "grant";

export const grantExpress = grant.express({
    defaults: {
      origin: "http://localhost:8080",
      transport: "session",
      state: true,
    },
    google: {
      key: process.env.GOOGLE_CLIENT_ID || "",
      secret: process.env.GOOGLE_CLIENT_SECRET || "",
      scope: ["profile", "email"],
      callback: "/auth/google-login",
    },
  });
