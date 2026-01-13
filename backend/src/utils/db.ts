import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { config } from './config.js';

const adapter = new PrismaBetterSqlite3({
  url: config.DATABASE_URL
});

export const prisma = new PrismaClient({ adapter });