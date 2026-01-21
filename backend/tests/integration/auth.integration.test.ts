import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { login } from '@/controllers/authController.js';
import { prisma } from '@/utils/db.js';
import * as authHelpers from '@/helpers/authHelpers.js';
import { execSync } from 'node:child_process';

vi.mock('@/helpers/authHelpers.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/authHelpers.js')>();
  return {
    ...actual,
    authenticateSystemUser: vi.fn(),
  };
});

describe('Auth - Login Scenarios', () => {
  
  beforeAll(async () => {
    process.env.DATABASE_URL = "file:./test.db";
    execSync('npx prisma db push --accept-data-loss');
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    await prisma.$transaction([
      prisma.refreshToken.deleteMany(),
      prisma.user.deleteMany()
    ]);
  });

  const setup = (body: any) => {
    const req = { body } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    return { req, res };
  };

  it('SUCCESS: should create user and token in DB on valid credentials', async () => {
    const { req, res } = setup({ username: 'valid_user', password: 'correct_password' });
    
    (authHelpers.authenticateSystemUser as any).mockResolvedValue(undefined);

    await login(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      accessToken: expect.any(String)
    }));

    const user = await prisma.user.findUnique({ where: { username: 'valid_user' } });
    expect(user).not.toBeNull();
  });

  it('FAILURE: should return 401 and NOT create any records when PAM fails', async () => {
    const { req, res } = setup({ username: 'intruder', password: 'wrong_password' });
    
    (authHelpers.authenticateSystemUser as any).mockRejectedValue(new Error('authentication_failed'));

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'authentication_failed' });

    const userInDb = await prisma.user.findUnique({ where: { username: 'intruder' } });
    expect(userInDb).toBeNull();

    // Ensure no token was generated for them
    const tokenCount = await prisma.refreshToken.count();
    expect(tokenCount).toBe(0);
  });
});