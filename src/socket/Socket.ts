import { Server, Socket } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

export const getRecieverSocketId = (receiverId: string) => {
  return userSocketMap[receiverId];
};

export const getRecieverSocket = (receiverId: string) => {
  return userSocketMap2[receiverId];
};

const userSocketMap: { [key: string]: string } = {};
const userSocketMap2: { [key: string]: Socket } = {};

io.on("connection", (Socket) => {
  const userid = Socket.handshake.query.userId as string;

  if (userid) {
    userSocketMap[userid] = Socket.id;
    userSocketMap2[userid] = Socket;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  Socket.on("disconnect", () => {
    delete userSocketMap[userid];
    delete userSocketMap2[userid];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
