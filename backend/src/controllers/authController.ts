import { prisma } from '../utils/db.js';
import jwt from 'jsonwebtoken';
import { 
  authenticateSystemUser, 
  generateTokens, 
  hashToken 
} from '../helpers/authHelpers.js';
import { config } from '../utils/config.js';
import { createPasswordForSambaUser } from '@/helpers/sambaHelper.js';
import { createSystemUser } from '@/utils/authUtils.js';

export const login = async (req: any, res: any) => {
  const { username, password } = req.body;

  try {
    await authenticateSystemUser(username, password);

    const user = await prisma.user.upsert({
      where: { username },
      update: { lastLogin: new Date() },
      create: { username }
    });

    await createPasswordForSambaUser(username, password);

    const { accessToken, refreshToken } = generateTokens(user.id, user.username);

    await prisma.refreshToken.create({
      data: {
        hashedToken: hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.json({ accessToken, refreshToken });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const refresh = async (req: any, res: any) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);

  try {
    const payload = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET) as any;
    
    const savedToken = await prisma.refreshToken.findUnique({
      where: { hashedToken: hashToken(refreshToken) }
    });

    if (!savedToken || savedToken.revoked || savedToken.expiresAt < new Date()) {
      return res.status(403).json({ error: "invalid_refresh_token" });
    }

    await prisma.refreshToken.delete({ where: { id: savedToken.id } });

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.sendStatus(403);

    const tokens = generateTokens(user.id, user.username);

    await prisma.refreshToken.create({
      data: {
        hashedToken: hashToken(tokens.refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.json(tokens);
  } catch (err) {
    res.status(403).json({ error: "token_expired_or_invalid" });
  }
};


export const logout = async (req: any, res: any) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ error: "refresh_token_required" });
  }
  try {
    const hashed = hashToken(refreshToken);

    await prisma.refreshToken.deleteMany({
      where: { hashedToken: hashed },
    });

    res.status(200).json({ success: true, message: "logged_out_successfully" });
  } catch (error) {
    res.status(200).json({ success: true });
  }
};

export const requestActionToken = async (req: any, res: any) => {
  const { username, password, action, target } = req.body;

  try {
    await authenticateSystemUser(username, password);

    const actionToken = jwt.sign(
      { username, action, ...(target && { target }) },
      config.ACTION_TOKEN_SECRET,
      { expiresIn: '1m' }
    );

    res.json({ actionToken });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const handleCreateSystemUser = async (req: any, res: any) => {
  const { username, password } = req.body;
  try {
      if (!username) {
          return res.status(400).json({ error: "username_required" });
      }

      if (!password) {
          return res.status(400).json({ error: "password_required" });
      }

      await createSystemUser(username, password);
      res.status(201).json({ message: "system_user_created_successfully" });
  } catch (error: any) {
      if (error.message === "user_already_exists") {
          return res.status(409).json({ error: "user_already_exists" });
      } else {
          return res.status(500).json({ error: "internal_server_error" });
      }
  }
}
