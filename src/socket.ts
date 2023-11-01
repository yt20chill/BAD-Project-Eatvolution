import express from "express";
import expressSession from "express-session";
import http from "http";
import SocketIO from "socket.io";
export const app = express();
export const server = new http.Server(app);
export const io = new SocketIO.Server(server);

const socketLog: Map<string, SocketIO.Socket> = new Map();

export const socketSession = expressSession({
  secret: "_public",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
});

export const assignSocket = (userId: string, socket: SocketIO.Socket) => {
  if (socketLog.has(userId)) {
    const prevSocket = socketLog.get(userId);
    if (prevSocket) prevSocket.disconnect();
  }
  socket.join(userId);
  socketLog.set(userId, socket);
};

export const removeFromSocketLog = (userId: string) => {
  socketLog.delete(userId);
};
