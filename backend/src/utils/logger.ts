/**
 * Logger utility for consistent logging across the application
 * Controls console output based on environment
 */
export const logger = {
  /**
   * Log informational messages (only in development)
   */
  log: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(message, ...args);
    }
  },

  /**
   * Log info messages (shown in development and production)
   */
  info: (message: string, ...args: any[]) => {
    console.info(message, ...args);
  },

  /**
   * Log error messages (always shown)
   */
  error: (message: string, ...args: any[]) => {
    console.error(message, ...args);
  },

  /**
   * Log warning messages (always shown)
   */
  warn: (message: string, ...args: any[]) => {
    console.warn(message, ...args);
  },

  /**
   * Log debug messages (only in development and when DEBUG=true)
   */
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production' && process.env.DEBUG === 'true') {
      console.debug(message, ...args);
    }
  }
};

export default logger; 