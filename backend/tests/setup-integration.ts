import { execSync } from 'node:child_process';
import { prisma } from '../src/utils/db.js'; 
import { beforeAll, beforeEach } from 'vitest';

beforeAll(async () => {
  process.env.DATABASE_URL = "file:./test.db";
  
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
});

beforeEach(async () => {
  const deleteTokens = prisma.refreshToken.deleteMany();
  const deleteUsers = prisma.user.deleteMany();
  
  await prisma.$transaction([deleteTokens, deleteUsers]);
});