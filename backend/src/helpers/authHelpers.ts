import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../utils/config.js';
import { createRequire } from 'module';
import { sanitizeString } from '@/helpers/stringHelper.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
    { id: userId, jti: crypto.randomUUID() },
    config.REFRESH_TOKEN_SECRET,
    { expiresIn: config.REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
};

export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// unused yet, but may be useful later
export const verifyActionToken = async (actionToken: string, username: string, action: string, target: string | null) => {
  try {
    const payload = jwt.verify(actionToken, config.ACTION_TOKEN_SECRET) as any;

    if (payload.username !== username) {
      return false;
    }

    if (payload.action !== action) {
      return false;
    }

    if (target && payload.target !== target) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

export async function isSystemUserExists(username: string): Promise<boolean> {
    const sanitizedUsername = sanitizeString(username);

    try {
        const { stdout } = await execAsync(`id -u ${sanitizedUsername}`).catch(() => ({ stdout: '' }));
        return !!stdout;
    } catch (error) {
        console.error(`Error checking existence of user ${sanitizedUsername}:`, error);
        return false;
    }
}