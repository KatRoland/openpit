import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from './config.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pam = require('authenticate-pam');

export const authenticateSystemUser = (username: string, password: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    pam.authenticate(username, password, (err: string | null) => {
      if (err) return reject(new Error("authentication_failed"));
      resolve();
    });
  });
};

export const generateTokens = (userId: number, username: string) => {
  const accessToken = jwt.sign(
    { id: userId, username },
    config.ACCESS_TOKEN_SECRET,
    { expiresIn: config.ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    config.REFRESH_TOKEN_SECRET,
    { expiresIn: config.REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
};

export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};