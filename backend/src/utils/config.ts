import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().default('file:./prisma/dev.db'),
  JWT_SECRET: z.string(),
  PORT: z.string().default('3000'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("Invalid environment variables, exiting...");
  process.exit(1);
}

export const config = _env.data;