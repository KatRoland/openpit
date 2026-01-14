import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { getMemoryStats } from './sysusage.js';
import { config } from './config.js';
import jwt from 'jsonwebtoken';

let io: Server;

export const initSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("auth_token_missing"));

    try {
      jwt.verify(token, config.ACCESS_TOKEN_SECRET);
      next();
    } catch (err) {
      next(new Error("invalid_token"));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    socket.emit('system:metrics', getMemoryStats());

    socket.on('disconnect', () => console.log('Client disconnected'));
  });

  setInterval(() => {
    io.emit('system:metrics', getMemoryStats());
  }, 2000);

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("socket_not_initialized");
  }
  return io;
};