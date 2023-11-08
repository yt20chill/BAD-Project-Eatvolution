import express from "express";
import expressSession from "express-session";
import http from "http";
import SocketIO from "socket.io";
import { env } from "./env";
export const app = express();
export const server = new http.Server(app);
export const io = new SocketIO.Server(server);

const socketLog: Map<number, SocketIO.Socket> = new Map();

export const socketSession = expressSession({
  secret: env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
});

export const assignSocket = (userId: number, socket: SocketIO.Socket) => {
  if (socketLog.has(userId)) {
    const prevSocket = socketLog.get(userId);
    if (prevSocket) prevSocket.disconnect();
  }
  socket.join(userId.toString());
  socketLog.set(userId, socket);
};
