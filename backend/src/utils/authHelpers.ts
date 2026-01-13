import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pam = require('authenticate-pam');

export const authenticateSystemUser = (username: string, password: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    pam.authenticate(username, password, (err: string | null) => {
      if (err) return reject(new Error("Linux authentication failed"));
      resolve();
    });
  });
};

export const generateToken = (payload: object) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '8h' });
};