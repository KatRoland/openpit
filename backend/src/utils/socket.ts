import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { systemStats } from './systemHelper.js';
import { config } from './config.js';
import jwt from 'jsonwebtoken';

let io: Server;

export const initSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.use((socket, next) => {
    const token = socket.handshake.headers['authorization'];
    if (!token) return next(new Error("auth_token_missing"));

    try {
      const split = token.split(' ');
      if (split.length !== 2 || split[0] !== 'Bearer') {
        return next(new Error("invalid_auth_format"));
      }

      jwt.verify(split[1], config.ACCESS_TOKEN_SECRET);
      next();
    } catch (err) {
      next(new Error("invalid_token"));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.emit('system:metrics', systemStats());

    socket.on('system:requestMetrics', () => {
      console.log(`Metrics requested by: ${socket.id}`);
      try {
      socket.emit('system:metrics', systemStats());
      } catch (err) {
        console.error(`Error sending metrics to ${socket.id}:`, err);
      }
    });

    socket.on('disconnect', () => console.log('Client disconnected'));
  });

  setInterval(() => {
    io.emit('system:metrics', systemStats());
  }, 2000);

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("socket_not_initialized");
  }
  return io;
};