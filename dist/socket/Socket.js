import { Server } from "socket.io";
import http from "http";
import express from "express";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"], //http://localhost:5173 //https://mern-stack-chat-app-frontend.vercel.app
        methods: ["GET", "POST"],
    },
});
export const getRecieverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};
export const getRecieverSocket = (receiverId) => {
    return userSocketMap2[receiverId];
};
const userSocketMap = {};
const userSocketMap2 = {};
io.on("connection", (Socket) => {
    const userid = Socket.handshake.query.userId;
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
