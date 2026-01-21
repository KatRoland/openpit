import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, refresh } from '@/controllers/authController.js';
import { prisma } from '@/utils/db.js';
import * as authHelpers from '@/helpers/authHelpers.js';
import jwt from 'jsonwebtoken';

vi.mock('@/utils/db.js', () => ({
  prisma: {
    user: { upsert: vi.fn(), findUnique: vi.fn() },
    refreshToken: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
  },
}));

vi.mock('@/helpers/authHelpers.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/authHelpers.js')>();
  return {
    ...actual,
    authenticateSystemUser: vi.fn(),
  };
});

vi.mock('jsonwebtoken');

describe('Auth - Unit Tests', () => {
  const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.sendStatus = vi.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login()', () => {
    it('should return 401 if PAM authentication fails', async () => {
      const req = { body: { username: 'user', password: 'pass' } };
      const res = mockRes();
      
      (authHelpers.authenticateSystemUser as any).mockRejectedValue(new Error('fail'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  describe('refresh()', () => {
    it('should return 403 if savedToken is revoked', async () => {
      const req = { body: { refreshToken: 'token' } };
      const res = mockRes();

      (jwt.verify as any).mockReturnValue({ id: 1 });
      (prisma.refreshToken.findUnique as any).mockResolvedValue({ 
        revoked: true, 
        expiresAt: new Date(Date.now() + 10000) 
      });

      await refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "invalid_refresh_token" });
    });
  });
});