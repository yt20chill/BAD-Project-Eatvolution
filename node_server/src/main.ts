import express from "express";
import path from "path";
import { app, io, server, socketSession } from "./socket";
import { ApplicationError } from "./utils/error";
import { logger } from "./utils/logger";
import { AppUtils } from "./utils/utils";
const PORT = 8080;

app.use(express.json());
app.use(socketSession);
// app.use(grantExpress);
io.use((socket, next) => {
  const req = socket.request as express.Request;
  const res = req.res as express.Response;
  socketSession(req, res, next as express.NextFunction);
});

//Examples of routes
// app.use("/api", isLoggedInForApi, apiRoutes);
// app.use("/auth", authRoutes);
// app.use("/oauth", oauthRoutes);

app.use(express.static(path.join(__dirname, "..", "public")));
// Example for serving guarded folder
// app.use("/user", isLoggedInForFrontEnd, express.static(path.join(__dirname, "protected")));

app.use((_, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "404.html"));
});

// Examples of joining rooms when the user is logged in
// io.on("connection", (socket) => {
//   const req = socket.request as express.Request;
//   const userId = req.session.userId;
//   userId ? assignSocket(userId, socket) : null;
// });

app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof ApplicationError) {
      res.status(error.httpStatus).json(AppUtils.setServerResponse(error.message, false));
      return;
    }
    res.status(500).json(AppUtils.setServerResponse("internal server error", false));
    return;
  }
);

server.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});
