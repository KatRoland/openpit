import jwt from 'jsonwebtoken';
import { config } from '../utils/config.js';

export const authorize = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "token_not_found" });

  try {
    const verified = jwt.verify(token, config.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: "invalid_or_expired_token" });
  }
};