import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
  PYTHON_EXECUTABLE: z.string().default('python'),
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().positive().default(300),
  UPLOAD_MAX_FILES: z.coerce.number().int().positive().default(20),
  TASK_RETENTION_HOURS: z.coerce.number().positive().default(2),
  TASK_TIMEOUT_SECONDS: z.coerce.number().positive().default(300),
  MAX_CONCURRENT_TASKS: z.coerce.number().int().positive().default(2),
  STORAGE_DIR: z.string().default('./storage'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Configuration error in environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = {
  ...parsed.data,
  resolvedStorageDir: path.resolve(process.cwd(), parsed.data.STORAGE_DIR),
};
