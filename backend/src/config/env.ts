import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  CLERK_SECRET_KEY: string;
  CORS_ORIGIN: string;
}

// Define and validate environment variables
const env: EnvConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/zemon',
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || '',
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Validate required environment variables
const requiredEnvVars = [
  'MONGO_URI',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
];

// Always validate Clerk Secret Key, regardless of environment
if (!env.CLERK_SECRET_KEY) {
  throw new Error('FATAL ERROR: CLERK_SECRET_KEY is not defined.');
}

// In production, we strictly check other required environment variables
if (env.NODE_ENV === 'production') {
  for (const key of requiredEnvVars) {
    if (!env[key as keyof EnvConfig]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

export default env; 