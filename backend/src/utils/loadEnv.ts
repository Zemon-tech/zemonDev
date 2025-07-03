import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

/**
 * Loads environment variables from .env file
 * Tries multiple possible locations to find the .env file
 */
export function loadEnv() {
  // Try different possible locations for the .env file
  const possiblePaths = [
    '.env',                          // Current directory
    '../.env',                       // One level up
    '../../.env',                    // Two levels up
    path.resolve(process.cwd(), '.env'),  // Absolute path from current working directory
  ];
  
  // Log the current working directory for debugging
  console.log('Current working directory:', process.cwd());
  
  // Try each path until we find the .env file
  for (const envPath of possiblePaths) {
    try {
      if (fs.existsSync(envPath)) {
        console.log(`Found .env file at: ${envPath}`);
        dotenv.config({ path: envPath });
        return true;
      }
    } catch (error) {
      // Ignore errors
    }
  }
  
  // If we get here, we couldn't find the .env file
  console.warn('Warning: Could not locate .env file');
  
  // Load .env from the default location as a fallback
  dotenv.config();
  
  return false;
}

// Export environment variables directly
export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || '';
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || ''; 