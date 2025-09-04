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
  SERPAPI_KEY: string;
  CLERK_SECRET_KEY: string;
  CLERK_JWT_KEY: string;
  CLERK_ISSUER: string;
  CORS_ORIGIN: string;
  ENABLE_CHANGE_STREAMS: boolean;
  // Solution Analysis Provider Configuration
  SOLUTION_ANALYSIS_PROVIDER: string;
  OPENROUTER_ANALYSIS_MODEL: string;
  ENABLE_ANALYSIS_FALLBACK: boolean;
  ANALYSIS_PROVIDER_TIMEOUT: number;
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
  SERPAPI_KEY: process.env.SERPAPI_KEY || '',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
  CLERK_JWT_KEY: process.env.CLERK_JWT_KEY || '',
  CLERK_ISSUER: process.env.CLERK_ISSUER || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  ENABLE_CHANGE_STREAMS: process.env.ENABLE_CHANGE_STREAMS === 'true',
  // Solution Analysis Provider Configuration (defaults to 'gemini' for backward compatibility)
  SOLUTION_ANALYSIS_PROVIDER: process.env.SOLUTION_ANALYSIS_PROVIDER || 'gemini',
  OPENROUTER_ANALYSIS_MODEL: process.env.OPENROUTER_ANALYSIS_MODEL || 'anthropic/claude-3.5-sonnet',
  ENABLE_ANALYSIS_FALLBACK: process.env.ENABLE_ANALYSIS_FALLBACK === 'true',
  ANALYSIS_PROVIDER_TIMEOUT: parseInt(process.env.ANALYSIS_PROVIDER_TIMEOUT || '30000', 10),
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
  'SERPAPI_KEY',
];

// Always validate Clerk Secret Key, regardless of environment
if (!env.CLERK_SECRET_KEY) {
  throw new Error('FATAL ERROR: CLERK_SECRET_KEY is not defined.');
}

// Always validate Clerk JWT Key and Issuer, regardless of environment
if (!env.CLERK_JWT_KEY) {
  throw new Error('FATAL ERROR: CLERK_JWT_KEY is not defined.');
}

if (!env.CLERK_ISSUER) {
  throw new Error('FATAL ERROR: CLERK_ISSUER is not defined.');
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
    'SERPAPI_KEY',
  ];
  
  for (const key of ragSystemVars) {
    if (!env[key as keyof EnvConfig]) {
      console.warn(`Warning: ${key} is not defined. RAG system features may not work correctly.`);
    }
  }
}

export default env; 