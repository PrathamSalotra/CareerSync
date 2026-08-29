import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

// Load .env file if present (Node.js 20+ native loadEnvFile)
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath);
  } catch (err) {
    // Ignore error if already loaded or handled
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_RESET_SECRET: z.string().min(1, 'JWT_RESET_SECRET is required'),
  COOKIE_SECURE: z.preprocess(
    (val) => String(val).toLowerCase() === 'true',
    z.boolean().default(false)
  ),
  ADZUNA_APP_ID: z.string().min(1, 'ADZUNA_APP_ID is required'),
  ADZUNA_APP_KEY: z.string().min(1, 'ADZUNA_APP_KEY is required'),
  GOOGLE_GENAI_API_KEY: z.string().min(1, 'GOOGLE_GENAI_API_KEY is required'),
  PINECONE_API_KEY: z.string().min(1, 'PINECONE_API_KEY is required'),
  PINECONE_INDEX: z.string().min(1, 'PINECONE_INDEX is required'),
  R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID is required'),
  R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required'),
  R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required'),
  R2_BUCKET: z.string().min(1, 'R2_BUCKET is required'),
  R2_ENDPOINT: z.string().min(1, 'R2_ENDPOINT is required'),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  RESEND_FROM_EMAIL: z.string().min(1, 'RESEND_FROM_EMAIL is required'),
  CLEANUP_SHARED_SECRET: z.string().min(1, 'CLEANUP_SHARED_SECRET is required'),
  APP_ORIGIN: z.string().min(1, 'APP_ORIGIN is required'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missingKeys = Object.keys(result.error.flatten().fieldErrors);
    console.error('FATAL: Invalid or missing environment configuration.');
    console.error(`Missing/Invalid key(s): ${missingKeys.join(', ')}`);
    // Crucial requirement: Never log raw process.env or secret values!
    process.exit(1);
  }

  return Object.freeze(result.data);
};

export const config = parseEnv();
export default config;
