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
  UPSTASH_VECTOR_REST_URL: string;
  UPSTASH_VECTOR_REST_TOKEN: string;
  GEMINI_API_KEY: string;
  GEMINI_PRO_API_KEY: string;
  CLERK_SECRET_KEY: string;
  CORS_ORIGIN: string;
  ENABLE_CHANGE_STREAMS: boolean;
}

// Define and validate environment variables
const env: EnvConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/zemon',
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || '',
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  UPSTASH_VECTOR_REST_URL: process.env.UPSTASH_VECTOR_REST_URL || '',
  UPSTASH_VECTOR_REST_TOKEN: process.env.UPSTASH_VECTOR_REST_TOKEN || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_PRO_API_KEY: process.env.GEMINI_PRO_API_KEY || '',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  ENABLE_CHANGE_STREAMS: process.env.ENABLE_CHANGE_STREAMS === 'true',
};

// Validate required environment variables
const requiredEnvVars = [
  'MONGO_URI',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'UPSTASH_VECTOR_REST_URL',
  'UPSTASH_VECTOR_REST_TOKEN',
  'GEMINI_API_KEY',
  'GEMINI_PRO_API_KEY',
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

// In development, warn about missing RAG system variables
if (env.NODE_ENV === 'development') {
  const ragSystemVars = [
    'UPSTASH_VECTOR_REST_URL',
    'UPSTASH_VECTOR_REST_TOKEN',
    'GEMINI_API_KEY',
    'GEMINI_PRO_API_KEY',
  ];
  
  for (const key of ragSystemVars) {
    if (!env[key as keyof EnvConfig]) {
      console.warn(`Warning: ${key} is not defined. RAG system features may not work correctly.`);
    }
  }
}

export default env; 