import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config.js';

interface ActionPayload {
  action: string;
  target?: string;
  username: string;
}

export const verifyActionToken = (req: Request, res: Response, next: NextFunction) => {
    const { actionToken, action, target } = req.body;
  
    if(!actionToken) {
      return res.status(400).json({ error: "action_token_required" });
    }

  try {
    const verified = jwt.verify(actionToken, config.ACTION_TOKEN_SECRET) as ActionPayload;

    if(verified.username !== req.user?.username) {
      return res.status(403).json({ error: "invalid_action_token_username" });
    }

    if(verified.action !== action) {
      return res.status(403).json({ error: "invalid_action_token_action" });
    }

    if(target && verified.target !== target || (verified.target && !target)) {
        return res.status(403).json({ error: "invalid_action_token_target" });
    }
    
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "action_token_expired" });
    }

    res.status(403).json({ error: "invalid_action_token" });
  }
};