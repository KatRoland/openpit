import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config.js';

interface UserPayload {
  id: number;
  username: string;
}

export const authorize = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    return res.status(401).json({ error: "token_not_found" });
  }

  try {
    const verified = jwt.verify(token, config.ACCESS_TOKEN_SECRET) as UserPayload;
    
    req.user = verified;
    
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "token_expired" });
    }

    res.status(403).json({ error: "invalid_token" });
  }
};